import React from "react";
import {Button, ButtonProps} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUIButton.module.css";

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
                          ...rest
                      }: HeroUIButtonProps) => {
    const appearanceClass =
        appearance === "pagination"
            ? styles.appearancePagination
            : appearance === "header"
                ? styles.appearanceHeader
                : "";

    return (
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
};

HeroUIButton.displayName = "HeroUIButton";

export default HeroUIButton;