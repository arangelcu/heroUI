import React, {useEffect, useRef, useState} from "react";
import {FieldError, InputGroup, Label, TextField, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import styles from "./HeroUIPhone.module.css";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


/**
 * Props for `HeroUIPhone`.
 */
interface HeroUIPhoneProps {
    /** Field name (used for form submission) */
    name?: string;
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
     * Custom error message shown when the phone format is invalid.
     * @default "Please enter a valid US phone number"
     */
    invalidPhoneMessage?: string;
    /**
     * Custom regex to validate the phone number.
     * Defaults to the US phone regex.
     */
    phoneRegex?: RegExp;
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

/**
 * Default regex for **US phone numbers**.
 *
 * Accepts these formats:
 * - `5551234567`           (10 digits, no separators)
 * - `555-123-4567`         (dashes)
 * - `555.123.4567`         (dots)
 * - `555 123 4567`         (spaces)
 * - `(555) 123-4567`       (parentheses)
 * - `+1 555 123 4567`      (country code with +)
 * - `1-555-123-4567`       (country code with dash)
 *
 * Rules:
 * - Optional country code `+1` or `1` at the start.
 * - Area code and local number = exactly 10 digits.
 * - Separators allowed: space, dash, dot, parentheses.
 */
const DEFAULT_PHONE_REGEX =
    /^(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

/** Maximum number of characters allowed in the input. */
const MAX_LENGTH = 15;

/**
 * `HeroUIPhone`
 *
 * US phone number input built on HeroUI v3, with a phone icon prefix,
 * regex-based validation, and a hard 15-character limit.
 *
 * ### Features
 * - Phone icon prefix (`fa6-solid:phone`)
 * - **US phone regex validation** by default (can be overridden via `phoneRegex`).
 * - **Required validation**: when `isRequired` is `true` and the field
 *   is empty, a `FieldError` is displayed.
 * - **Hard limit**: the input is capped at 15 characters.
 * - Debounced `onChange` with a minimum character threshold.
 * - Optional tooltip (string shorthand or full config).
 *
 * ### Validation rules
 * - If `isRequired` is `true` and the value is empty → `requiredMessage`.
 * - If the value is non-empty and doesn't match `phoneRegex` →
 *   `invalidPhoneMessage`.
 * - Otherwise → no error.
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUIPhone
 *   label="Phone"
 *   value={phone}
 *   onChange={setPhone}
 * />
 * ```
 *
 * ### Example — Required with custom message
 * ```tsx
 * <HeroUIPhone
 *   label="Contact phone"
 *   isRequired
 *   requiredMessage="Please enter your phone"
 *   invalidPhoneMessage="That's not a valid US phone number"
 *   value={phone}
 *   onChange={setPhone}
 *   tooltip="Enter your US phone number"
 * />
 * ```
 *
 * ### Example — Custom regex (e.g. only digits, no separators)
 * ```tsx
 * <HeroUIPhone
 *   label="Phone (digits only)"
 *   phoneRegex={/^\d{10}$/}
 *   invalidPhoneMessage="Enter exactly 10 digits"
 *   value={phone}
 *   onChange={setPhone}
 * />
 * ```
 */
const HeroUIPhone: React.FC<HeroUIPhoneProps> = ({
                                                     name,
                                                     label,
                                                     value = "",
                                                     onChange,
                                                     placeholder = "Enter phone number...",
                                                     width = "195px",
                                                     className = "",
                                                     inputClassName = "",
                                                     isDisabled = false,
                                                     isRequired = false,
                                                     requiredMessage = "This field is required",
                                                     invalidPhoneMessage = "Please enter a valid US phone number",
                                                     phoneRegex = DEFAULT_PHONE_REGEX,
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

    /**
     * Mientras el usuario tiene el foco, el prop `value` no debe pisar lo que
     * esta escribiendo. Sin esta guarda, bajar de `minChars` emite `onChange("")`,
     * el padre pone `value=""` y este efecto borraba el texto recien escrito.
     */
    const isEditingRef = useRef(false);

    // Sync with external `value`.
    useEffect(() => {
        if (!isEditingRef.current) {
            setLocalValue(value);
        }
        lastEmittedRef.current = value;
    }, [value]);

    /**
     * El error de obligatorio no se muestra hasta que el usuario interactua: sin
     * esto el campo nacia en rojo con su mensaje ya visible. Un numero mal formado
     * si se avisa de inmediato, porque ya hay algo escrito.
     */
    const [isTouched, setIsTouched] = useState(false);

    /**
     * Validates the current phone value.
     *
     * - If the field is `isRequired` and empty → returns `requiredMessage`.
     * - If the value is non-empty but doesn't match `phoneRegex` →
     *   returns `invalidPhoneMessage`.
     * - Otherwise returns `null` (no error).
     */
    const handleValidate = (val: string): string | null => {
        const trimmed = val.trim();

        if (isRequired && trimmed === "") {
            return isTouched ? requiredMessage : null;
        }

        if (trimmed !== "" && !phoneRegex.test(trimmed)) {
            return invalidPhoneMessage;
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

    const field = (
        <TextField
            aria-label={label ? undefined : placeholder}
            className={`${styles.container} ${className}`.trim()}
            name={name}
            type="tel"
            value={localValue}
            isDisabled={isDisabled}
            isRequired={isRequired}
            validate={handleValidate}
            validationBehavior="aria"
            style={{width}}
            onChange={handleChange}
            onFocus={() => {
                isEditingRef.current = true;
            }}
            onBlur={() => {
                isEditingRef.current = false;
                setIsTouched(true);
            }}
        >
            {label && <Label>{label}</Label>}

            <InputGroup className="rounded-[5px]">
                <InputGroup.Prefix>
                    <Icon className="size-3 text-muted" icon="fa6-solid:phone"/>
                </InputGroup.Prefix>

                <InputGroup.Input
                    className={inputClassName}
                    placeholder={placeholder}
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={MAX_LENGTH}
                />
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

HeroUIPhone.displayName = "HeroUIPhone";

export default HeroUIPhone;