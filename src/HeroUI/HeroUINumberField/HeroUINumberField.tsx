import React from "react";
import {NumberField, Label, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";

/**
 * Configuration for the tooltip shown on the number field.
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

interface HeroUINumberFieldProps {
    /** Aria label for accessibility. Defaults to `"Number field"`. */
    ariaLabel?: string;
    /** Optional visible label rendered above the field via the `Label` component. */
    label?: React.ReactNode;
    /** Controlled numeric value. */
    value?: number;
    /** Fired when the value changes. Receives the numeric value directly. */
    onChange?: (value: number) => void;
    /** Minimum allowed value. Defaults to `0`. */
    minValue?: number;
    /** Maximum allowed value. Defaults to `100`. */
    maxValue?: number;
    /** Step increment for the stepper buttons. Defaults to `1`. */
    step?: number;
    /** Field width. Defaults to `"195px"`. */
    width?: string | number;
    /** Additional CSS classes for the root NumberField component. */
    className?: string;
    /** Disables the field. Defaults to `false`. */
    isDisabled?: boolean;
    /**
     * Optional tooltip shown on hover.
     * Accepts a string (shorthand) or a full config object.
     */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUINumberField`
 *
 * Number field with increment/decrement steppers built on HeroUI v3.
 *
 * ### HeroUI v3 Notes
 * - **Renamed**: `NumberInput` (v2) → `NumberField` (v3) [citation:1].
 * - **Compound components required**: Must explicitly compose
 *   `NumberField.Group`, `NumberField.Input`, `NumberField.IncrementButton`,
 *   and `NumberField.DecrementButton` [citation:1].
 * - **Label**: The `label` prop from v2 was removed. Use the separate
 *   `<Label>` component as a child [citation:1].
 * - **Event handler**: `onValueChange` (v2) → `onChange` (v3) [citation:1].
 * - **Tooltip**: Must wrap the trigger in `Tooltip.Trigger` [citation:2].
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUINumberField
 *   ariaLabel="Quantity"
 *   label="Quantity"
 *   value={quantity}
 *   onChange={setQuantity}
 *   minValue={1}
 *   maxValue={99}
 * />
 * ```
 *
 * ### Example — With tooltip
 * ```tsx
 * <HeroUINumberField
 *   ariaLabel="Percentage"
 *   label="Completion"
 *   value={percent}
 *   onChange={setPercent}
 *   minValue={0}
 *   maxValue={100}
 *   tooltip={{ text: "Enter a value from 0 to 100", placement: "top", showArrow: true }}
 * />
 * ```
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
                                                                 tooltip,
                                                             }) => {
    const field = (
        <NumberField
            aria-label={ariaLabel}
            className={className}
            style={{width}}
            value={value}
            onChange={onChange}
            minValue={minValue}
            maxValue={maxValue}
            step={step}
            isDisabled={isDisabled}
        >
            {label && <Label>{label}</Label>}

            <NumberField.Group className="rounded-[5px]">
                <NumberField.DecrementButton>
                    <Icon icon="fa6-solid:minus" className="size-3"/>
                </NumberField.DecrementButton>

                <NumberField.Input/>

                <NumberField.IncrementButton>
                    <Icon icon="fa6-solid:plus" className="size-3"/>
                </NumberField.IncrementButton>
            </NumberField.Group>
        </NumberField>
    );

    // No tooltip → return the bare number field.
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
             * of `Tooltip` no longer works (v2 behavior) [citation:2].
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

HeroUINumberField.displayName = "HeroUINumberField";

export default HeroUINumberField;