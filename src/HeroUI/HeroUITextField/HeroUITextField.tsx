import React, {useEffect, useRef, useState} from "react";
import {FieldError, InputGroup, Label, TextField, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUITextField.module.css";

/**
 * Valid tooltip placements for HeroUI v3.
 */
type TooltipPlacement =
    | "top"
    | "bottom"
    | "left"
    | "right";

/**
 * Configuration for the tooltip shown on the text field.
 */
export interface HeroUITooltipConfig {
    /** Text or content displayed inside the tooltip */
    text: React.ReactNode;
    /** Placement of the tooltip relative to the field */
    placement?: TooltipPlacement;
    /** Whether to render a small arrow pointing at the field */
    showArrow?: boolean;
    /** Delay (ms) before the tooltip appears */
    delay?: number;
    /** Extra classes for the tooltip content */
    className?: string;
}

/**
 * Props for `HeroUITextField`.
 */
interface HeroUITextFieldProps {
    /** Field name (used for form submission) */
    name?: string;
    /** HTML input type (`text`, `email`, `password`, etc.) */
    type?: string;
    /** Optional label rendered above the input */
    label?: React.ReactNode;
    /** Current value (controlled) */
    value?: string;
    /** Debounced callback fired when the value changes */
    onChange?: (value: string) => void;
    /** Placeholder text shown when the field is empty */
    placeholder?: string;
    /** Field width (default: `"195px"`) */
    width?: string | number;
    /** Extra classes for the outer container */
    className?: string;
    /** Extra classes for the inner `<input>` element */
    inputClassName?: string;
    /** Optional icon (Iconify name) rendered at the start of the input */
    startIcon?: string;
    /** Optional icon (Iconify name) rendered at the end of the input */
    endIcon?: string;
    /** Disables the field */
    isDisabled?: boolean;
    /**
     * Marks the field as required.
     * When `true`, an empty value will show a `FieldError`.
     * @default false
     */
    isRequired?: boolean;
    /**
     * Custom error message shown when the field is required and empty.
     * @default "This field is required"
     */
    requiredMessage?: string;
    /**
     * Custom error message shown when the email format is invalid.
     * Only applies when `type === "email"`.
     * @default "Please enter a valid email address"
     */
    invalidEmailMessage?: string;
    /**
     * Debounce delay (ms) before firing `onChange`.
     * @default 300
     */
    debounceMs?: number;
    /**
     * Minimum number of characters required to fire `onChange` with the real value.
     * @default 3
     */
    minChars?: number;
    /**
     * Tooltip to show on hover.
     */
    tooltip?: string | HeroUITooltipConfig;
}

/** Email regex used when `type === "email"`. */
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * `HeroUITextField`
 *
 * A reusable text field built on top of HeroUI v3.
 *
 * ### Features
 * - Debounced `onChange` with minimum character threshold
 * - Optional prefix/suffix icons
 * - Optional label above the input
 * - **Required validation**: when `isRequired` is `true` and the field
 *   is empty, a `FieldError` is displayed below the input.
 * - **Email validation**: when `type === "email"`, the value must match
 *   a valid email format, otherwise a `FieldError` is displayed.
 * - Optional tooltip (string shorthand or full config)
 *
 * ### Example — Required field
 * ```tsx
 * <HeroUITextField
 *   label="Email"
 *   type="email"
 *   isRequired
 *   onChange={(v) => console.log(v)}
 * />
 * ```
 *
 * ### Example — Email validation without required
 * ```tsx
 * <HeroUITextField
 *   label="Email"
 *   type="email"
 *   onChange={(v) => console.log(v)}
 * />
 * ```
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
                                                         }) => {
    /**
     * Local value: what the user sees in the input.
     */
    const [localValue, setLocalValue] = useState(value);

    /** Debounce timer for the `onChange` callback. */
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Last value emitted to the parent — avoids duplicate `onChange` calls. */
    const lastEmittedRef = useRef<string>(value);

    // Sync with external `value`.
    useEffect(() => {
        setLocalValue(value);
        lastEmittedRef.current = value;
    }, [value]);

    /**
     * Validates the current value.
     *
     * - If the field is `isRequired` and empty → returns `requiredMessage`.
     * - If the field is `type="email"` and the value is non-empty but
     *   doesn't match `EMAIL_REGEX` → returns `invalidEmailMessage`.
     * - Otherwise returns `null` (no error).
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
     * Handles typing. Updates the local value immediately,
     * then debounces the `onChange` emission.
     */
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

    // Clear any pending debounce on unmount.
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    /**
     * The core field: `TextField` + optional label + `InputGroup`
     * with prefix/suffix icons + `FieldError` for validation.
     *
     * Uses `validate` so HeroUI decides when to show the error,
     * and `validationBehavior="aria"` so errors appear in real time
     * without blocking form submission.
     */
    const field = (
        <TextField
            aria-label={placeholder}
            className={`${styles.container} ${className}`.trim()}
            name={name}
            type={type}
            value={localValue}
            isDisabled={isDisabled}
            isRequired={isRequired}
            validate={handleValidate}
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

            {/* FieldError shows the message returned by `validate` */}
            <FieldError/>
        </TextField>
    );

    // No tooltip → return the field as-is.
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