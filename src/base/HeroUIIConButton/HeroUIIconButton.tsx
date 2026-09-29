import React from "react";
import {Button, ButtonProps} from "@heroui/react";
import {Icon} from "@iconify/react";

interface HeroUIIconButtonProps extends Omit<ButtonProps, "isIconOnly" | "children"> {
    /** Nombre del icono de iconify (ej: "gravity-ui:trash-bin") */
    icon: string;
    /** Clases adicionales para el icono */
    iconClassName?: string;
}

const HeroUIIconButton = ({
                              icon,
                              iconClassName = "size-4",
                              className = "",
                              variant = "tertiary",
                              size = "sm",
                              ...rest
                          }: HeroUIIconButtonProps) => {
    return (
        <Button
            isIconOnly
            className={`rounded-[5px] ${className}`.trim()}
            size={size}
            variant={variant}
            {...rest}
        >
            <Icon className={iconClassName} icon={icon}/>
        </Button>
    );
};

export default HeroUIIconButton;