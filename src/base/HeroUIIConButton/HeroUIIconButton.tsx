import React from "react";
import {Button, ButtonProps, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUIIconButton.module.css";

/** Tipos de posición válidos para el tooltip (HeroUI v3) */
type TooltipPlacement =
    | "top"
    | "bottom"
    | "left"
    | "right"
   ;

interface HeroUITooltipConfig {
    /** Texto del tooltip */
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

interface HeroUIIconButtonProps extends Omit<ButtonProps, "isIconOnly" | "children"> {
    /** Nombre del icono de iconify (ej: "gravity-ui:trash-bin") */
    icon: string;
    /** Clases adicionales para el icono */
    iconClassName?: string;
    /** Apariencia especial predefinida */
    appearance?: "default" | "row" | "header" | "pagination";
    /**
     * Tooltip del botón.
     * - Si es string, se usa como texto y placement "top" por defecto.
     * - Si es objeto, permite controlar texto, placement y opciones extra.
     */
    tooltip?: string | HeroUITooltipConfig;
}

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
    const appearanceClass =
        appearance === "row"
            ? styles.appearanceRow
            : appearance === "header"
                ? styles.appearanceHeader
                : appearance === "pagination"
                    ? styles.appearancePagination
                    : "";

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

HeroUIIconButton.displayName = "HeroUIIconButton";

export default HeroUIIconButton;