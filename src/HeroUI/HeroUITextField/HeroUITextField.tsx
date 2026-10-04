import React, {useEffect, useRef, useState} from "react";
import {FieldError, InputGroup, Label, TextField, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import styles from "./HeroUITextField.module.css";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


/**
 * Props for `HeroUITextField`.
 */
interface HeroUITextFieldProps {
    /** Field name (used for form submission). */
    name?: string;
    /** Native input type. Defaults to `"text"`. Use `"email"` to enable email validation. */
    type?: string;
    /** Optional visible label rendered above the field via the `Label` component. */
    label?: React.ReactNode;
    /** Controlled text value. */
    value?: string;
    /** Debounced callback fired when the value changes. */
    onChange?: (value: string) => void;
    /** Placeholder text shown when the field is empty. */
    placeholder?: string;
    /** Field width. Defaults to `"195px"`. */
    width?: string | number;
    /** Additional CSS classes for the root TextField component. */
    className?: string;
    /** Additional CSS classes for the inner input element. */
    inputClassName?: string;
    /** Optional Iconify icon name rendered as a prefix. */
    startIcon?: string;
    /** Optional Iconify icon name rendered as a suffix. */
    endIcon?: string;
    /** Disables the field. Defaults to `false`. */
    isDisabled?: boolean;
    /**
     * Marks the field as required.
     * When `true` and the value is empty, the `FieldError` shows
     * `requiredMessage`.
     * @default false
     */
    isRequired?: boolean;
    /**
     * Custom error message shown when the field is required and empty.
     * @default "This field is required"
     */
    requiredMessage?: string;
    /**
     * Custom error message shown when `type` is `"email"` and the value
     * is not a valid email address.
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
    /** Optional tooltip. Accepts a string or a full config object. */
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

    /**
     * While the user has focus, the `value` prop must not overwrite what they
     * are typing. Without this guard, dropping below `minChars` emits
     * `onChange("")`, the parent sets `value=""`, and this effect erased the
     * text just typed.
     */
    const isEditingRef = useRef(false);

    useEffect(() => {
        if (!isEditingRef.current) {
            setLocalValue(value);
        }
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
    /**
     * The error is not shown until the user interacts: without this the
     * required field started out red with its message already visible.
     */
    const [isTouched, setIsTouched] = useState(false);

    const internalError = handleValidate(localValue);
    const finalIsInvalid = isInvalid || internalError !== null;
    // The message also respects `isTouched` so it does not appear on mount.
    const errorMessage = isInvalid ? invalidMessage : (isTouched ? internalError ?? "" : "");

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

    /**
     * The accessible name comes from the visible `<Label>` when it exists. If
     * `aria-label` is also passed, React Aria stops associating the visible
     * label with the control (the `<Label>` gets no id/htmlFor and does not
     * focus on click) and the reader announces the aria-label instead of the
     * visible text. That is why it is only used as a fallback when there is no
     * visible label.
     */
    const ariaLabelProps = label ? {} : {"aria-label": placeholder};

    /** Props shared by both render branches (with and without tooltip). */
    const textFieldProps = {
        ...ariaLabelProps,
        className: `${styles.container} ${className}`.trim(),
        name,
        type,
        value: localValue,
        isDisabled,
        isRequired,
        isInvalid: isTouched && finalIsInvalid,
        validationBehavior: "aria" as const,
        style: {width},
        onChange: handleChange,
        onFocus: () => {
            isEditingRef.current = true;
        },
        onBlur: () => {
            isEditingRef.current = false;
            setIsTouched(true);
        },
    };

    /**
     * The tooltip wraps ONLY the InputGroup, which is a real element: React Aria
     * places the trigger props on that node. A Fragment does not work as a
     * trigger (it is not a DOM element), and `Tooltip.Trigger` would add a
     * `<div role="button">` with tabIndex=0, that is, one extra tab stop per
     * field.
     */
    const inputGroup = (
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
    );

    /** Error message: only rendered when the field is invalid. */
    const error = <FieldError>{errorMessage}</FieldError>;

    /**
     * The tooltip uses `Tooltip.Trigger` on purpose: that wrapper is the
     * focusable element (the library applies `useFocusable` to it), and it is
     * what makes the tooltip open with the keyboard. Passing the field directly
     * as a child would make it open only with the mouse, making accessibility
     * worse.
     */
    const field = (
        <TextField {...textFieldProps}>
            {label && <Label>{label}</Label>}
            {inputGroup}
            {error}
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