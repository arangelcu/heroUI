import React from "react";
import {Button, ButtonProps, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUIButton.module.css";

/** Tipos de posición válidos para el tooltip (HeroUI v3) */
type TooltipPlacement =
    | "top"
    | "bottom"
    | "left"
    | "right";

export interface HeroUITooltipConfig {
    /** Texto o contenido del tooltip */
    text: React.ReactNode;
    /** Posición del tooltip */
    placement?: TooltipPlacement;
    /** Mostrar la flechita */
    showArrow?: boolean;
    /** Delay antes de mostrarse (ms) */
    delay?: number;
    /** Clases extra para el contenido */
    className?: string;
}

interface HeroUIButtonProps extends Omit<ButtonProps, "children"> {
    /** Texto del botón */
    children: React.ReactNode;
    /** Nombre del icono de iconify (opcional) */
    icon?: string;
    /** Posición del icono respecto al texto */
    iconPosition?: "start" | "end";
    /** Clases adicionales para el icono */
    iconClassName?: string;
    /** Apariencia especial predefinida */
    appearance?: "default" | "pagination" | "header";
    /**
     * Tooltip del botón.
     * - Si es string, se usa como texto y placement "top" por defecto.
     * - Si es objeto, permite controlar texto, placement y opciones extra.
     */
    tooltip?: string | HeroUITooltipConfig;
}

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
    const appearanceClass =
        appearance === "pagination"
            ? styles.appearancePagination
            : appearance === "header"
                ? styles.appearanceHeader
                : "";

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

    // 👇 Sin tooltip → devolvemos el botón tal cual
    if (!tooltip) return button;

    // 👇 Normalizamos a config
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