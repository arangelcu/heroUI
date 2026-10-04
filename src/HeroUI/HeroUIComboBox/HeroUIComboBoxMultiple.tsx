import React, {useCallback, useMemo, useState} from "react";
import {Chip, ComboBox, FieldError, Input, Label, ListBox, Spinner, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";
import {HeroUIComboBoxOption} from "./HeroUIComboBox";

export type {HeroUIComboBoxOption};

/** Where the chips of what is selected are placed. */
export type HeroUIComboBoxChipsPlacement = "below" | "above";

interface HeroUIComboBoxMultipleProps {
    /** Aria label for accessibility. Defaults to `"ComboBox multiple"`. */
    ariaLabel?: string;
    /** Visible label above the ComboBox. Optional. */
    label?: React.ReactNode;
    /** List of options to render inside the popover. */
    options: HeroUIComboBoxOption[];
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
    /** ComboBox width. Defaults to `"195px"`, same as the rest of the fields. */
    width?: string | number;
    /** Additional CSS classes for the ComboBox. */
    className?: string;
    /** Additional CSS classes for the selected-items row. */
    chipsClassName?: string;
    /**
     * Where the chips of what is selected are painted.
     *
     * They go **outside** the field, in their own row: putting them inside a 195px
     * field forces them to take the full width and the search input ends up below,
     * which looks worse.
     * @default "below"
     */
    chipsPlacement?: HeroUIComboBoxChipsPlacement;
    /** Optional tooltip. Accepts a string or a full config object. */
    tooltip?: string | HeroUITooltipConfig;
    /** Disables the ComboBox. Defaults to `false`. */
    isDisabled?: boolean;
    /** Shows a spinner while options are loading. Defaults to `false`. */
    isLoading?: boolean;
    /** Text shown when there are no results. Defaults to `"No results found"`. */
    noResultsText?: string;
    /**
     * Shows an `x` on each chip to remove that specific option.
     * @default true
     */
    isChipRemovable?: boolean;
    /**
     * Marks the field as required.
     * When `true` and no option is selected, `isInvalid` becomes `true`
     * and the `FieldError` is displayed after the first interaction.
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
 * `HeroUIComboBoxMultiple`
 *
 * **Multiple-selection** ComboBox built on HeroUI v3, sibling of `HeroUIComboBox`.
 *
 * ### How the selected items are shown
 *
 * The chips go **in their own row, outside the field** (`chipsPlacement`), not inside.
 * Putting them inside was tried and with a 195px field it is not viable: the chips take
 * the full width and the search input has to drop to another line, which makes the field
 * look taller and messy. The field stays identical to the one of the single combo and
 * the chips appear below it.
 *
 * ### Behaviour
 * - Multiple selection: picking an option **adds** it; picking it again removes it.
 * - `ListBox` with `selectionMode="multiple"` shows a check per option.
 * - The list **stays open** after picking, so several can be ticked in a row (it closes
 *   with `Escape` or by clicking outside).
 * - Every chip carries an `x` to remove it without opening the popover.
 * - The search input is async: the parent receives `onInputChange` and serves `options`.
 * - Required validation like the rest of the fields: the error appears after the first
 *   `onBlur`, not on mount.
 *
 * ### State
 *
 * It uses the current API (`value` + `onChange`, from `ValueBase`). `selectedKey` and
 * `onSelectionChange` are **deprecated** in react-stately. Note: the single-selection
 * `HeroUIComboBox` still uses the deprecated ones.
 *
 * ### Example
 * ```tsx
 * const [selected, setSelected] = useState<string[]>([]);
 *
 * <HeroUIComboBoxMultiple
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
const HeroUIComboBoxMultiple: React.FC<HeroUIComboBoxMultipleProps> = ({
                                                                           ariaLabel = "ComboBox multiple",
                                                                           label,
                                                                           options,
                                                                           value,
                                                                           onChange,
                                                                           inputValue,
                                                                           onInputChange,
                                                                           placeholder = "Type to search...",
                                                                           width = "195px",
                                                                           className = "",
                                                                           chipsClassName = "",
                                                                           chipsPlacement = "below",
                                                                           tooltip,
                                                                           isDisabled = false,
                                                                           isLoading = false,
                                                                           noResultsText = "No results found",
                                                                           isChipRemovable = true,
                                                                           isRequired = false,
                                                                           requiredMessage = "This field is required",
                                                                       }) => {
    /** The required error only shows after the first onBlur, not on mount. */
    const [isTouched, setIsTouched] = useState(false);

    /** Selected ids normalised to a mutable array. */
    const selectedIds = useMemo(() => (value ? [...value] : []), [value]);

    const isInvalid = isTouched && isRequired && selectedIds.length === 0;

    /** react-aria `Key`s are `string | number`: they are compared as strings. */
    const selectedKeys = useMemo(
        () => selectedIds.map((id) => String(id)),
        [selectedIds]
    );

    /** To resolve the label of every id from the loaded options. */
    const optionsById = useMemo(() => {
        const map = new Map<string, HeroUIComboBoxOption>();
        options.forEach((opt) => map.set(String(opt.id), opt));
        return map;
    }, [options]);

    /**
     * Chips to paint, resolved from `value`.
     *
     * `ComboBox.Value` is not used because its render prop can only draw inside the
     * field; since the chips go outside, they are resolved here.
     */
    const chips = useMemo(
        () => selectedIds.map((id) => ({
            id: String(id),
            text: optionsById.get(String(id))?.label ?? String(id),
        })),
        [selectedIds, optionsById]
    );

    /**
     * Always emits a fresh array, so the parent can compare by reference without
     * worrying about mutations.
     */
    const emit = useCallback((keys: Iterable<React.Key>) => {
        onChange?.([...keys].map(String));
    }, [onChange]);

    /** Removes an option from the `x` of the chip. */
    const removeOption = useCallback((id: string) => {
        emit(selectedKeys.filter((key) => key !== id));
    }, [emit, selectedKeys]);

    const chipsRow = chips.length > 0 && (
        <div
            className={`flex min-w-0 flex-wrap items-center gap-1 text-left ${chipsPlacement === "below" ? "mt-1" : "mb-1"} ${chipsClassName}`.trim()}
        >
            {chips.map(({id, text}) => (
                <Chip
                    key={id}
                    size="sm"
                    variant="soft"
                    className="max-w-full !h-5 !px-1.5 !text-[11px]"
                >
                    <span className="max-w-[90px] truncate">{text}</span>
                    {isChipRemovable && (
                        <button
                            type="button"
                            aria-label={`Quitar ${text}`}
                            className="ms-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-full text-muted hover:text-foreground"
                            onClick={(event) => {
                                // Without this the click would reach the input and open the popover.
                                event.stopPropagation();
                                event.preventDefault();
                                removeOption(id);
                            }}
                        >
                            <Icon className="size-2.5" icon="fa6-solid:xmark"/>
                        </button>
                    )}
                </Chip>
            ))}
        </div>
    );

    const field = (
        /* The container takes the SAME width as the field through a CSS variable, so the
           chip row wraps at those 195px. With `max-w-full` alone, the limit was the one
           of the column containing it (211px in the demo) and the chips stretched beyond
           the field. `w-fit` stops the wrapper from stretching when there is more room
           than needed. */
        <div
            className="w-fit"
            style={{width, maxWidth: "100%", ["--combo-width" as string]: typeof width === "number" ? `${width}px` : width}}
        >
            <ComboBox
                aria-label={label ? undefined : ariaLabel}
                className={`rounded-[5px] w-full ${className}`.trim()}
                style={{width: "100%"}}
                selectionMode="multiple"
                value={selectedKeys}
                onChange={emit}
                inputValue={inputValue}
                onInputChange={(query) => onInputChange?.(query)}
                isDisabled={isDisabled}
                isRequired={isRequired}
                isInvalid={isInvalid}
                validationBehavior="aria"
                onBlur={() => setIsTouched(true)}
                menuTrigger="focus"
                allowsEmptyCollection
            >
                {label && <Label>{label}</Label>}

                <ComboBox.InputGroup className="rounded-[5px]">
                    <Input className="rounded-[5px]" placeholder={placeholder}/>

                    {isLoading && <Spinner className="size-4"/>}

                    <ComboBox.Trigger className="rounded-[5px]"/>
                </ComboBox.InputGroup>

                {/* FieldError only renders when isInvalid is true */}
                <FieldError>{requiredMessage}</FieldError>

                <ComboBox.Popover className="rounded-[5px]">
                    <ListBox
                        selectionMode="multiple"
                        renderEmptyState={() => (
                            <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
                                <Icon className="size-6 text-muted" icon="fa6-solid:inbox"/>
                                <span className="text-sm text-muted">{noResultsText}</span>
                            </div>
                        )}
                    >
                        {options.map((opt) => (
                            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                {opt.label}
                                <ListBox.ItemIndicator/>
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </ComboBox.Popover>
            </ComboBox>

            {chipsPlacement === "above" && chipsRow}
            {chipsPlacement === "below" && chipsRow}
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

HeroUIComboBoxMultiple.displayName = "HeroUIComboBoxMultiple";

export default HeroUIComboBoxMultiple;
