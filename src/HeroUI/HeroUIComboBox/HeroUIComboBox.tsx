import React, {useState} from "react";
import {ComboBox, FieldError, Input, Label, ListBox, Spinner, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


/**
 * Single option rendered inside the ComboBox `ListBox`.
 */
export interface HeroUIComboBoxOption {
    /** Unique option identifier. Used as the `id` of the `ListBox.Item`. */
    id: string;
    /** Visible option text. Used as `textValue` and label. */
    label: string;
}

interface HeroUIComboBoxProps {
    /** Aria label for accessibility. Defaults to `"ComboBox"`. */
    ariaLabel?: string;
    /** Visible label above the ComboBox. Optional. */
    label?: React.ReactNode;
    /** List of options to render inside the popover. */
    options: HeroUIComboBoxOption[];
    /** Currently selected option id. Empty or `undefined` means no selection. */
    value?: string;
    /**
     * Fired when the selection changes.
     * Receives `""` when the selection is cleared (empty input or deselected item).
     */
    onChange?: (value: string) => void;
    /** Current input text. Controlled by the parent for async search. */
    inputValue?: string;
    /**
     * Fired on every input keystroke.
     * The parent should use it to trigger the async server-side search.
     */
    onInputChange?: (value: string) => void;
    /** Input placeholder. Defaults to `"Type to search..."`. */
    placeholder?: string;
    /** ComboBox width. Defaults to `"195px"`. */
    width?: string | number;
    /** Additional CSS classes for the ComboBox. */
    className?: string;
    /** Optional tooltip. Accepts a string or a full config object. */
    tooltip?: string | HeroUITooltipConfig;
    /** Disables the ComboBox. Defaults to `false`. */
    isDisabled?: boolean;
    /** Shows a spinner while options are loading. Defaults to `false`. */
    isLoading?: boolean;
    /** Text shown when there are no results. Defaults to `"No results found"`. */
    noResultsText?: string;
    /**
     * Marks the field as required.
     * When `true` and the value is empty, `isInvalid` becomes `true`
     * and the `FieldError` is displayed.
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
 * `HeroUIComboBox`
 *
 * Single-selection ComboBox built on HeroUI v3.
 *
 * Features:
 * - The parent is responsible for fetching options via `onInputChange`
 *   (async server-side search).
 * - The popover opens automatically while typing (`menuTrigger="input"`).
 * - `allowsEmptyCollection` keeps the popover open while the server
 *   has not returned results yet.
 * - To clear the selection, the user simply empties the input.
 * - **Required validation**: when `isRequired` is `true` and the value is
 *   empty, a `FieldError` is displayed below the input.
 * - Border radius is 5px (`rounded-[5px]`) for a squarer look.
 *
 * For multiple selection, use `HeroUIComboBoxMultiple`.
 */
const HeroUIComboBox: React.FC<HeroUIComboBoxProps> = ({
                                                           ariaLabel = "ComboBox",
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
                                                           isRequired = false,
                                                           requiredMessage = "This field is required",
                                                       }) => {
    /**
     * The field is invalid when it's required but has no value.
     * An empty string also counts as empty.
     */
    /** El error de obligatorio se muestra tras el primer onBlur, no al montar. */
    const [isTouched, setIsTouched] = useState(false);

    const isInvalid = isTouched && isRequired && (!value || value === "");

    /**
     * Wraps `onInputChange` to detect when the user clears the input.
     *
     * Flow:
     * 1. Notifies the parent about the text change (so it can trigger the search).
     * 2. If the input becomes empty and there was a previous selection,
     *    fires `onChange("")` to clear the selection.
     *
     * @param query - Current input text.
     */
    const handleInputChange = (query: string) => {
        onInputChange?.(query);

        if (query === "" && value) {
            onChange?.("");
        }
    };

    const field = (
        <ComboBox
            aria-label={label ? undefined : ariaLabel}
            className={`rounded-[5px] ${className}`.trim()}
            style={{width}}
            selectedKey={value ?? null}
            onSelectionChange={(key) => onChange?.(key == null ? "" : String(key))}
            inputValue={inputValue}
            onInputChange={handleInputChange}
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

HeroUIComboBox.displayName = "HeroUIComboBox";

export default HeroUIComboBox;