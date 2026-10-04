import React, {useState} from "react";
import {FieldError, Label, NumberField, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


/**
 * Props for `HeroUINumberField`.
 */
interface HeroUINumberFieldProps {
    /** Aria label for accessibility. Defaults to `"Number field"`. */
    ariaLabel?: string;
    /** Optional visible label rendered above the field via the `Label` component. */
    label?: React.ReactNode;
    /** Controlled numeric value. `undefined` means no value. */
    value?: number;
    /** Fired when the value changes. Receives the new value or `undefined`. */
    onChange?: (value: number | undefined) => void;
    /** Minimum allowed value. Defaults to `0`. */
    minValue?: number;
    /** Maximum allowed value. Defaults to `100`. */
    maxValue?: number;
    /** Increment/decrement step. Defaults to `1`. */
    step?: number;
    /** Field width. Defaults to `"195px"`. */
    width?: string | number;
    /** Additional CSS classes for the root NumberField component. */
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
    /** Optional tooltip. Accepts a string or a full config object. */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUINumberField`
 *
 * Number field with increment/decrement steppers built on HeroUI v3.
 *
 * ### Required validation
 * When `isRequired` is `true` and the value is empty, the field shows a
 * `FieldError` below the input. The error disappears automatically as
 * soon as a valid number is entered.
 *
 * **Important**: When the user clears the field with Backspace,
 * React Aria's internal value becomes `NaN` (not `undefined`).
 * The validation checks for both `undefined` and `NaN`.
 */
const HeroUINumberField: React.FC<HeroUINumberFieldProps> = ({
                                                                 ariaLabel = "Number field",
                                                                 label,
                                                                 value,
                                                                 onChange,
                                                                 minValue = 0,
                                                                 maxValue = 100,
                                                                 step = 1,
                                                                 width = "195px",
                                                                 className = "",
                                                                 isDisabled = false,
                                                                 isRequired = false,
                                                                 requiredMessage = "This field is required",
                                                                 tooltip,
                                                             }) => {
    /**
     * The field is invalid when it's required but has no valid value.
     *
     * React Aria returns `NaN` when the user clears the input with
     * Backspace, and `undefined` when the value is externally cleared.
     * Both cases must be treated as "empty" for validation.
     */
    /** The required error only shows after the first onBlur, not on mount. */
    const [isTouched, setIsTouched] = useState(false);

    const isInvalid =
        isTouched &&
        isRequired &&
        (value === undefined || Number.isNaN(value));

    const field = (
        <NumberField
            aria-label={label ? undefined : ariaLabel}
            className={className}
            style={{width}}
            value={value}
            onChange={onChange}
            minValue={minValue}
            maxValue={maxValue}
            step={step}
            isDisabled={isDisabled}
            isRequired={isRequired}
            isInvalid={isInvalid}
            validationBehavior="aria"
            onBlur={() => setIsTouched(true)}
        >
            {label && <Label>{label}</Label>}

            <NumberField.Group className="rounded-[5px] overflow-hidden">
                <NumberField.DecrementButton className="rounded-none">
                    <Icon icon="fa6-solid:minus" className="size-3"/>
                </NumberField.DecrementButton>

                <NumberField.Input/>

                <NumberField.IncrementButton className="rounded-none">
                    <Icon icon="fa6-solid:plus" className="size-3"/>
                </NumberField.IncrementButton>
            </NumberField.Group>

            <FieldError>{requiredMessage}</FieldError>
        </NumberField>
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

HeroUINumberField.displayName = "HeroUINumberField";

export default HeroUINumberField;