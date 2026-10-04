import React, {useState} from "react";
import {DateField, FieldError, Label, TimeField, type TimeValue, Tooltip} from "@heroui/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


/**
 * Props for `HeroUITimeField`.
 *
 * A wrapper around HeroUI v3 `TimeField` that adds:
 * - Optional label above the field
 * - Required validation with a custom error message
 * - Optional tooltip (string shorthand or full config)
 * - Configurable width and disabled state
 *
 * ### HeroUI v3 Notes
 * - **Component renamed**: `TimeInput` (v2) → `TimeField` (v3).
 * - **Compound components required**: Must use `DateField.Group`,
 *   `DateField.Input` (render prop), and `DateField.Segment`.
 * - **Label**: Rendered via the separate `<Label>` component as a child.
 * - **FieldError**: Must be a sibling inside `TimeField`.
 * - **Tooltip**: Must wrap the trigger in `Tooltip.Trigger`.
 * - **Props removed**: `color`, `size`, `radius`, `labelPlacement`,
 *   `startContent`/`endContent` (use `DateField.Prefix`/`DateField.Suffix`).
 */
interface HeroUITimeFieldProps {
    /** Aria label for accessibility. Defaults to `"Time field"`. */
    ariaLabel?: string;
    /** Optional visible label rendered above the field via the `Label` component. */
    label?: React.ReactNode;
    /** Controlled time value. `null` means no time selected. */
    value?: TimeValue | null;
    /** Fired when the time changes. Receives the new value or `null`. */
    onChange?: (value: TimeValue | null) => void;
    /** Field width. Defaults to `"195px"`. */
    width?: string | number;
    /** Additional CSS classes for the root TimeField component. */
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
     * Accepts a string (shorthand) or a full config object.
     */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUITimeField`
 *
 * Time input field built on HeroUI v3 `TimeField`.
 *
 * ### Required validation
 * When `isRequired` is `true` and the value is `null`, the field shows
 * a `FieldError` below the input. The error disappears automatically
 * as soon as a valid time is selected.
 *
 * ### Structure
 * ```
 * TimeField
 * ├── Label
 * ├── DateField.Group
 * │   └── DateField.Input → DateField.Segment
 * ├── FieldError
 * ```
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUITimeField
 *   ariaLabel="Appointment time"
 *   label="Appointment time"
 *   value={timeValue}
 *   onChange={setTimeValue}
 * />
 * ```
 *
 * ### Example — Required field
 * ```tsx
 * <HeroUITimeField
 *   ariaLabel="Start time"
 *   label="Start time"
 *   isRequired
 *   requiredMessage="Please select a start time"
 *   value={startTime}
 *   onChange={setStartTime}
 * />
 * ```
 */
const HeroUITimeField: React.FC<HeroUITimeFieldProps> = ({
                                                             ariaLabel = "Time field",
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
        <TimeField
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

            <DateField.Group className="rounded-[5px]">
                <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment}/>}
                </DateField.Input>
            </DateField.Group>

            {/* FieldError shows the required message when isInvalid is true */}
            <FieldError>{requiredMessage}</FieldError>
        </TimeField>
    );

    // No tooltip → return the bare time field.
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

HeroUITimeField.displayName = "HeroUITimeField";

export default HeroUITimeField;