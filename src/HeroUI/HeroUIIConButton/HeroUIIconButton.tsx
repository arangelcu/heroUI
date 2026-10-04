import React from "react";
import {Button, ButtonProps, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {tv, type VariantProps} from "tailwind-variants";
import styles from "./HeroUIIconButton.module.css";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";
import {iconButtonOnlyTones, sharedTones} from "../HeroUIUtils/tones";

/* -------------------------------------------------------------------------- */
/*                               Tooltip types                                */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                          Custom tone variants                              */
/* -------------------------------------------------------------------------- */

/**
 * Custom tone variants layered on top of HeroUI's Button.
 *
 * Solid  → strong background with contrasting text/icon.
 * Soft   → translucent background of the same color, text in that color.
 * White  → white background with a black icon.
 * WhitePrimary → white background with the icon in the theme's primary color.
 */
const iconButtonTones = tv({
    base: "rounded-[5px] transition-colors",
    variants: {
        tone: {
            ...sharedTones,
            ...iconButtonOnlyTones,
        },
    },
    defaultVariants: {
        tone: "default",
    },
});

type IconButtonTones = VariantProps<typeof iconButtonTones>;

/* -------------------------------------------------------------------------- */
/*                                 Props                                      */

/* -------------------------------------------------------------------------- */

/**
 * Props for `HeroUIIconButton`.
 *
 * Icon-only button built on HeroUI's `Button`, with custom tone variants,
 * optional appearance presets, and an optional tooltip.
 */
interface HeroUIIconButtonProps
    extends Omit<ButtonProps, "isIconOnly" | "children">,
        IconButtonTones {
    /** Iconify icon name rendered inside the button. */
    icon: string;
    /** Additional CSS classes for the icon. Defaults to `"size-4"`. */
    iconClassName?: string;
    /** Visual preset applied on top of the tone. Defaults to `"default"`. */
    appearance?: "default" | "surface" | "header" | "pagination";
    /** Optional tooltip. Accepts a string or a full config object. */
    tooltip?: string | HeroUITooltipConfig;
}

/* -------------------------------------------------------------------------- */
/*                               Component                                    */
/* -------------------------------------------------------------------------- */

const HeroUIIconButton = ({
                              icon,
                              iconClassName = "size-4",
                              className = "",
                              variant = "tertiary",
                              size = "sm",
                              appearance = "default",
                              tone = "default",
                              tooltip,
                              ...rest
                          }: HeroUIIconButtonProps) => {
    const appearanceClass =
        appearance === "surface"
            ? styles.appearanceSurface
            : appearance === "header"
                ? styles.appearanceHeader
                : appearance === "pagination"
                    ? styles.appearancePagination
                    : "";

    const toneClass = iconButtonTones({tone});

    /* When a custom tone is used, force variant="ghost" so HeroUI's native
       variant styles don't fight our tone background. */
    const resolvedVariant = tone && tone !== "default" ? "ghost" : variant;

    const button = (
        <Button
            isIconOnly
            className={`${toneClass} ${appearanceClass} ${className}`.trim()}
            size={size}
            variant={resolvedVariant}
            {...rest}
        >
            <Icon className={iconClassName} icon={icon}/>
        </Button>
    );

    if (!tooltip) return button;

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