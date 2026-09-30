import React from "react";
import {Button, ButtonProps, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUIIconButton.module.css";

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
 * Configuration for the tooltip shown on the icon button.
 *
 * Accepts either a plain string (shorthand) or this full object.
 */
interface HeroUITooltipConfig {
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
 * Props for `HeroUIIconButton`.
 *
 * Extends HeroUI's `ButtonProps` (so you can still pass `variant`, `size`,
 * `onPress`, `isDisabled`, `color`, `radius`, etc.), but:
 * - `isIconOnly` is forced to `true` (this is an icon-only button).
 * - `children` is replaced by the `icon` prop (an Iconify name).
 *
 * It also adds:
 * - `appearance` shortcut for predefined styles (`surface`, `header`, `pagination`).
 * - `tooltip` (string shorthand or full config).
 */
interface HeroUIIconButtonProps extends Omit<ButtonProps, "isIconOnly" | "children"> {
    /** Iconify icon name (e.g. `"fa6-solid:trash-can"`) */
    icon: string;
    /** Extra classes for the `<Icon>` element */
    iconClassName?: string;
    /**
     * Predefined appearance.
     * - `default` → HeroUI's native look (uses `variant`).
     * - `surface` → background matches the base surface.
     * - `header` → background matches table headers.
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
 * `HeroUIIconButton`
 *
 * An icon-only button built on top of HeroUI v3's `Button`, with optional
 * tooltip and predefined appearances.
 *
 * ### Features
 * - Fixed `isIconOnly` (this component only renders an icon).
 * - Accepts all `ButtonProps` except `isIconOnly` and `children`.
 * - `appearance` shortcut for common surface/header/pagination styles.
 * - Optional `tooltip` as string shorthand or full config.
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUIIconButton
 *   icon="fa6-solid:eye"
 *   aria-label="View user"
 *   onPress={handleView}
 * />
 * ```
 *
 * ### Example — With tooltip and custom appearance
 * ```tsx
 * <HeroUIIconButton
 *   appearance="surface"
 *   icon="fa6-solid:trash-can"
 *   tooltip={{ text: "Delete", placement: "top", showArrow: true }}
 *   onPress={handleDelete}
 * />
 * ```
 *
 * ### Example — Using native Button props
 * ```tsx
 * <HeroUIIconButton
 *   icon="fa6-solid:floppy-disk"
 *   variant="primary"
 *   size="md"
 *   isDisabled={!hasChanges}
 *   onPress={handleSave}
 * />
 * ```
 */
const HeroUIIconButton = ({
                              icon,
                              iconClassName = "size-4",
                              className = "",
                              variant = "tertiary",
                              size = "sm",
                              appearance = "default",
                              tooltip,
                              ...rest
                          }: HeroUIIconButtonProps) => {
    /** Resolve the appearance class from the CSS module. */
    const appearanceClass =
        appearance === "surface"
            ? styles.appearanceSurface
            : appearance === "header"
                ? styles.appearanceHeader
                : appearance === "pagination"
                    ? styles.appearancePagination
                    : "";

    /** The core button — always `isIconOnly`, always renders a single icon. */
    const button = (
        <Button
            isIconOnly
            className={`rounded-[5px] ${appearanceClass} ${className}`.trim()}
            size={size}
            variant={variant}
            {...rest}
        >
            <Icon className={iconClassName} icon={icon}/>
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

HeroUIIconButton.displayName = "HeroUIIconButton";

export default HeroUIIconButton;