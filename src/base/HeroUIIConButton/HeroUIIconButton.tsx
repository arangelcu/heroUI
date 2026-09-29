import React from "react";
import {Button, ButtonProps} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUIIconButton.module.css";

interface HeroUIIconButtonProps extends Omit<ButtonProps, "isIconOnly" | "children"> {
    /** Nombre del icono de iconify (ej: "gravity-ui:trash-bin") */
    icon: string;
    /** Clases adicionales para el icono */
    iconClassName?: string;
    /** Apariencia especial predefinida */
    appearance?: "default" | "row" | "header" | "pagination";
}

const HeroUIIconButton = ({
                              icon,
                              iconClassName = "size-4",
                              className = "",
                              variant = "tertiary",
                              size = "sm",
                              appearance = "default",
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

    return (
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
};

HeroUIIconButton.displayName = "HeroUIIconButton";

export default HeroUIIconButton;