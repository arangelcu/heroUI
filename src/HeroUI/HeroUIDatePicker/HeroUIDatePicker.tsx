import React from "react";
import {
    Calendar,
    DateField,
    DatePicker,
    Label,
    Tooltip,
} from "@heroui/react";
import type {CalendarDate} from "@internationalized/date";
import {Icon} from "@iconify/react";

export interface HeroUITooltipConfig {
    text: React.ReactNode;
    placement?: "top" | "bottom" | "left" | "right";
    showArrow?: boolean;
    delay?: number;
    className?: string;
}

interface HeroUIDatePickerProps {
    ariaLabel?: string;
    label?: React.ReactNode;
    value?: CalendarDate | null;
    onChange?: (value: CalendarDate | null) => void;
    width?: string | number;
    className?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUIDatePicker`
 *
 * Date picker built on HeroUI v3 using the **required compound component
 * structure**: DatePicker > DateField.Group > DateField.Input +
 * DateField.Suffix > DatePicker.Trigger > DatePicker.Popover > Calendar
 * with its own subcomponents (Header, Grid, GridBody, etc.).
 *
 * ### Compact styling
 * The internal `DateField.Group` uses a smaller font size and tighter
 * spacing so it visually matches `HeroUIDateRangePicker` at ~195px,
 * including the calendar icon.
 *
 * ### v3 Breaking Changes
 * - `DatePicker.Trigger` must be rendered **inside** `DateField.Suffix`.
 * - `Calendar` is **not** self-contained. You must explicitly compose:
 *   `Calendar.Header`, `Calendar.Grid`, `Calendar.GridHeader`,
 *   `Calendar.GridBody`, `Calendar.Cell`, and optionally
 *   `Calendar.YearPickerTrigger` + `Calendar.YearPickerGrid`.
 * - The `Popup` wrapper around `Calendar` in v2 is now `DatePicker.Popover`.
 *
 * ### Structure
 * ```
 * DatePicker
 * ├── Label
 * ├── DateField.Group (fullWidth)
 * │   ├── DateField.Input → DateField.Segment
 * │   └── DateField.Suffix
 * │       └── DatePicker.Trigger
 * │           └── DatePicker.TriggerIndicator
 * └── DatePicker.Popover
 *     └── Calendar
 *         ├── Calendar.Header (NavButton previous/next + YearPickerTrigger)
 *         ├── Calendar.Grid
 *         │   ├── Calendar.GridHeader → Calendar.HeaderCell
 *         │   └── Calendar.GridBody → Calendar.Cell
 *         └── Calendar.YearPickerGrid (optional)
 *             └── Calendar.YearPickerGridBody → Calendar.YearPickerCell
 * ```
 */
const HeroUIDatePicker: React.FC<HeroUIDatePickerProps> = ({
                                                               ariaLabel = "Date picker",
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
        <DatePicker
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
                <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment}/>}
                </DateField.Input>

                {/* Trigger MUST live inside DateField.Suffix */}
                <DateField.Suffix>
                    <DatePicker.Trigger>
                        <DatePicker.TriggerIndicator>
                            <Icon icon="fa6-solid:calendar" className="size-3.5"/>
                        </DatePicker.TriggerIndicator>
                    </DatePicker.Trigger>
                </DateField.Suffix>
            </DateField.Group>

            <DatePicker.Popover className="rounded-[5px]">
                <Calendar aria-label={ariaLabel}>
                    {/* Header with year picker trigger + nav buttons */}
                    <Calendar.Header>
                        <Calendar.YearPickerTrigger>
                            <Calendar.YearPickerTriggerHeading/>
                            <Calendar.YearPickerTriggerIndicator/>
                        </Calendar.YearPickerTrigger>
                        <Calendar.NavButton slot="previous"/>
                        <Calendar.NavButton slot="next"/>
                    </Calendar.Header>

                    {/* Month grid */}
                    <Calendar.Grid>
                        <Calendar.GridHeader>
                            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                            {(date) => <Calendar.Cell date={date}/>}
                        </Calendar.GridBody>
                    </Calendar.Grid>

                    {/* Year picker overlay */}
                    <Calendar.YearPickerGrid>
                        <Calendar.YearPickerGridBody>
                            {({year}) => <Calendar.YearPickerCell year={year}/>}
                        </Calendar.YearPickerGridBody>
                    </Calendar.YearPickerGrid>
                </Calendar>
            </DatePicker.Popover>
        </DatePicker>
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

HeroUIDatePicker.displayName = "HeroUIDatePicker";

export default HeroUIDatePicker;