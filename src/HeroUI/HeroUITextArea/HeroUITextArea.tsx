import React, {useState} from "react";
import {FieldError, Label, TextArea, TextField, Tooltip} from "@heroui/react";
import type {HeroUITooltipConfig} from "../types";


interface HeroUITextAreaProps {
    ariaLabel?: string;
    label?: React.ReactNode;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    width?: string | number;
    minRows?: number;
    maxRows?: number;
    className?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    requiredMessage?: string;
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
 * `TextField`, which provides the form field context [citation:6][citation:7].
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
    /** El error de obligatorio se muestra tras el primer onBlur, no al montar. */
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