import React from "react";
import {ToggleButton, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";

/**
 * Configuration for the tooltip shown on the toggle button.
 *
 * Can be provided either as a plain string (shorthand for just the text)
 * or as this full object for finer control.
 */
export interface HeroUITooltipConfig {
    /** Tooltip content. Accepts a string or ReactNode. */
    text: React.ReactNode;
    /** Tooltip placement relative to the button. Defaults to `"top"`. */
    placement?: "top" | "bottom" | "left" | "right";
    /** Shows or hides the tooltip arrow. Defaults to `false`. */
    showArrow?: boolean;
    /** Delay in ms before showing the tooltip. Defaults to `0`. */
    delay?: number;
    /** Additional CSS classes for the tooltip content. */
    className?: string;
}

/**
 * Configuration for the icon states of the toggle button.
 * When omitted, the component renders only the text (if any).
 */
interface HeroUIToggleButtonIconConfig {
    /** Iconify icon name shown when the button is NOT selected. */
    off: string;
    /** Iconify icon name shown when the button IS selected. */
    on: string;
}

interface HeroUIToggleButtonProps {
    /**
     * Static icon (Iconify name) rendered regardless of state.
     * Use `iconConfig` instead if you want the icon to swap on select.
     */
    icon?: string;
    /**
     * Icon configuration that swaps icons based on the selected state.
     * When provided, `icon` is ignored.
     */
    iconConfig?: HeroUIToggleButtonIconConfig;
    /**
     * Optional text label rendered next to the icon.
     * When omitted together with `isIconOnly`, the button is icon-only.
     */
    children?: React.ReactNode;
    /** Accessible label. Required when `isIconOnly` is `true`. */
    ariaLabel?: string;
    /** Whether the button is currently selected. */
    isSelected?: boolean;
    /** Callback fired when the selected state changes. */
    onChange?: (isSelected: boolean) => void;
    /** Disables the button. Defaults to `false`. */
    isDisabled?: boolean;
    /** Renders the button as icon-only (no text). Defaults to `false`. */
    isIconOnly?: boolean;
    /** Button size. Defaults to `"md"`. */
    size?: "sm" | "md" | "lg";
    /** HeroUI button variant. Defaults to `"default"`. */
    variant?: "default" | "ghost";
    /** Extra CSS classes for the button. */
    className?: string;
    /** Optional tooltip shown on hover. */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUIToggleButton`
 *
 * Toggle button built on HeroUI v3 `ToggleButton`.
 *
 * ### Features
 * - **Icon-only mode**: pass `isIconOnly` + `ariaLabel` and an `icon`.
 * - **Icon + text mode**: pass `children` (text) and optionally `icon`.
 * - **Stateful icons**: use `iconConfig={{ off, on }}` to swap icons
 *   based on the selected state.
 * - **Controlled**: use `isSelected` + `onChange`.
 * - **Tooltip**: must wrap the button in `Tooltip.Trigger` (v3 requirement).
 *
 * ### Example — Icon-only
 * ```tsx
 * <HeroUIToggleButton
 *   isIconOnly
 *   ariaLabel="Like"
 *   icon="fa6-solid:heart"
 *   tooltip="Like this item"
 * />
 * ```
 *
 * ### Example — Icon + text with stateful icons
 * ```tsx
 * <HeroUIToggleButton
 *   isSelected={liked}
 *   onChange={setLiked}
 *   iconConfig={{
 *     off: "fa6-solid:heart",
 *     on: "fa6-solid:heart",
 *   }}
 *   tooltip="Toggle like"
 * >
 *   {liked ? "Liked" : "Like"}
 * </HeroUIToggleButton>
 * ```
 */
const HeroUIToggleButton: React.FC<HeroUIToggleButtonProps> = ({
                                                                   icon,
                                                                   iconConfig,
                                                                   children,
                                                                   ariaLabel = "Toggle",
                                                                   isSelected,
                                                                   onChange,
                                                                   isDisabled = false,
                                                                   isIconOnly = false,
                                                                   size = "md",
                                                                   variant = "default",
                                                                   className = "",
                                                                   tooltip,
                                                               }) => {
    const button = (
        <ToggleButton
            aria-label={ariaLabel}
            className={`rounded-[5px] ${className}`.trim()}
            isSelected={isSelected}
            onChange={onChange}
            isDisabled={isDisabled}
            isIconOnly={isIconOnly}
            size={size}
            variant={variant}
        >
            {({isSelected: selected}) => {
                /**
                 * Resolve the icon to render:
                 * - If `iconConfig` is provided, swap between off/on.
                 * - Else if `icon` is provided, render it statically.
                 * - Else no icon.
                 */
                const resolvedIcon = iconConfig
                    ? selected
                        ? iconConfig.on
                        : iconConfig.off
                    : icon;

                return (
                    <>
                        {resolvedIcon && (
                            <Icon icon={resolvedIcon} className="size-4"/>
                        )}
                        {!isIconOnly && children}
                    </>
                );
            }}
        </ToggleButton>
    );

    // No tooltip → return the bare button.
    if (!tooltip) return button;

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
            {/* v3 requires Tooltip.Trigger wrapping the trigger element */}
            <Tooltip.Trigger>
                {button}
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

HeroUIToggleButton.displayName = "HeroUIToggleButton";

export default HeroUIToggleButton;