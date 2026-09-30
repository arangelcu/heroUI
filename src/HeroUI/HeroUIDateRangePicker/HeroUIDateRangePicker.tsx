import React from "react";
import {DateField, DateRangePicker, Label, RangeCalendar, Tooltip,} from "@heroui/react";
import type {DateValue} from "@internationalized/date";

interface RangeValue<T> {
    start: T;
    end: T;
}

type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface HeroUITooltipConfig {
    text: React.ReactNode;
    placement?: TooltipPlacement;
    showArrow?: boolean;
    delay?: number;
    className?: string;
}

interface HeroUIDateRangePickerProps {
    ariaLabel?: string;
    label?: React.ReactNode;
    value?: RangeValue<DateValue> | null;
    onChange?: (value: RangeValue<DateValue> | null) => void;
    width?: string | number;
    className?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUIDateRangePicker`
 *
 * Date range picker built on HeroUI v3 following the official
 * `Basic` compound component pattern.
 *
 * ### Compact styling
 * The internal `DateField.Group` is styled with a smaller font size
 * and tighter spacing so the whole control fits in ~195px, including
 * the calendar icon.
 */
const HeroUIDateRangePicker: React.FC<HeroUIDateRangePickerProps> = ({
                                                                         ariaLabel = "Date range picker",
                                                                         label,
                                                                         value = null,
                                                                         onChange,
                                                                         width = "195px",
                                                                         className = "",
                                                                         isDisabled = false,
                                                                         isRequired = false,
                                                                         tooltip,
                                                                     }) => {
    const field = (
        <DateRangePicker
            aria-label={ariaLabel}
            className={className}
            style={{width}}
            value={value}
            onChange={onChange}
            isDisabled={isDisabled}
            isRequired={isRequired}
        >
            {label && <Label>{label}</Label>}

            <DateField.Group
                fullWidth
                className="rounded-[5px] text-[11px] [&_*]:text-[11px] [&_[data-slot='segment']]:px-0"
            >
                <DateField.Input slot="start">
                    {(segment) => <DateField.Segment segment={segment}/>}
                </DateField.Input>

                <DateRangePicker.RangeSeparator className="mx-0.5 text-[10px]"/>

                <DateField.Input slot="end">
                    {(segment) => <DateField.Segment segment={segment}/>}
                </DateField.Input>

                <DateField.Suffix>
                    <DateRangePicker.Trigger>
                        <DateRangePicker.TriggerIndicator className="size-3.5"/>
                    </DateRangePicker.Trigger>
                </DateField.Suffix>
            </DateField.Group>

            <DateRangePicker.Popover className="rounded-[5px]">
                <RangeCalendar aria-label={ariaLabel}>
                    <RangeCalendar.Header>
                        <RangeCalendar.YearPickerTrigger>
                            <RangeCalendar.YearPickerTriggerHeading/>
                            <RangeCalendar.YearPickerTriggerIndicator/>
                        </RangeCalendar.YearPickerTrigger>
                        <RangeCalendar.NavButton slot="previous"/>
                        <RangeCalendar.NavButton slot="next"/>
                    </RangeCalendar.Header>

                    <RangeCalendar.Grid>
                        <RangeCalendar.GridHeader>
                            {(day) => (
                                <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                            )}
                        </RangeCalendar.GridHeader>
                        <RangeCalendar.GridBody>
                            {(date) => <RangeCalendar.Cell date={date}/>}
                        </RangeCalendar.GridBody>
                    </RangeCalendar.Grid>

                    <RangeCalendar.YearPickerGrid>
                        <RangeCalendar.YearPickerGridBody>
                            {({year}) => <RangeCalendar.YearPickerCell year={year}/>}
                        </RangeCalendar.YearPickerGridBody>
                    </RangeCalendar.YearPickerGrid>
                </RangeCalendar>
            </DateRangePicker.Popover>
        </DateRangePicker>
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

HeroUIDateRangePicker.displayName = "HeroUIDateRangePicker";

export default HeroUIDateRangePicker;