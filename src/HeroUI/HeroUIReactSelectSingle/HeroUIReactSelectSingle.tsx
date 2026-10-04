import React, {useCallback, useId, useMemo, useState} from "react";
import Select, {type Props as ReactSelectProps, type SingleValue} from "react-select";
import {Label, Tooltip} from "@heroui/react";
import type {HeroUISelectOption, HeroUITooltipConfig} from "../HeroUIUtils/types";
// Global CSS shared with `HeroUIReactSelectMultiple` (not a module: react-select names
// its classes from `classNamePrefix`).
import "../HeroUIUtils/reactSelect.css";

/**
 * Option type of the select.
 *
 * The shared `HeroUISelectOption` is used instead of the `HeroUIComboBoxOption` of the
 * HeroUI ComboBox: they are identical, but this way the component does not depend on a
 * sibling it does not need.
 */
export type HeroUIReactSelectOption = HeroUISelectOption;

/**
 * Prefix of the classes react-select applies to its DOM.
 *
 * The styles live in `HeroUIUtils/reactSelect.css` as **global** CSS (`.hrui-select__*`),
 * not imported as a module: with `classNamePrefix` react-select generates those names,
 * so they have to be targetable by name.
 */
const CLASS_PREFIX = "hrui-select";

interface HeroUIReactSelectSingleProps {
    /** Aria label for accessibility. Defaults to `"Select"`. */
    ariaLabel?: string;
    /** Visible label above the field. Optional. */
    label?: React.ReactNode;
    /** Options to render inside the menu. */
    options: HeroUISelectOption[];
    /** Currently selected option id, or `""` for none. */
    value?: string;
    /** Fired with the selected id, or `""` when the selection is cleared. */
    onChange?: (value: string) => void;
    /** Current input text. Controlled by the parent for async search. */
    inputValue?: string;
    /**
     * Fired on every input keystroke.
     * The parent should use it to trigger the async server-side search.
     */
    onInputChange?: (value: string) => void;
    /** Input placeholder. Defaults to `"Type to search..."` / `"Select an option"`. */
    placeholder?: string;
    /** Field width. Defaults to `"195px"`, same as the rest of the fields. */
    width?: string | number;
    /** Additional CSS classes for the wrapper. */
    className?: string;
    /** Optional tooltip. Accepts a string or a full config object. */
    tooltip?: string | HeroUITooltipConfig;
    /** Disables the field. Defaults to `false`. */
    isDisabled?: boolean;
    /** Shows a loading message while options are being fetched. Defaults to `false`. */
    isLoading?: boolean;
    /** Text shown when there are no results. Defaults to `"No results found"`. */
    noResultsText?: string;
    /** Text shown while loading. Defaults to `"Loading..."`. */
    loadingText?: string;
    /**
     * Allows typing to filter.
     *
     * With `false` the field works as a plain dropdown (nothing can be typed) and the
     * placeholder changes to `"Select an option"` unless another one is given.
     * @default true
     */
    isSearchable?: boolean;
    /** Shows an `x` to clear the selection. Defaults to `true`. */
    isClearable?: boolean;
    /**
     * Clears the search input after every selection.
     *
     * With `true` the option list **is kept**, so the menu can be reopened and another
     * option picked without typing.
     * @default true
     */
    clearInputOnSelect?: boolean;
    /**
     * Marks the field as required.
     * When `true` and nothing is selected, `isInvalid` becomes `true` and the error
     * message is displayed after the first interaction.
     * @default false
     */
    isRequired?: boolean;
    /**
     * Custom error message shown when the field is required and empty.
     * @default "This field is required"
     */
    requiredMessage?: string;
}

