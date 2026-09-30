import React from "react";
import {TextArea, Tooltip} from "@heroui/react";

/**
 * Configuration for the tooltip that wraps the text area.
 *
 * Can be provided either as a plain string (shorthand for just the text)
 * or as this full object for finer control.
 */
export interface HeroUITooltipConfig {
    /** Tooltip content. Accepts a string or ReactNode. */
    text: React.ReactNode;
    /** Tooltip placement relative to the text area. Defaults to `"top"`. */
    placement?: "top" | "bottom" | "left" | "right";
    /** Shows or hides the tooltip arrow. Defaults to `false`. */
    showArrow?: boolean;
    /** Delay in ms before showing the tooltip. Defaults to `0`. */
    delay?: number;
    /** Additional CSS classes for the tooltip content. */
    className?: string;
}

interface HeroUITextAreaProps {
    /** Aria label for accessibility. Defaults to `"Text area"`. */
    ariaLabel?: string;
    /** Controlled value of the text area. */
    value?: string;
    /**
     * Fired on every keystroke.
     * Receives the plain string value (not the native change event).
     */
    onChange?: (value: string) => void;
    /** Placeholder shown when the text area is empty. Defaults to `"Type here..."`. */
    placeholder?: string;
    /** Text area width. Defaults to `"195px"`. */
    width?: string | number;
    /**
     * Number of visible rows (maps to the native `rows` attribute).
     * Defaults to `3`.
     *
     * Note: HeroUI v3 TextArea does not support `minRows` / `maxRows`
     * for auto-sizing. Use `rows` for a fixed height instead.
     */
    minRows?: number;
    /**
     * Maximum number of rows.
     *
     * Note: kept for API compatibility with previous versions,
     * but HeroUI v3 TextArea does not apply auto-sizing based on it.
     * Defaults to `8`.
     */
    maxRows?: number;
    /** Additional CSS classes for the text area. */
    className?: string;
    /** Disables the text area. Defaults to `false`. */
    isDisabled?: boolean;
    /**
     * Optional tooltip shown on hover.
     * Accepts a string (shorthand) or a full config object.
     */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUITextArea`
 *
 * Multi-line text area built on HeroUI v3 `TextArea`.
 *
 * ### Behavior
 * - HeroUI v3 `TextArea` is a primitive component that exposes a native
 *   `React.ChangeEvent<HTMLTextAreaElement>` on `onChange`. This wrapper
 *   adapts it internally so the parent receives a clean `(value: string) => void`.
 * - When a `tooltip` is provided, the text area is wrapped in
 *   `Tooltip.Trigger` (required in HeroUI v3 for tooltips to work).
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUITextArea
 *   ariaLabel="Comments"
 *   value={comments}
 *   onChange={setComments}
 *   placeholder="Write your comments..."
 * />
 * ```
 *
 * ### Example — With tooltip and custom width
 * ```tsx
 * <HeroUITextArea
 *   ariaLabel="Description"
 *   value={description}
 *   onChange={setDescription}
 *   width="320px"
 *   rows={5}
 *   tooltip={{ text: "Add a short description", placement: "top", showArrow: true }}
 * />
 * ```
 */
const HeroUITextArea: React.FC<HeroUITextAreaProps> = ({
                                                           ariaLabel = "Text area",
                                                           value,
                                                           onChange,
                                                           placeholder = "Type here...",
                                                           width = "195px",
                                                           minRows = 3,
                                                           maxRows = 8,
                                                           className = "",
                                                           isDisabled = false,
                                                           tooltip,
                                                       }) => {
    /**
     * Adapts the native textarea change event to a plain string value,
     * so the parent doesn't need to know about the underlying event.
     *
     * @param event - Native React change event from the textarea.
     */
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event.target.value);
    };

    const field = (
        <TextArea
            aria-label={ariaLabel}
            className={className}
            style={{width}}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            rows={minRows}
            disabled={isDisabled}
        />
    );

    // No tooltip → return the bare text area.
    if (!tooltip) return field;

    // Normalize the string shorthand into the full config object.
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
            {/*
             * HeroUI v3 requires the trigger element to be wrapped in
             * `Tooltip.Trigger`. Passing the element as a direct child
             * of `Tooltip` no longer works (v2 behavior).
             */}
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

HeroUITextArea.displayName = "HeroUITextArea";

export default HeroUITextArea;