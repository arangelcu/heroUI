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
 * Solid  → fondo fuerte, texto/ícono en contraste.
 * Soft   → fondo translúcido del mismo color, texto del color.
 * White  → fondo blanco con ícono en negro.
 * WhitePrimary → fondo blanco con ícono en el color primario del tema.
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

interface HeroUIIconButtonProps
    extends Omit<ButtonProps, "isIconOnly" | "children">,
        IconButtonTones {
    icon: string;
    iconClassName?: string;
    appearance?: "default" | "surface" | "header" | "pagination";
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