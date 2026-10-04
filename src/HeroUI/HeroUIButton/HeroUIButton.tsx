import React from "react";
import {Button, ButtonProps, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {tv, type VariantProps} from "tailwind-variants";
import styles from "./HeroUIButton.module.css";

/* -------------------------------------------------------------------------- */
/*                               Tooltip types                                */
/* -------------------------------------------------------------------------- */

type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface HeroUITooltipConfig {
    text: React.ReactNode;
    placement?: TooltipPlacement;
    showArrow?: boolean;
    delay?: number;
    className?: string;
}

/* -------------------------------------------------------------------------- */
/*                          Custom tone variants                              */
/* -------------------------------------------------------------------------- */

const buttonTones = tv({
    base: "rounded-[5px] transition-colors",
    variants: {
        tone: {
            default: "",

            /* --- Info (azul) --- */
            info: "bg-blue-500 text-white hover:bg-blue-600 border-none",
            "info-soft": "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-none dark:text-blue-300",
            "white-info": "bg-white text-blue-600 border border-blue-500/30 hover:bg-blue-50 [&_svg]:text-blue-600",

            /* --- Success (verde) --- */
            success: "bg-green-500 text-white hover:bg-green-600 border-none",
            "success-soft": "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-none dark:text-green-300",
            "white-success": "bg-white text-green-600 border border-green-500/30 hover:bg-green-50 [&_svg]:text-green-600",

            /* --- Warning (amarillo, ícono blanco) --- */
            warning: "bg-yellow-500 text-black hover:bg-yellow-600 border-none [&_svg]:text-white",
            "warning-soft": "bg-yellow-500/20 text-yellow-800 hover:bg-yellow-500/30 border-none dark:text-yellow-300",
            "white-warning": "bg-white text-yellow-600 border border-yellow-500/30 hover:bg-yellow-50 [&_svg]:text-yellow-600",

            /* --- Danger (rojo) --- */
            danger: "bg-red-500 text-white hover:bg-red-600 border-none",
            "danger-soft": "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-none dark:text-red-300",
            "white-danger": "bg-white text-red-600 border border-red-500/30 hover:bg-red-50 [&_svg]:text-red-600",

            /* --- Brown (carmelita) --- */
            brown: "bg-amber-800 text-white hover:bg-amber-900 border-none",
            "brown-soft": "bg-amber-800/15 text-amber-900 hover:bg-amber-800/25 border-none dark:text-amber-300",
            "white-brown": "bg-white text-amber-800 border border-amber-800/30 hover:bg-amber-50 [&_svg]:text-amber-800",

            /* --- Yellow (amarillo puro, distinto de warning) --- */
            yellow: "bg-yellow-400 text-black hover:bg-yellow-500 border-none [&_svg]:text-white",
            "yellow-soft": "bg-yellow-400/20 text-yellow-800 hover:bg-yellow-400/30 border-none dark:text-yellow-300",
            "white-yellow": "bg-white text-yellow-600 border border-yellow-500/30 hover:bg-yellow-50 [&_svg]:text-yellow-600",

            /* --- Gray (gris) --- */
            gray: "bg-gray-500 text-white hover:bg-gray-600 border-none",
            "gray-soft": "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-none dark:text-gray-300",
            "white-gray": "bg-white text-gray-700 border border-gray-500/30 hover:bg-gray-50 [&_svg]:text-gray-700",

            /* --- White (fondo blanco, texto/ícono negro) --- */
            white: "bg-white text-black border border-black/10 hover:bg-gray-100",

            /* --- White + color primario del tema --- */
            "white-primary": "bg-white text-primary border border-primary/20 hover:bg-primary/5 [&_svg]:text-primary",

            /* --- White + color del tema secondary --- */
            "white-secondary": "bg-white text-surface-secondary border border-black/10 hover:bg-surface-secondary/10 [&_svg]:text-surface-secondary",
            "white-secondary-soft": "bg-surface-secondary/10 text-surface-secondary border border-surface-secondary/20 hover:bg-surface-secondary/20",

            /* --- White + color del tema tertiary --- */
            "white-tertiary": "bg-white text-surface-tertiary border border-black/10 hover:bg-surface-tertiary/10 [&_svg]:text-surface-tertiary",
            "white-tertiary-soft": "bg-surface-tertiary/10 text-surface-tertiary border border-surface-tertiary/20 hover:bg-surface-tertiary/20",
        },
    },
    defaultVariants: {
        tone: "default",
    },
});

type ButtonTones = VariantProps<typeof buttonTones>;

/* -------------------------------------------------------------------------- */
/*                                 Props                                      */

/* -------------------------------------------------------------------------- */

interface HeroUIButtonProps extends Omit<ButtonProps, "children">, ButtonTones {
    /** Button label (optional — can be icon-only with aria-label) */
    children?: React.ReactNode;
    icon?: string;
    iconPosition?: "start" | "end";
    iconClassName?: string;
    appearance?: "default" | "surface" | "header" | "pagination";
    tooltip?: string | HeroUITooltipConfig;
}

/* -------------------------------------------------------------------------- */
/*                               Component                                    */
/* -------------------------------------------------------------------------- */

const HeroUIButton = ({
                          children,
                          icon,
                          iconPosition = "start",
                          iconClassName = "size-4",
                          className = "",
                          variant = "primary",
                          size = "md",
                          appearance = "default",
                          tone = "default",
                          tooltip,
                          ...rest
                      }: HeroUIButtonProps) => {
    const appearanceClass =
        appearance === "surface"
            ? styles.appearanceSurface
            : appearance === "pagination"
                ? styles.appearancePagination
                : appearance === "header"
                    ? styles.appearanceHeader
                    : "";

    const toneClass = buttonTones({tone});

    const resolvedVariant = tone && tone !== "default" ? "ghost" : variant;

    const button = (
        <Button
            className={`${toneClass} ${appearanceClass} ${className}`.trim()}
            size={size}
            variant={resolvedVariant}
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

HeroUIButton.displayName = "HeroUIButton";

export default HeroUIButton;