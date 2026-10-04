import React, {useState} from "react";
import {FieldError, Label, TextArea, TextField, Tooltip} from "@heroui/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


/**
 * Props for `HeroUITextArea`.
 */
interface HeroUITextAreaProps {
    /** Aria label for accessibility. Defaults to `"Text area"`. */
    ariaLabel?: string;
    /** Optional visible label rendered above the field via the `Label` component. */
    label?: React.ReactNode;
    /** Controlled text value. */
    value?: string;
    /** Fired when the text changes. Receives the new value. */
    onChange?: (value: string) => void;
    /** Placeholder text shown when the field is empty. Defaults to `"Type here..."`. */
    placeholder?: string;
    /** Field width. Defaults to `"195px"`. */
    width?: string | number;
    /** Initial number of visible rows. Defaults to `3`. */
    minRows?: number;
    /** Maximum number of rows before the text area starts scrolling. Defaults to `8`. */
    maxRows?: number;
    /** Additional CSS classes for the root TextField component. */
    className?: string;
    /** Disables the field. Defaults to `false`. */
    isDisabled?: boolean;
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
    /** Optional tooltip. Accepts a string or a full config object. */
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUITextArea`
 *
 * Multi-line text area built on HeroUI v3 `TextArea`.
 *
 * ### Important: uses TextField as wrapper
 * `TextArea` alone is a primitive component without validation context.
 * To make `FieldError` and `isInvalid` work, it must be wrapped inside
 * `TextField`, which provides the form field context.
 */
const HeroUITextArea: React.FC<HeroUITextAreaProps> = ({
                                                           ariaLabel = "Text area",
                                                           label,
                                                           value = "",
                                                           onChange,
                                                           placeholder = "Type here...",
                                                           width = "195px",
                                                           minRows = 3,
                                                           maxRows = 8,
                                                           className = "",
                                                           isDisabled = false,
                                                           isRequired = false,
                                                           requiredMessage = "This field is required",
                                                           tooltip,
                                                       }) => {
    /**
     * The field is invalid when it's required but empty.
     * Trims whitespace so a value of `"   "` also counts as empty.
     */
    /** The required error only shows after the first onBlur, not on mount. */
    const [isTouched, setIsTouched] = useState(false);

    const isInvalid = isTouched && isRequired && (value ?? "").trim() === "";

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event.target.value);
    };

    const field = (
        <TextField
            aria-label={label ? undefined : ariaLabel}
            className={className}
            style={{width}}
            isInvalid={isInvalid}
            isRequired={isRequired}
            isDisabled={isDisabled}
            validationBehavior="aria"
            onBlur={() => setIsTouched(true)}
        >
            {label && <Label>{label}</Label>}

            <TextArea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={minRows}
                style={{maxHeight: `${maxRows * 1.5}rem`, overflowY: "auto"}}
            />

            {/* FieldError only renders when isInvalid is true */}
            <FieldError>{requiredMessage}</FieldError>
        </TextField>
    );

    // No tooltip → return the bare text area.
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

HeroUITextArea.displayName = "HeroUITextArea";

export default HeroUITextArea;