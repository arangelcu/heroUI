import React from "react";
import {Button, ButtonProps, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import {tv, type VariantProps} from "tailwind-variants";
import styles from "./HeroUIButton.module.css";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";
import {buttonOnlyTones, sharedTones} from "../HeroUIUtils/tones";

/* -------------------------------------------------------------------------- */
/*                               Tooltip types                                */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                          Custom tone variants                              */
/* -------------------------------------------------------------------------- */

const buttonTones = tv({
    base: "rounded-[5px] transition-colors",
    variants: {
        tone: {
            ...sharedTones,
            ...buttonOnlyTones,
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