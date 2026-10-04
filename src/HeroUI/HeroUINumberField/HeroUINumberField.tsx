import React, {useState} from "react";
import {FieldError, Label, NumberField, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


interface HeroUINumberFieldProps {
    ariaLabel?: string;
    label?: React.ReactNode;
    value?: number;
    onChange?: (value: number | undefined) => void;
    minValue?: number;
    maxValue?: number;
    step?: number;
    width?: string | number;
    className?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    requiredMessage?: string;
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
    /** El error de obligatorio se muestra tras el primer onBlur, no al montar. */
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