import React from "react";
import {Label, ListBox, Select, Tooltip, TooltipProps} from "@heroui/react";

export interface HeroUITooltipConfig {
    text: React.ReactNode;
    placement?: TooltipProps["placement"];
    showArrow?: boolean;
    delay?: number;
    className?: string;
}

export interface HeroUISelectOption {
    id: string;
    label: string;
}

interface HeroUISelectProps {
    ariaLabel?: string;
    label?: React.ReactNode;
    options: HeroUISelectOption[];
    value?: string;
    /** 👇 Ahora siempre recibirá string, "" si se limpia */
    onChange?: (value: string) => void;
    placeholder?: string;
    width?: string | number;
    className?: string;
    tooltip?: string | HeroUITooltipConfig;
    isDisabled?: boolean;
    showClearButton?: boolean;
}

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
                                                   }) => {
    // 👇 Normaliza cualquier valor interno a string ("") y lo pasa a onChange
    const handleChange = (key: unknown) => {
        const normalized = key == null ? "" : String(key);
        onChange?.(normalized);
    };

    const select = (
        <Select
            aria-label={ariaLabel}
            className={`rounded-[5px] ${className}`.trim()}
            style={{width}}
            value={value}
            placeholder={placeholder}
            isDisabled={isDisabled}
            onChange={handleChange}
        >
            {label && <Label>{label}</Label>}

            <Select.Trigger className="rounded-[5px]">
                <Select.Value/>
                {showClearButton && <Select.ClearButton/>}
                <Select.Indicator/>
            </Select.Trigger>

            <Select.Popover className="rounded-[5px]" style={{width}}>
                <ListBox>
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

    if (!tooltip) return select;

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
                aria-label={text}
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