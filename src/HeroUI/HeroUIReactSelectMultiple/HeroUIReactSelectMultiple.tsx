import React, {useCallback, useId, useMemo, useState} from "react";
import Select, {type MultiValue, type Props as ReactSelectProps} from "react-select";
import {Label, Tooltip} from "@heroui/react";
import type {HeroUISelectOption, HeroUITooltipConfig} from "../HeroUIUtils/types";
// Global CSS shared with `HeroUIReactSelectSingle` (not a module: react-select names
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

interface HeroUIReactSelectMultipleProps {
    /** Aria label for accessibility. Defaults to `"Select multiple"`. */
    ariaLabel?: string;
    /** Visible label above the field. Optional. */
    label?: React.ReactNode;
    /** Options to render inside the menu. */
    options: HeroUISelectOption[];
    /**
     * Currently selected option ids.
     *
     * A fresh array is emitted on every change, so the parent can compare by
     * reference.
     */
    value?: readonly string[];
    /** Fired with the full list of selected ids whenever the selection changes. */
    onChange?: (value: string[]) => void;
    /** Current input text. Controlled by the parent for async search. */
    inputValue?: string;
    /**
     * Fired on every input keystroke.
     * The parent should use it to trigger the async server-side search.
     */
    onInputChange?: (value: string) => void;
    /** Input placeholder. Defaults to `"Type to search..."`. */
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
    /** Shows an `x` to clear the whole selection. Defaults to `false`. */
    isClearable?: boolean;
    /**
     * Closes the menu after every pick.
     *
     * Defaults to `true`: in multiple selection each pick closes the list, so the field
     * with its chips can be seen. Set it to `false` to tick several in a row.
     * @default true
     */
    closeMenuOnSelect?: boolean;
    /**
     * Hides from the menu the options that are already selected.
     * @default true
     */
    hideSelectedOptions?: boolean;
    /**
     * Clears the search input after every selection.
     *
     * With `true`, after picking you have to type again to search for something else,
     * but the option list **is kept**, so you can keep selecting without typing. With
     * `false` the text stays and serves to tick several matches in a row.
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
 * `HeroUIReactSelectMultiple`
 *
 * Multiple-selection select built on **`react-select` v5** (not on the HeroUI
 * ComboBox). The reason is that react-select renders the chips of what is selected
 * **inside the control itself**, which is exactly what the HeroUI ComboBox cannot do
 * cleanly in a narrow field.
 *
 * ### Appearance
 *
 * It mounts with `unstyled`, meaning **none of the react-select styles**: the whole
 * look comes from `HeroUIUtils/reactSelect.css` using the HeroUI theme tokens
 * (`--field-*`, `--surface`, `--accent`...). That way the field follows the
 * `HeroUIThemes` presets and looks like the rest of the project fields.
 *
 * ### Behaviour
 * - Multiple selection: every picked option **is added** and shows as a chip inside
 *   the control; its `x` removes it.
 * - `closeMenuOnSelect` (default `true`): every pick closes the list, so the chips can
 *   be seen. Set it to `false` to tick several in one go.
 * - **Async search**: `filterOption` is disabled, so filtering is done by the server.
 *   The parent receives `onInputChange` and serves `options`.
 * - Required validation like the rest of the fields: the error appears after the first
 *   `onBlur`, not on mount.
 *
 * ### Implementation notes
 * - Selected ids are resolved to labels through a map that **remembers the options seen
 *   so far**: with async search `options` is replaced on every search, and without that
 *   map the chips of what is already selected would be left with no text.
 * - The visible label is associated with the real `<input>` through `inputId` +
 *   `htmlFor`, like in the rest of the components.
 *
 * ### Example
 * ```tsx
 * const [selected, setSelected] = useState<string[]>([]);
 *
 * <HeroUIReactSelectMultiple
 *   label="Teams"
 *   options={options}
 *   value={selected}
 *   onChange={setSelected}
 *   onInputChange={search}
 *   isRequired
 *   requiredMessage="Pick at least one team"
 *   tooltip="You can select several"
 * />
 * ```
 */
const HeroUIReactSelectMultiple: React.FC<HeroUIReactSelectMultipleProps> = ({
                                                                                 ariaLabel = "Select multiple",
                                                                                 label,
                                                                                 options,
                                                                                 value,
                                                                                 onChange,
                                                                                 inputValue,
                                                                                 onInputChange,
                                                                                 placeholder = "Type to search...",
                                                                                 width = "195px",
                                                                                 className = "",
                                                                                 tooltip,
                                                                                 isDisabled = false,
                                                                                 isLoading = false,
                                                                                 noResultsText = "No results found",
                                                                                 loadingText = "Loading...",
                                                                                 isClearable = false,
                                                                                 closeMenuOnSelect = true,
                                                                                 hideSelectedOptions = true,
                                                                                 clearInputOnSelect = true,
                                                                                 isRequired = false,
                                                                                 requiredMessage = "This field is required",
                                                                             }) => {
    /** The required error only shows after the first onBlur, not on mount. */
    const [isTouched, setIsTouched] = useState(false);

    /**
     * Labels of what is already picked, memorised by id.
     *
     * It is filled **from the change handler** (never during render, which is not
     * allowed), and it lets a chip keep its text even if the option list is emptied
     * afterwards, which happens when the async search is left with no query. Without
     * it the chip showed the raw id.
     */
    const [etiquetasVistas, setEtiquetasVistas] = useState<Record<string, string>>({});

    /** Id of the inner `<input>`, so the visible label can be associated with it. */
    const inputId = `${useId()}-input`;

    /** Selected ids normalised to a mutable array. */
    const selectedIds = useMemo(() => (value ? [...value] : []), [value]);

    const isInvalid = isTouched && isRequired && selectedIds.length === 0;

    /**
     * Id -> option map, used to resolve the label of every chip.
     *
     * With async search `options` only carries what the last query returned (and it is
     * emptied when the query is short), so on its own it is not enough: it is combined
     * with the `etiquetasVistas` cache (see below).
     */
    const optionsById = useMemo(() => {
        const map = new Map<string, HeroUISelectOption>();
        options.forEach((opt) => map.set(String(opt.id), opt));
        return map;
    }, [options]);

    /**
     * Last NON-empty option list, pinned on selection.
     *
     * The search input is cleared after every selection, and in async search the parent
     * normally empties its options when the query becomes short. Without pinning them,
     * the menu would be left with no items and you could not keep picking without
     * typing again. It is updated **from the handler** (not during render, which is not
     * allowed).
     */
    const [opcionesFijadas, setOpcionesFijadas] = useState<HeroUISelectOption[]>([]);

    /** The ones handed to react-select: the current ones, or the pinned ones if none. */
    const opcionesEfectivas = options.length > 0 ? options : opcionesFijadas;

    /** Selected options, resolved from the ids. */
    const selectedOptions = useMemo<HeroUISelectOption[]>(
        () => selectedIds.map((id) => {
            const clave = String(id);
            return optionsById.get(clave)
                ?? {id: clave, label: etiquetasVistas[clave] ?? clave};
        }),
        [selectedIds, optionsById, etiquetasVistas]
    );

    /** Always emits a fresh array of ids. */
    const handleChange = useCallback((picked: MultiValue<HeroUISelectOption>) => {
        const ids = picked.map((opt) => String(opt.id));

        // The label of EVERYTHING selected is memorised: what was picked in this action
        // comes in `picked`, and the previous ones are resolved from the current options
        // or from what is already memorised. That way no chip is left showing the id.
        setEtiquetasVistas((prev) => {
            const next = {...prev};
            ids.forEach((id) => {
                const elegida = picked.find((opt) => String(opt.id) === id);
                next[id] = elegida?.label ?? optionsById.get(id)?.label ?? prev[id] ?? id;
            });
            return next;
        });

        // The list the user just saw is pinned: when the search input is cleared the parent
        // may empty its options, and this way the menu keeps them so you can keep selecting
        // without typing again.
        if (options.length > 0) setOpcionesFijadas(options);

        onChange?.(ids);

        // Picking or removing means the field has been used: from here on the required rule
        // is validated. Without this, removing the last chip with its `x` did not mark the
        // field as invalid, because that click does not fire `onBlur`.
        setIsTouched(true);

        // The text is cleared so the user has to type if they want to search for something
        // else. No search is triggered: the parent receives "" and only updates its text
        // state.
        if (clearInputOnSelect) onInputChange?.("");
    }, [onChange, onInputChange, optionsById, options, clearInputOnSelect]);

    /**
     * Only what **the user types** (`input-change`) is forwarded to the parent.
     *
     * react-select empties its own input when an option is picked and notifies with
     * `set-value` / `menu-close`. If that empty value reached the parent it would wipe its
     * option list and no further option could be picked without retyping the search.
     * Filtering by action keeps the options and allows chaining selections.
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
         * its own from emotion), so it is passed by hand: `.hrui-select__container` brings
         * the `position: relative` that anchors the menu and the `width: 100%`.
         *
         * `className` is used and NOT `classNames`: in react-select v5 `classNames` is a
         * map of element -> **function** returning the class, and passing it a string
         * blows up at runtime with "className.call is not a function".
         */
        className: "hrui-select__container",
        inputId,
        isMulti: true,
        options: opcionesEfectivas,
        value: selectedOptions,
        /**
         * CRITICAL: by default react-select reads `option.value` and `option.label`, but the
         * project options are `{id, label}`. Without these two mappings every option has
         * `value: undefined`, react-select treats them as the SAME one and
         * `hideSelectedOptions` hides all of them: the menu stays at "No results found"
         * and a second option cannot be picked.
         */
        getOptionValue: (opt: HeroUISelectOption) => String(opt.id),
        getOptionLabel: (opt: HeroUISelectOption) => opt.label,
        onChange: handleChange,
        inputValue,
        onInputChange: handleInputChange,
        // Filtering is done by the server: react-select must not filter on the client.
        filterOption: null,
        placeholder,
        isDisabled,
        isLoading,
        isClearable,
        closeMenuOnSelect,
        hideSelectedOptions,
        controlShouldRenderValue: true,
        noOptionsMessage: () => noResultsText,
        loadingMessage: () => loadingText,
        onBlur: () => setIsTouched(true),
        "aria-label": label ? undefined : ariaLabel,
        "aria-invalid": isInvalid || undefined,
        "aria-required": isRequired || undefined,
        menuPlacement: "auto" as const,
    } as unknown as ReactSelectProps<HeroUISelectOption, true>;

    const field = (
        /**
         * `data-invalid` goes on this wrapper, which we do control, and not on the
         * react-select control: the `aria-invalid` prop ends up on its inner `<input>`, so a
         * `.hrui-select__control[aria-invalid="true"]` selector would never match and the
         * field never turned red.
         */
        <div
            className={`min-w-0 ${className}`.trim()}
            style={{width}}
            data-invalid={isInvalid || undefined}
        >
            {label && <Label htmlFor={inputId}>{label}</Label>}

            <Select<HeroUISelectOption, true> {...selectProps}/>

            {/*
             * Own error message, not `<FieldError>`: the HeroUI one reads the validation
             * state from the react-aria context, and react-select is not a react-aria field,
             * so it rendered nothing. Its look is replicated (collapsed to zero height and
             * expanded when invalid) so it shows and behaves like in the rest of the fields.
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

HeroUIReactSelectMultiple.displayName = "HeroUIReactSelectMultiple";

export default HeroUIReactSelectMultiple;
