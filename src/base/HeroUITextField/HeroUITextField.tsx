import React, {useEffect, useRef, useState} from "react";
import {InputGroup, Label, TextField, Tooltip, TooltipProps} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUITextField.module.css";

export interface HeroUITooltipConfig {
    /** Texto o contenido del tooltip */
    text: React.ReactNode;
    /** Posición del tooltip */
    placement?: TooltipProps["placement"];
    /** Mostrar la flechita */
    showArrow?: boolean;
    /** Delay antes de mostrarse (ms) */
    delay?: number;
    /** Clases extra para el contenido */
    className?: string;
}

interface HeroUITextFieldProps {
    name?: string;
    type?: string;
    label?: React.ReactNode;
    value?: string;
    /** Callback al cambiar el valor (debounced) */
    onChange?: (value: string) => void;
    placeholder?: string;
    width?: string | number;
    className?: string;
    inputClassName?: string;
    startIcon?: string;
    endIcon?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    /**
     * Milisegundos de espera antes de disparar `onChange`.
     * @default 300
     */
    debounceMs?: number;
    /**
     * Mínimo de caracteres para disparar `onChange` con el valor real.
     * Por debajo de `minChars`, se dispara `""` solo una vez para limpiar el filtro.
     * @default 3
     */
    minChars?: number;
    tooltip?: string | HeroUITooltipConfig;
}

const HeroUITextField: React.FC<HeroUITextFieldProps> = ({
                                                             name,
                                                             type = "text",
                                                             label,
                                                             value = "",
                                                             onChange,
                                                             placeholder,
                                                             width = "195px",
                                                             className = "",
                                                             inputClassName = "",
                                                             startIcon,
                                                             endIcon,
                                                             isDisabled = false,
                                                             isRequired = false,
                                                             debounceMs = 300,
                                                             minChars = 3,
                                                             tooltip,
                                                         }) => {
    const [localValue, setLocalValue] = useState(value);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 👇 Recuerda el último valor que se disparó hacia el padre
    const lastEmittedRef = useRef<string>(value);

    // 👇 Sincroniza cuando el valor externo cambia (por ejemplo, al hacer clear)
    useEffect(() => {
        setLocalValue(value);
        lastEmittedRef.current = value;
    }, [value]);

    const handleChange = (raw: string) => {
        setLocalValue(raw);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            const hasEnoughChars = raw.length >= minChars;

            if (hasEnoughChars) {
                // 👇 Solo disparamos si realmente cambió
                if (lastEmittedRef.current !== raw) {
                    lastEmittedRef.current = raw;
                    onChange?.(raw);
                }
            } else {
                // 👇 Por debajo del mínimo: solo disparamos "" si no lo habíamos hecho ya
                if (lastEmittedRef.current !== "") {
                    lastEmittedRef.current = "";
                    onChange?.("");
                }
            }
        }, debounceMs);
    };

    // 👇 Limpia el timeout al desmontar
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const field = (
        <TextField
            aria-label={placeholder}
            className={`${styles.container} ${className}`.trim()}
            name={name}
            type={type}
            value={localValue}
            isDisabled={isDisabled}
            isRequired={isRequired}
            style={{width}}
            onChange={handleChange}
        >
            {label && <Label>{label}</Label>}

            <InputGroup className="rounded-[5px]">
                {startIcon && (
                    <InputGroup.Prefix>
                        <Icon className="size-4 text-muted" icon={startIcon}/>
                    </InputGroup.Prefix>
                )}

                <InputGroup.Input
                    className={inputClassName}
                    placeholder={placeholder}
                />

                {endIcon && (
                    <InputGroup.Suffix>
                        <Icon className="size-4 text-muted" icon={endIcon}/>
                    </InputGroup.Suffix>
                )}
            </InputGroup>
        </TextField>
    );

    if (!tooltip) return field;

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
            {field}
            <Tooltip.Content
                aria-label={text}
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

HeroUITextField.displayName = "HeroUITextField";

export default HeroUITextField;