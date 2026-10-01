import React from "react";
import { Button, ButtonProps, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { tv, type VariantProps } from "tailwind-variants";
// @ts-ignore
import styles from "./HeroUIIconButton.module.css";

/* -------------------------------------------------------------------------- */
/*                               Tooltip types                                */
/* -------------------------------------------------------------------------- */

type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface HeroUITooltipConfig {
    text: React.ReactNode;
    placement?: TooltipPlacement;
    showArrow?: boolean;
    delay?: number;
    className?: string;
}

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
            default: "",

            /* --- Info (azul) --- */
            info: "bg-blue-500 text-white hover:bg-blue-600 border-none",
            "info-soft": "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-none dark:text-blue-300",

            /* --- Success (verde) --- */
            success: "bg-green-500 text-white hover:bg-green-600 border-none",
            "success-soft": "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-none dark:text-green-300",

            /* --- Warning (amarillo, ícono blanco) --- */
            warning: "bg-yellow-500 text-black hover:bg-yellow-600 border-none [&_svg]:text-white",
            "warning-soft": "bg-yellow-500/20 text-yellow-800 hover:bg-yellow-500/30 border-none dark:text-yellow-300",

            /* --- Danger (rojo) --- */
            danger: "bg-red-500 text-white hover:bg-red-600 border-none",
            "danger-soft": "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-none dark:text-red-300",

            /* --- Brown (carmelita) --- */
            brown: "bg-amber-800 text-white hover:bg-amber-900 border-none",
            "brown-soft": "bg-amber-800/15 text-amber-900 hover:bg-amber-800/25 border-none dark:text-amber-300",

            /* --- Yellow (amarillo puro, distinto de warning) --- */
            yellow: "bg-yellow-400 text-black hover:bg-yellow-500 border-none [&_svg]:text-white",
            "yellow-soft": "bg-yellow-400/20 text-yellow-800 hover:bg-yellow-400/30 border-none dark:text-yellow-300",

            /* --- Gray (gris) --- */
            gray: "bg-gray-500 text-white hover:bg-gray-600 border-none",
            "gray-soft": "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-none dark:text-gray-300",

            /* --- White (fondo blanco, ícono negro) --- */
            white: "bg-white text-black border border-black/10 hover:bg-gray-100",

            /* --- White + ícono del color primario del tema --- */
            "white-primary": "bg-white text-primary border border-primary/20 hover:bg-primary/5 [&_svg]:text-primary",

            /* --- White + color del tema secondary --- */
            "white-secondary": "bg-white border border-black/10 hover:bg-surface-secondary/10 [&_svg]:text-surface-secondary",
            "white-secondary-soft": "bg-surface-secondary/10 text-surface-secondary border border-surface-secondary/20 hover:bg-surface-secondary/20",

            /* --- White + color del tema tertiary --- */
            "white-tertiary": "bg-white border border-black/10 hover:bg-surface-tertiary/10 [&_svg]:text-surface-tertiary",
            "white-tertiary-soft": "bg-surface-tertiary/10 text-surface-tertiary border border-surface-tertiary/20 hover:bg-surface-tertiary/20",
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

    const toneClass = iconButtonTones({ tone });

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
            <Icon className={iconClassName} icon={icon} />
        </Button>
    );

    if (!tooltip) return button;

    const config: HeroUITooltipConfig =
        typeof tooltip === "string" ? { text: tooltip } : tooltip;

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
                {showArrow && <Tooltip.Arrow />}
                <p>{text}</p>
            </Tooltip.Content>
        </Tooltip>
    );
};

HeroUIIconButton.displayName = "HeroUIIconButton";

export default HeroUIIconButton;