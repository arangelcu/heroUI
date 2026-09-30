import React from "react";
import {Button, ButtonProps, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUIButton.module.css";

/**
 * Valid tooltip placements for HeroUI v3.
 * Uses hyphens (not spaces) as required by React Aria.
 */
type TooltipPlacement =
    | "top"
    | "bottom"
    | "left"
    | "right";

/**
 * Configuration for the tooltip shown on the button.
 *
 * Accepts either a plain string (shorthand) or this full object.
 */
export interface HeroUITooltipConfig {
    /** Text or content displayed inside the tooltip */
    text: React.ReactNode;
    /** Placement of the tooltip relative to the button */
    placement?: TooltipPlacement;
    /** Whether to render a small arrow pointing at the button */
    showArrow?: boolean;
    /** Delay (ms) before the tooltip appears */
    delay?: number;
    /** Extra classes for the tooltip content */
    className?: string;
}

/**
 * Props for `HeroUIButton`.
 *
 * Extends HeroUI's `ButtonProps` (so you can still pass `variant`, `size`,
 * `onPress`, `isDisabled`, `fullWidth`, etc.), and adds:
 * - Optional `icon` (Iconify name) rendered before or after the text.
 * - `appearance` shortcut for predefined styles.
 * - `tooltip` (string shorthand or full config).
 */
interface HeroUIButtonProps extends Omit<ButtonProps, "children"> {
    /** Button label */
    children: React.ReactNode;
    /** Optional Iconify icon name (e.g. `"fa6-solid:plus"`) */
    icon?: string;
    /** Where the icon is rendered relative to the text */
    iconPosition?: "start" | "end";
    /** Extra classes for the `<Icon>` element */
    iconClassName?: string;
    /**
     * Predefined appearance.
     * - `default` → HeroUI's native look (uses `variant`).
     * - `surface` → background matches the base surface (`--surface`).
     * - `header` → background matches table headers (`--surface-secondary`).
     * - `pagination` → background matches the pagination bar.
     */
    appearance?: "default" | "surface" | "header" | "pagination";
    /**
     * Tooltip shown on hover.
     * - String → shown as text with `placement: "top"`.
     * - Object → full control over text, placement, arrow, delay, and classes.
     */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUIButton`
 *
 * A button with optional icon and tooltip, built on top of HeroUI v3's `Button`.
 *
 * ### Features
 * - Accepts all `ButtonProps` except `children` (replaced by the explicit `children` prop).
 * - Optional `icon` with configurable position (`start` / `end`).
 * - `appearance` shortcut for common surface/header/pagination styles.
 * - Optional `tooltip` as string shorthand or full config.
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUIButton icon="fa6-solid:floppy-disk" onPress={handleSave}>
 *   Save
 * </HeroUIButton>
 * ```
 *
 * ### Example — Icon at the end
 * ```tsx
 * <HeroUIButton icon="fa6-solid:arrow-right" iconPosition="end" onPress={handleNext}>
 *   Next
 * </HeroUIButton>
 * ```
 *
 * ### Example — With tooltip and custom appearance
 * ```tsx
 * <HeroUIButton
 *   appearance="surface"
 *   icon="fa6-solid:trash-can"
 *   variant="danger-soft"
 *   tooltip={{ text: "Delete permanently", placement: "top", showArrow: true }}
 *   onPress={handleDelete}
 * >
 *   Delete
 * </HeroUIButton>
 * ```
 */
const HeroUIButton = ({
                          children,
                          icon,
                          iconPosition = "start",
                          iconClassName = "size-4",
                          className = "",
                          variant = "primary",
                          size = "md",
                          appearance = "default",
                          tooltip,
                          ...rest
                      }: HeroUIButtonProps) => {
    /** Resolve the appearance class from the CSS module. */
    const appearanceClass =
        appearance === "surface"
            ? styles.appearanceSurface
            : appearance === "pagination"
                ? styles.appearancePagination
                : appearance === "header"
                    ? styles.appearanceHeader
                    : "";

    /** The core button. */
    const button = (
        <Button
            className={`rounded-[5px] ${appearanceClass} ${className}`.trim()}
            size={size}
            variant={variant}
            {...rest}
        >
            {icon && iconPosition === "start" && (
                <Icon className={iconClassName} icon={icon}/>
            )}
            {children}
            {icon && iconPosition === "end" && (
                <Icon className={iconClassName} icon={icon}/>
            )}
        </Button>
    );

    // No tooltip → return the button as-is.
    if (!tooltip) return button;

    // Normalize string shorthand into the full config object.
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
            {button}
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

HeroUIButton.displayName = "HeroUIButton";

export default HeroUIButton;