/**
 * `HeroUIReactSelectSingle`
 *
 * **Single-selection** select built on `react-select` v5, sibling of
 * `HeroUIReactSelectMultiple`. While `HeroUIComboBox` leans on the HeroUI ComboBox, this
 * one uses react-select so it can mount **without its styles** (`unstyled`) and take its
 * whole look from the HeroUI theme tokens.
 *
 * ### Behaviour
 * - One option only: picking one replaces the previous one.
 * - `isSearchable` (default `true`) allows typing to filter. With `false` it works as a
 *   plain dropdown.
 * - `isClearable` (default `true`) shows an `x` to leave the field empty.
 * - **Async search**: `filterOption` is disabled, so filtering is done by the server.
 *   The parent receives `onInputChange` and serves `options`.
 * - Required validation like the rest of the fields: the error appears after the first
 *   `onBlur` (or after the first change), not on mount.
 *
 * ### Implementation notes
 * - `getOptionValue`/`getOptionLabel` are mapped to the project `id`/`label` fields.
 *   Without that mapping react-select reads `option.value` (nonexistent) and treats every
 *   option as the same one, so the menu is left empty.
 * - The picked option is resolved against the current options and, if it is no longer
 *   there (the search input was cleared), against the label memorised on pick: that way
 *   the displayed value never falls back to the raw id.
 * - The invalid state is marked with `data-invalid` on the wrapper and painted with
 *   `box-shadow` in the CSS: react-select declares `outline: 0 !important` on its control,
 *   so an outline would never be visible.
 *
 * ### Example
 * ```tsx
 * const [selected, setSelected] = useState("");
 *
 * <HeroUIReactSelectSingle
 *   label="Owner"
 *   options={options}
 *   value={selected}
 *   onChange={setSelected}
 *   onInputChange={search}
 *   isRequired
 *   requiredMessage="Pick an owner"
 *   tooltip="Type to search"
 * />
 * ```
 */
