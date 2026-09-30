import React from "react";
import {DateField, Label, Tooltip} from "@heroui/react";
import type {DateValue} from "@internationalized/date";

/**
 * Configuration for the tooltip shown on the date field.
 *
 * Can be provided either as a plain string (shorthand for just the text)
 * or as this full object for finer control.
 */
export interface HeroUITooltipConfig {
    /** Tooltip content. Accepts a string or ReactNode. */
    text: React.ReactNode;
    /** Tooltip placement relative to the field. Defaults to `"top"`. */
    placement?: "top" | "bottom" | "left" | "right";
    /** Shows or hides the tooltip arrow. Defaults to `false`. */
    showArrow?: boolean;
    /** Delay in ms before showing the tooltip. Defaults to `0`. */
    delay?: number;
    /** Additional CSS classes for the tooltip content. */
    className?: string;
}

interface HeroUIDateFieldProps {
    /** Aria label for accessibility. Defaults to `"Date field"`. */
    ariaLabel?: string;
    /** Optional visible label rendered above the field via the `Label` component. */
    label?: React.ReactNode;
    /** Controlled date value. `null` means no date selected. */
    value?: DateValue | null;
    /** Fired when the date changes. Receives the new value or `null`. */
    onChange?: (value: DateValue | null) => void;
    /** Field width. Defaults to `"195px"`. */
    width?: string | number;
    /** Additional CSS classes for the root DateField component. */
    className?: string;
    /** Disables the field. Defaults to `false`. */
    isDisabled?: boolean;
    /** Marks the field as required. Defaults to `false`. */
    isRequired?: boolean;
    /**
     * Optional tooltip shown on hover.
     * Accepts a string (shorthand) or a full config object.
     */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUIDateField`
 *
 * Date field built on HeroUI v3 `DateField`.
 *
 * ### Compact styling
 * The internal `DateField.Group` uses a smaller font size and tighter
 * spacing so it visually matches `HeroUIDatePicker` and
 * `HeroUIDateRangePicker` at ~195px.
 *
 * ### HeroUI v3 Notes
 * - **Compound components required**: Must use `DateField.Group`,
 *   `DateField.Input`, and `DateField.Segment` (the old `DateInputGroup`
 *   was consolidated under `DateField` in v3).
 * - **Label**: Rendered via the separate `<Label>` component as a child.
 * - **Tooltip**: Must wrap the trigger in `Tooltip.Trigger` for the tooltip
 *   to actually appear on hover.
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUIDateField
 *   ariaLabel="Birth date"
 *   label="Birth date"
 *   value={birthDate}
 *   onChange={setBirthDate}
 * />
 * ```
 *
 * ### Example — With tooltip
 * ```tsx
 * <HeroUIDateField
 *   ariaLabel="Start date"
 *   label="Start date"
 *   value={startDate}
 *   onChange={setStartDate}
 *   tooltip={{ text: "Select the start date", placement: "top", showArrow: true }}
 * />
 * ```
 */
const HeroUIDateField: React.FC<HeroUIDateFieldProps> = ({
                                                             ariaLabel = "Date field",
                                                             label,
                                                             value = null,
                                                             onChange,
                                                             width = "195px",
                                                             className = "",
                                                             isDisabled = false,
                                                             isRequired = false,
                                                             tooltip,
                                                         }) => {
    const field = (
        <DateField
            aria-label={ariaLabel}
            className={className}
            style={{width}}
            value={value}
            onChange={onChange}
            isDisabled={isDisabled}
            isRequired={isRequired}
        >
            {label && <Label>{label}</Label>}

            <DateField.Group
                className="rounded-[5px] text-[11px] [&_*]:text-[11px] [&_[data-slot='segment']]:px-0"
            >
                <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment}/>}
                </DateField.Input>
            </DateField.Group>
        </DateField>
    );

    // No tooltip → return the bare date field.
    if (!tooltip) return field;

    // Normalize the string shorthand into the full config object.
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
            {/*
             * HeroUI v3 requires the trigger element to be wrapped in
             * `Tooltip.Trigger`. Passing the element as a direct child
             * of `Tooltip` no longer works (v2 behavior).
             */}
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

HeroUIDateField.displayName = "HeroUIDateField";

export default HeroUIDateField;