import React from "react";
import {Checkbox, Tooltip} from "@heroui/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


interface HeroUICheckboxProps {
    ariaLabel?: string;
    /** Checkbox label text (rendered as plain text inside Checkbox.Content) */
    children?: React.ReactNode;
    /** Whether the checkbox is checked */
    isSelected?: boolean;
    /** Callback when checked state changes */
    onChange?: (isSelected: boolean) => void;
    /** Disables the checkbox */
    isDisabled?: boolean;
    /** Extra classes for the root */
    className?: string;
    /** Optional tooltip */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUICheckbox`
 *
 * Checkbox built on HeroUI v3 using the required compound component pattern.
 *
 * ### Structure
 * ```
 * Checkbox
 * └── Checkbox.Content      (clickable <label>)
 *     ├── Checkbox.Control  (the checkbox box)
 *     │   └── Checkbox.Indicator (checkmark, only when selected)
 *     └── plain text label
 * ```
 *
 * ### Icon behavior
 * The `Checkbox.Indicator` only renders its content when the checkbox is
 * selected. Do NOT pass a custom `className` to `Checkbox.Control` —
 * HeroUI relies on its own classes to show/hide the indicator correctly.
 */
const HeroUICheckbox: React.FC<HeroUICheckboxProps> = ({
                                                           ariaLabel = "Checkbox",
                                                           children,
                                                           isSelected,
                                                           onChange,
                                                           isDisabled = false,
                                                           className = "",
                                                           tooltip,
                                                       }) => {
    const checkbox = (
        <Checkbox
            aria-label={ariaLabel}
            className={className}
            isSelected={isSelected}
            onChange={onChange}
            isDisabled={isDisabled}
        >
            <Checkbox.Content>
                {/*
                 * Do NOT add a custom className here.
                 * HeroUI uses internal classes on Checkbox.Control to know
                 * when to show/hide the Checkbox.Indicator.
                 */}
                <Checkbox.Control>
                    <Checkbox.Indicator/>
                </Checkbox.Control>
                {children && <span>{children}</span>}
            </Checkbox.Content>
        </Checkbox>
    );

    if (!tooltip) return checkbox;

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
                {checkbox}
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

HeroUICheckbox.displayName = "HeroUICheckbox";

export default HeroUICheckbox;