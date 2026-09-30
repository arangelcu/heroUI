import React from "react";
import {FieldError, Label, ListBox, Select, Tooltip} from "@heroui/react";

/**
 * Valid tooltip placements for HeroUI v3.
 */
type TooltipPlacement = "top" | "bottom" | "left" | "right";

/**
 * Configuration for the tooltip shown on the select.
 */
export interface HeroUITooltipConfig {
    /** Text or content displayed inside the tooltip */
    text: React.ReactNode;
    /** Placement of the tooltip relative to the trigger */
    placement?: TooltipPlacement;
    /** Whether to render a small arrow pointing at the trigger */
    showArrow?: boolean;
    /** Delay (ms) before the tooltip appears */
    delay?: number;
    /** Extra classes for the tooltip content */
    className?: string;
}

/**
 * A single option rendered in the select list.
 */
export interface HeroUISelectOption {
    /** Unique identifier of the option */
    id: string;
    /** Visible label of the option */
    label: string;
}

/**
 * Props for `HeroUISelect`.
 */
interface HeroUISelectProps {
    /** Accessible label (for screen readers) */
    ariaLabel?: string;
    /** Optional label rendered above the trigger */
    label?: React.ReactNode;
    /** Options rendered in the listbox */
    options: HeroUISelectOption[];
    /**
     * Current value.
     * - In single mode: a string.
     * - In multiple mode: an array of strings.
     */
    value?: string | string[];
    /**
     * Callback fired when the selection changes.
     * - In single mode: receives a string ("" when cleared).
     * - In multiple mode: receives an array of strings.
     */
    onChange?: (value: string | string[]) => void;
    /** Placeholder shown when no value is selected */
    placeholder?: string;
    /** Width of the select (default: `"195px"`) */
    width?: string | number;
    /** Extra classes for the trigger */
    className?: string;
    /**
     * Tooltip shown on hover.
     */
    tooltip?: string | HeroUITooltipConfig;
    /** Disables the select */
    isDisabled?: boolean;
    /** Shows a clear button inside the trigger */
    showClearButton?: boolean;
    /**
     * Selection mode.
     * - `"single"` (default) → only one option can be selected.
     * - `"multiple"` → several options can be selected.
     */
    selectionMode?: "single" | "multiple";
    /**
     * Marks the field as required.
     * When `true` and the value is empty, `isInvalid` becomes `true`
     * and the `FieldError` is displayed.
     * @default false
     */
    isRequired?: boolean;
    /**
     * Custom error message shown when the field is required and empty.
     * @default "This field is required"
     */
    requiredMessage?: string;
}

/**
 * `HeroUISelect`
 *
 * A select built on top of HeroUI v3, with optional label, clear button,
 * single/multiple selection, tooltip, and required validation.
 *
 * ### Required validation
 * When `isRequired` is `true` and the value is empty, the field shows
 * a `FieldError` below the trigger. The error disappears automatically
 * as soon as a valid option is selected.
 *
 * ### Example — Single selection
 * ```tsx
 * <HeroUISelect
 *   ariaLabel="Filter by role"
 *   options={ROLE_OPTIONS}
 *   value={role}
 *   placeholder="Select a role"
 *   onChange={(v) => setRole(v as string)}
 * />
 * ```
 *
 * ### Example — Required field
 * ```tsx
 * <HeroUISelect
 *   ariaLabel="Filter by role"
 *   label="Role"
 *   options={ROLE_OPTIONS}
 *   value={role}
 *   placeholder="Select a role"
 *   isRequired
 *   requiredMessage="Please select a role"
 *   onChange={(v) => setRole(v as string)}
 * />
 * ```
 */
const HeroUISelect: React.FC<HeroUISelectProps> = ({
                                                       ariaLabel = "Select",
                                                       label,
                                                       options,
                                                       value,
                                                       onChange,
                                                       placeholder,
                                                       width = "195px",
                                                       className = "",
                                                       tooltip,
                                                       isDisabled = false,
                                                       showClearButton = false,
                                                       selectionMode = "single",
                                                       isRequired = false,
                                                       requiredMessage = "This field is required",
                                                   }) => {
    /** Whether the select allows multiple selections. */
    const isMultiple = selectionMode === "multiple";

    /**
     * The field is invalid when it's required but has no value.
     * - Single mode: empty string or `undefined` counts as empty.
     * - Multiple mode: empty array counts as empty.
     */
    const isInvalid = isRequired && (
        isMultiple
            ? !Array.isArray(value) || value.length === 0
            : !value || value === ""
    );

    /**
     * Normalizes the internal HeroUI value to a stable type:
     * - Single mode → `string` (empty string when cleared).
     * - Multiple mode → `string[]`.
     */
    const handleChange = (key: unknown) => {
        if (isMultiple) {
            const values = Array.isArray(key)
                ? key.map(String)
                : key instanceof Set
                    ? Array.from(key).map(String)
                    : [];
            onChange?.(values);
        } else {
            onChange?.(key == null ? "" : String(key));
        }
    };

    const select = (
        <Select
            aria-label={ariaLabel}
            className={`rounded-[5px] ${className}`.trim()}
            style={{width}}
            value={value}
            placeholder={placeholder}
            isDisabled={isDisabled}
            selectionMode={selectionMode}
            isRequired={isRequired}
            isInvalid={isInvalid}
            validationBehavior="aria"
            onChange={handleChange}
        >
            {label && <Label>{label}</Label>}

            <Select.Trigger className="rounded-[5px]">
                <Select.Value/>
                {showClearButton && !isMultiple && <Select.ClearButton/>}
                <Select.Indicator/>
            </Select.Trigger>

            {/* FieldError only renders when isInvalid is true */}
            <FieldError>{requiredMessage}</FieldError>

            <Select.Popover className="rounded-[5px]" style={{width}}>
                <ListBox selectionMode={selectionMode}>
                    {options.map((opt) => (
                        <ListBox.Item
                            key={opt.id}
                            id={opt.id}
                            textValue={opt.label}
                        >
                            {opt.label}
                            <ListBox.ItemIndicator/>
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );

    // No tooltip → return the select as-is.
    if (!tooltip) return select;

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
            <Tooltip.Trigger>
                {select}
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

HeroUISelect.displayName = "HeroUISelect";

export default HeroUISelect;