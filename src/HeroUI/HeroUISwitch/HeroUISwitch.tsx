import React from "react";
import {Switch, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import type {HeroUITooltipConfig} from "../types";


/**
 * Configuration for the icons inside the switch thumb.
 *
 * Icons are Iconify names (e.g. `"fa6-solid:check"`).
 * The ON icon is rendered with `opacity-100` and the OFF icon
 * with `opacity-70`, matching the official HeroUI example.
 */
interface HeroUISwitchIconConfig {
    /** Iconify icon name shown when the switch is OFF. */
    off: string;
    /** Iconify icon name shown when the switch is ON. */
    on: string;
    /**
     * CSS classes applied to `Switch.Control` when selected.
     * When omitted, the default **green** is used.
     */
    selectedControlClass?: string;
    /**
     * CSS classes applied to `Switch.Control` when NOT selected.
     * When omitted, no extra class is applied (HeroUI base color).
     */
    unselectedControlClass?: string;
}

interface HeroUISwitchProps {
    /** Aria label for accessibility. Defaults to `"Switch"`. */
    ariaLabel?: string;
    /** Controlled selected state. */
    isSelected?: boolean;
    /** Fired when the selected state changes. Receives the boolean value. */
    onChange?: (isSelected: boolean) => void;
    /** Disables the switch. Defaults to `false`. */
    isDisabled?: boolean;
    /** Switch size. Defaults to `"md"`. */
    size?: "sm" | "md" | "lg";
    /**
     * Optional icon configuration.
     * When omitted, the switch uses the default `check` icon set:
     * `off: "fa6-solid:power-off"`, `on: "fa6-solid:check"`,
     * `selectedControlClass: "bg-green-500/80"`.
     */
    icon?: HeroUISwitchIconConfig;
    /**
     * Forces the thumb background to white when the switch is ON.
     * Defaults to `true`.
     */
    forceWhiteThumbOnSelected?: boolean;
    /** Additional CSS classes for the root Switch component. */
    className?: string;
    /**
     * Optional tooltip shown on hover.
     * Accepts a string (shorthand) or a full config object.
     */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * Default icon configuration applied when no `icon` prop is provided.
 * Mirrors the official HeroUI `check` example:
 * - ON  → green control + Check icon (opacity-100)
 * - OFF → base control + Power icon (opacity-70)
 */
const DEFAULT_ICON: HeroUISwitchIconConfig = {
    off: "fa6-solid:power-off",
    on: "fa6-solid:check",
    selectedControlClass: "bg-green-500/80",
};

/**
 * `HeroUISwitch`
 *
 * Toggle switch built on HeroUI v3 using the required compound component
 * structure: Switch.Content > Switch.Control > Switch.Thumb > Switch.Icon.
 *
 * ### Default behavior
 * When no `icon` prop is passed, the switch uses the `check` preset:
 * - **ON**  → control `bg-green-500/80`, icon `fa6-solid:check` (opacity-100),
 *             and the thumb is forced to **white**.
 * - **OFF** → control base color, icon `fa6-solid:power-off` (opacity-70).
 *
 * ### Overriding
 * Pass a custom `icon` config to change the icons and/or the colors.
 *
 * ### HeroUI v3 Notes
 * - Compound components required: `Switch.Content`, `Switch.Control`,
 *   `Switch.Thumb`, `Switch.Icon`.
 * - Tooltip must wrap the trigger in `Tooltip.Trigger`.
 * - `onChange` receives `(isSelected: boolean)`.
 */
const HeroUISwitch: React.FC<HeroUISwitchProps> = ({
                                                       ariaLabel = "Switch",
                                                       isSelected,
                                                       onChange,
                                                       isDisabled = false,
                                                       size = "md",
                                                       icon,
                                                       forceWhiteThumbOnSelected = true,
                                                       className = "",
                                                       tooltip,
                                                   }) => {
    // Fall back to the default `check` preset when no icon is provided.
    const resolvedIcon: HeroUISwitchIconConfig = icon ?? DEFAULT_ICON;

    /**
     * Resolves the CSS classes applied to `Switch.Control`.
     *
     * Priority:
     * 1. `icon.selectedControlClass` when selected.
     * 2. `icon.unselectedControlClass` when not selected.
     * 3. No extra class (HeroUI base color).
     *
     * @param selected - Current selected state from the render prop.
     */
    const resolveControlClass = (selected: boolean): string => {
        if (selected && resolvedIcon.selectedControlClass) {
            return resolvedIcon.selectedControlClass;
        }
        if (!selected && resolvedIcon.unselectedControlClass) {
            return resolvedIcon.unselectedControlClass;
        }
        return "";
    };

    /**
     * Resolves the CSS classes applied to `Switch.Thumb`.
     *
     * When `forceWhiteThumbOnSelected` is enabled and the switch is ON,
     * forces the thumb background to white regardless of the theme.
     *
     * @param selected - Current selected state from the render prop.
     */
    const resolveThumbClass = (selected: boolean): string => {
        if (forceWhiteThumbOnSelected && selected) {
            return "!bg-white";
        }
        return "";
    };

    const switchEl = (
        <Switch
            aria-label={ariaLabel}
            className={className}
            isSelected={isSelected}
            onChange={onChange}
            isDisabled={isDisabled}
            size={size}
        >
            {({isSelected: selected}) => (
                <Switch.Content>
                    <Switch.Control className={resolveControlClass(selected)}>
                        <Switch.Thumb className={resolveThumbClass(selected)}>
                            <Switch.Icon>
                                {/*
                                 * Matches the official HeroUI example:
                                 * ON icon → opacity-100
                                 * OFF icon → opacity-70
                                 */}
                                <Icon
                                    className={
                                        selected
                                            ? "size-3 text-inherit opacity-100"
                                            : "size-3 text-inherit opacity-70"
                                    }
                                    icon={selected ? resolvedIcon.on : resolvedIcon.off}
                                />
                            </Switch.Icon>
                        </Switch.Thumb>
                    </Switch.Control>
                </Switch.Content>
            )}
        </Switch>
    );

    // No tooltip → return the bare switch.
    if (!tooltip) return switchEl;

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
                {switchEl}
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

HeroUISwitch.displayName = "HeroUISwitch";

export default HeroUISwitch;