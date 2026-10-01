import React, {useEffect, useRef, useState} from "react";
import {FieldError, InputGroup, Label, TextField, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUITextField.module.css";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface HeroUITooltipConfig {
    text: React.ReactNode;
    placement?: TooltipPlacement;
    showArrow?: boolean;
    delay?: number;
    className?: string;
}

interface HeroUITextFieldProps {
    name?: string;
    type?: string;
    label?: React.ReactNode;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    width?: string | number;
    className?: string;
    inputClassName?: string;
    startIcon?: string;
    endIcon?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    requiredMessage?: string;
    invalidEmailMessage?: string;
    debounceMs?: number;
    minChars?: number;
    tooltip?: string | HeroUITooltipConfig;

    /**
     * Marks the field as invalid from the outside.
     * When `true`, the `FieldError` shows `invalidMessage`.
     * @default false
     */
    isInvalid?: boolean;
    /**
     * Custom error message shown when `isInvalid` is `true`.
     * @default "This field is invalid"
     */
    invalidMessage?: string;
}

/** Email regex used when `type === "email"`. */
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * `HeroUITextField`
 *
 * A reusable text field built on top of HeroUI v3.
 *
 * ### Validation modes
 * 1. **Internal validation** (`isRequired`, `type="email"`): handled by
 *    the `validate` prop passed to `TextField`. The message shown comes
 *    from `requiredMessage` or `invalidEmailMessage`.
 * 2. **External validation** (`isInvalid` + `invalidMessage`): you control
 *    when the field is invalid from the parent, and pass the message to show.
 *
 * When `isInvalid` is `true`, its message takes priority over the internal one.
 */
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
                                                             requiredMessage = "This field is required",
                                                             invalidEmailMessage = "Please enter a valid email address",
                                                             debounceMs = 300,
                                                             minChars = 3,
                                                             tooltip,
                                                             isInvalid = false,
                                                             invalidMessage = "This field is invalid",
                                                         }) => {
    const [localValue, setLocalValue] = useState(value);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastEmittedRef = useRef<string>(value);

    useEffect(() => {
        setLocalValue(value);
        lastEmittedRef.current = value;
    }, [value]);

    /**
     * Internal validation (used by `validate`).
     * Returns a message string when invalid, or `null` when valid.
     */
    const handleValidate = (val: string): string | null => {
        const trimmed = val.trim();

        if (isRequired && trimmed === "") {
            return requiredMessage;
        }

        if (type === "email" && trimmed !== "" && !EMAIL_REGEX.test(trimmed)) {
            return invalidEmailMessage;
        }

        return null;
    };

    /**
     * Computes the final `isInvalid` flag and the message to show.
     *
     * Priority:
     * 1. External `isInvalid` → shows `invalidMessage`.
     * 2. Internal validation via `handleValidate`.
     * 3. No error.
     */
    const internalError = handleValidate(localValue);
    const finalIsInvalid = isInvalid || internalError !== null;
    const errorMessage = isInvalid ? invalidMessage : internalError ?? "";

    const handleChange = (raw: string) => {
        setLocalValue(raw);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            const hasEnoughChars = raw.length >= minChars;

            if (hasEnoughChars) {
                if (lastEmittedRef.current !== raw) {
                    lastEmittedRef.current = raw;
                    onChange?.(raw);
                }
            } else {
                if (lastEmittedRef.current !== "") {
                    lastEmittedRef.current = "";
                    onChange?.("");
                }
            }
        }, debounceMs);
    };

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
            isInvalid={finalIsInvalid}
            validationBehavior="aria"
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

            {/* Shows the correct message based on the source of invalidity */}
            <FieldError>{errorMessage}</FieldError>
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
            <Tooltip.Trigger>
                {field}
            </Tooltip.Trigger>
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

HeroUITextField.displayName = "HeroUITextField";

export default HeroUITextField;