const HeroUIReactSelectSingle: React.FC<HeroUIReactSelectSingleProps> = ({
                                                                             ariaLabel = "Select",
                                                                             label,
                                                                             options,
                                                                             value = "",
                                                                             onChange,
                                                                             inputValue,
                                                                             onInputChange,
                                                                             placeholder,
                                                                             width = "195px",
                                                                             className = "",
                                                                             tooltip,
                                                                             isDisabled = false,
                                                                             isLoading = false,
                                                                             noResultsText = "No results found",
                                                                             loadingText = "Loading...",
                                                                             isSearchable = true,
                                                                             isClearable = true,
                                                                             clearInputOnSelect = true,
                                                                             isRequired = false,
                                                                             requiredMessage = "This field is required",
                                                                         }) => {
    /** The required error only shows after the first interaction, not on mount. */
    const [isTouched, setIsTouched] = useState(false);

    /** Id of the inner `<input>`, so the visible label can be associated with it. */
    const inputId = `${useId()}-input`;

    const isInvalid = isTouched && isRequired && !value;

    /** Label of what is picked, memorised on selection (see `handleChange`). */
    const [etiquetaVista, setEtiquetaVista] = useState("");

    /**
     * Last NON-empty option list, pinned on selection.
     *
     * On selection the search input is cleared, and in async search the parent normally
     * empties its options on short queries. By pinning them, reopening the menu without
     * typing still shows options to pick.
     */
    const [opcionesFijadas, setOpcionesFijadas] = useState<HeroUISelectOption[]>([]);

    /** The ones handed to react-select: the current ones, or the pinned ones if none. */
    const opcionesEfectivas = options.length > 0 ? options : opcionesFijadas;

    /** Id -> option map, used to resolve the selected value. */
    const optionsById = useMemo(() => {
        const map = new Map<string, HeroUISelectOption>();
        options.forEach((opt) => map.set(String(opt.id), opt));
        return map;
    }, [options]);

    /**
     * Value handed to react-select.
     *
     * If the option is no longer in `options` (which happens when the search input has
     * been cleared) it is rebuilt from the memorised label, so the field keeps showing
     * the name and not the id.
     */
    const selectedOption = useMemo<HeroUISelectOption | null>(() => {
        if (!value) return null;
        const clave = String(value);
        return optionsById.get(clave) ?? {id: clave, label: etiquetaVista || clave};
    }, [value, optionsById, etiquetaVista]);

    /** Emits the picked id, or `""` when it has been cleared. */
    const handleChange = useCallback((elegida: SingleValue<HeroUISelectOption>) => {
        if (elegida) {
            setEtiquetaVista(elegida.label);
        } else {
            setEtiquetaVista("");
        }

        // The list the user just saw is pinned, so reopening the menu without typing still
        // shows options.
        if (options.length > 0) setOpcionesFijadas(options);

        onChange?.(elegida ? String(elegida.id) : "");

        // As in the multiple combo: picking or clearing means there has been interaction, so
        // from here on the required rule is validated.
        setIsTouched(true);

        if (clearInputOnSelect) onInputChange?.("");
    }, [onChange, onInputChange, options, clearInputOnSelect]);

    /**
     * Only what **the user types** (`input-change`) is forwarded to the parent.
     *
     * react-select empties its own input on pick and notifies with `set-value` /
     * `menu-close`; if that empty value reached the parent it would wipe its option list.
     */
    const handleInputChange = useCallback((query: string, meta: {action: string}) => {
        if (meta.action !== "input-change") return;
        onInputChange?.(query);
    }, [onInputChange]);

    const selectProps = {
        unstyled: true,
        classNamePrefix: CLASS_PREFIX,
        /**
         * The container does not get the prefix class on its own (react-select puts one of
         * its own from emotion), so it is passed by hand. The `--single` modifier enables
         * the layout tweaks specific to single selection.
         *
         * `className` is used and NOT `classNames`: in react-select v5 `classNames` is a
         * map of element -> **function** returning the class, and passing it a string
         * blows up at runtime with "className.call is not a function".
         */
        className: "hrui-select__container hrui-select__container--single",
        inputId,
        isMulti: false,
        options: opcionesEfectivas,
        value: selectedOption,
        /**
         * CRITICAL: by default react-select reads `option.value` and `option.label`, but the
         * project options are `{id, label}`.
         */
        getOptionValue: (opt: HeroUISelectOption) => String(opt.id),
        getOptionLabel: (opt: HeroUISelectOption) => opt.label,
        onChange: handleChange,
        inputValue,
        onInputChange: handleInputChange,
        // Filtering is done by the server: react-select must not filter on the client.
        filterOption: null,
        isSearchable,
        isClearable,
        placeholder: placeholder ?? (isSearchable ? "Type to search..." : "Select an option"),
        isDisabled,
        isLoading,
        noOptionsMessage: () => noResultsText,
        loadingMessage: () => loadingText,
        onBlur: () => setIsTouched(true),
        "aria-label": label ? undefined : ariaLabel,
        "aria-invalid": isInvalid || undefined,
        "aria-required": isRequired || undefined,
        menuPlacement: "auto" as const,
    } as unknown as ReactSelectProps<HeroUISelectOption, false>;

    const field = (
        /**
         * `data-invalid` goes on this wrapper, which we do control, and not on the
         * react-select control: the `aria-invalid` prop ends up on its inner `<input>`, so a
         * selector on the control would never match.
         */
        <div
            className={`min-w-0 ${className}`.trim()}
            style={{width}}
            data-invalid={isInvalid || undefined}
        >
            {label && <Label htmlFor={inputId}>{label}</Label>}

            <Select<HeroUISelectOption, false> {...selectProps}/>

            {/*
             * Own error message, not `<FieldError>`: the HeroUI one reads the validation
             * state from the react-aria context, and react-select is not a react-aria field,
             * so it would render nothing.
             */}
            <div className="hrui-select__error">{requiredMessage}</div>
        </div>
    );

    if (!tooltip) return field;

    const config: HeroUITooltipConfig =
        typeof tooltip === "string" ? {text: tooltip} : tooltip;

    const {
        text,
        placement = "top",
        showArrow = false,
        delay = 0,
        className: tooltipClassName,
    } = config;

    return (
        <Tooltip delay={delay}>
            <Tooltip.Trigger>
                {field}
            </Tooltip.Trigger>
            <Tooltip.Content
                className={tooltipClassName}
                placement={placement}
                showArrow={showArrow}
            >
                {showArrow && <Tooltip.Arrow/>}
                <p>{text}</p>
            </Tooltip.Content>
        </Tooltip>
    );
};

HeroUIReactSelectSingle.displayName = "HeroUIReactSelectSingle";

export default HeroUIReactSelectSingle;
