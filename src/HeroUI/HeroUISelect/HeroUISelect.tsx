import React from "react";
import {Label, ListBox, Select, Tooltip} from "@heroui/react";

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
 * Configuration for the tooltip shown on the select.
 *
 * Accepts either a plain string (shorthand) or this full object.
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
 *
 * A wrapper around HeroUI's `Select` that adds:
 * - Optional label above the trigger
 * - Optional clear button inside the trigger
 * - Single or multiple selection mode
 * - Optional tooltip (string shorthand or full config)
 * - Configurable width
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
     * - String → shown as text with `placement: "top"`.
     * - Object → full control over text, placement, arrow, delay, and classes.
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
}

/**
 * `HeroUISelect`
 *
 * A select built on top of HeroUI v3, with optional label, clear button,
 * single/multiple selection, and tooltip.
 *
 * ### Features
 * - Single or multiple selection (`selectionMode`)
 * - Optional label above the trigger
 * - Optional clear button inside the trigger
 * - Optional tooltip as string shorthand or full config
 * - Normalizes internal values to string / string[]
 *
 * ### Example — Single selection
 * ```tsx
 * <HeroUISelect
 *   ariaLabel="Filter by role"
 *   options={[
 *     { id: "CEO", label: "CEO" },
 *     { id: "CTO", label: "CTO" },
 *   ]}
 *   value={role}
 *   placeholder="Select a role"
 *   onChange={(v) => setRole(v as string)}
 * />
 * ```
 *
 * ### Example — Multiple selection
 * ```tsx
 * <HeroUISelect
 *   ariaLabel="Countries to visit"
 *   label="Countries to Visit"
 *   selectionMode="multiple"
 *   options={COUNTRIES}
 *   value={selected}
 *   placeholder="Select countries"
 *   onChange={(v) => setSelected(v as string[])}
 * />
 * ```
 *
 * ### Example — With clear button and tooltip
 * ```tsx
 * <HeroUISelect
 *   ariaLabel="Filter by status"
 *   options={STATUS_OPTIONS}
 *   value={status}
 *   placeholder="Select a status"
 *   showClearButton
 *   tooltip={{ text: "Filter by status", placement: "top", showArrow: true }}
 *   onChange={(v) => setStatus(v as string)}
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
                                                   }) => {
    /** Whether the select allows multiple selections. */
    const isMultiple = selectionMode === "multiple";

    /**
     * Normalizes the internal HeroUI value to a stable type:
     * - Single mode → `string` (empty string when cleared).
     * - Multiple mode → `string[]`.
     */
    const handleChange = (key: unknown) => {
        if (isMultiple) {
            // HeroUI passes a Set or an array-like of keys.
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
            onChange={handleChange}
        >
            {label && <Label>{label}</Label>}

            <Select.Trigger className="rounded-[5px]">
                <Select.Value/>
                {showClearButton && !isMultiple && <Select.ClearButton/>}
                <Select.Indicator/>
            </Select.Trigger>

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
            {select}
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