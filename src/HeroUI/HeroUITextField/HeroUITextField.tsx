import React, {useEffect, useRef, useState} from "react";
import {InputGroup, Label, TextField, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./HeroUITextField.module.css";

/**
 * Valid tooltip placements for HeroUI v3.
 * Uses hyphens (not spaces) as required by React Aria.
 */
type TooltipPlacement =
    | "top"
    | "bottom"
    | "left"
    | "right";

/**
 * Configuration for the tooltip shown on the text field.
 *
 * Accepts either a plain string (shorthand) or this full object.
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
 *
 * A wrapper around HeroUI's `TextField` + `InputGroup` that adds:
 * - Optional prefix/suffix icons
 * - Debounced `onChange` with a minimum character threshold
 * - Optional tooltip (string shorthand or full config)
 * - Configurable width, label, and native input props
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
    /** Marks the field as required */
    isRequired?: boolean;
    /**
     * Debounce delay (ms) before firing `onChange`.
     * @default 300
     */
    debounceMs?: number;
    /**
     * Minimum number of characters required to fire `onChange` with the real value.
     * Below this threshold, `onChange("")` is fired once to clear the filter.
     * @default 3
     */
    minChars?: number;
    /**
     * Tooltip to show on hover.
     * - String → shown as text with `placement: "top"`.
     * - Object → full control over text, placement, arrow, delay, and classes.
     */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUITextField`
 *
 * A reusable text field built on top of HeroUI v3, with debounced `onChange`,
 * optional prefix/suffix icons, and an optional tooltip.
 *
 * ### Features
 * - Controlled value with debounced callback (`debounceMs`, `minChars`)
 * - Only fires `onChange` when the user stops typing
 * - Fires `onChange("")` once when the value drops below `minChars`
 * - Optional `label` above the input
 * - Optional `startIcon` / `endIcon` (Iconify names)
 * - Optional `tooltip` as string shorthand or full config
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUITextField
 *   name="email"
 *   type="email"
 *   label="Email"
 *   placeholder="Enter your email"
 *   onChange={(v) => console.log(v)}
 * />
 * ```
 *
 * ### Example — With icons and tooltip
 * ```tsx
 * <HeroUITextField
 *   placeholder="Search..."
 *   startIcon="fa6-solid:magnifying-glass"
 *   endIcon="fa6-solid:xmark"
 *   tooltip={{
 *     text: "Search by name",
 *     placement: "top",
 *     showArrow: true,
 *     delay: 200,
 *   }}
 *   onChange={(v) => setSearch(v)}
 * />
 * ```
 *
 * ### Example — Debounce tuning
 * ```tsx
 * <HeroUITextField
 *   placeholder="Type at least 4 chars..."
 *   debounceMs={500}
 *   minChars={4}
 *   onChange={(v) => setFilter(v)}
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
                                                             debounceMs = 300,
                                                             minChars = 3,
                                                             tooltip,
                                                         }) => {
    /**
     * Local value: what the user sees in the input.
     * Kept in sync with `value` so the input stays fluid while typing,
     * but also respects external resets (e.g. "clear filters").
     */
    const [localValue, setLocalValue] = useState(value);

    /** Debounce timer for the `onChange` callback. */
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Last value emitted to the parent — avoids duplicate `onChange` calls. */
    const lastEmittedRef = useRef<string>(value);

    // Sync with external `value` (e.g. when the parent resets the filter).
    useEffect(() => {
        setLocalValue(value);
        lastEmittedRef.current = value;
    }, [value]);

    /**
     * Handles typing. Updates the local value immediately for a fluid UI,
     * then debounces the `onChange` emission:
     * - If the value has `minChars` or more, emit the real value (once).
     * - If it drops below `minChars`, emit `""` once to clear the filter.
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
     * with prefix/suffix icons.
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

    // No tooltip → return the field as-is.
    if (!tooltip) return field;

    // Normalize string shorthand into the full config object.
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