import React, {useState} from "react";
import {DateField, FieldError, Label, Tooltip} from "@heroui/react";
import type {DateValue} from "@internationalized/date";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


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
    /**
     * Optional tooltip shown on hover.
     */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUIDateField`
 *
 * Date field built on HeroUI v3 `DateField`.
 *
 * ### Required validation
 * When `isRequired` is `true` and the value is `null`, the field shows
 * a `FieldError` below the input. The error disappears automatically
 * as soon as a valid date is selected.
 *
 * ### Compact styling
 * The internal `DateField.Group` uses a smaller font size and tighter
 * spacing so it visually matches `HeroUIDatePicker` and
 * `HeroUIDateRangePicker` at ~195px.
 *
 * ### HeroUI v3 Notes
 * - Compound components required: `DateField.Group`, `DateField.Input`,
 *   `DateField.Segment`.
 * - `FieldError` must be a sibling inside `DateField`.
 * - Tooltip must wrap the trigger in `Tooltip.Trigger`.
 *
 * ### Example — Required field
 * ```tsx
 * <HeroUIDateField
 *   label="Birth date"
 *   isRequired
 *   requiredMessage="Please select a date"
 *   value={dateValue}
 *   onChange={setDateValue}
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
                                                             requiredMessage = "This field is required",
                                                             tooltip,
                                                         }) => {
    /**
     * The field is invalid when it's required but has no value.
     * `null` and `undefined` both count as empty.
     */
    /** The required error only shows after the first onBlur, not on mount. */
    const [isTouched, setIsTouched] = useState(false);

    const isInvalid = isTouched && isRequired && (value === null || value === undefined);

    const field = (
        <DateField
            aria-label={label ? undefined : ariaLabel}
            className={className}
            style={{width}}
            value={value}
            onChange={onChange}
            isDisabled={isDisabled}
            isRequired={isRequired}
            isInvalid={isInvalid}
            validationBehavior="aria"
            onBlur={() => setIsTouched(true)}
        >
            {label && <Label>{label}</Label>}

            <DateField.Group
                className="rounded-[5px] text-[11px] [&_*]:text-[11px] [&_[data-slot='segment']]:px-0"
            >
                <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment}/>}
                </DateField.Input>
            </DateField.Group>

            {/* FieldError shows the required message when isInvalid is true */}
            <FieldError>{requiredMessage}</FieldError>
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