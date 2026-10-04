import React, {useState} from "react";
import {DateField, DateRangePicker, FieldError, Label, RangeCalendar, Tooltip,} from "@heroui/react";
import type {DateValue} from "@internationalized/date";
import {Icon} from "@iconify/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";

interface RangeValue<T> {
    start: T;
    end: T;
}


interface HeroUIDateRangePickerProps {
    ariaLabel?: string;
    label?: React.ReactNode;
    value?: RangeValue<DateValue> | null;
    onChange?: (value: RangeValue<DateValue> | null) => void;
    width?: string | number;
    className?: string;
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
    tooltip?: string | HeroUITooltipConfig;
}

/**
 * `HeroUIDateRangePicker`
 *
 * Date range picker built on HeroUI v3 following the official
 * `Basic` compound component pattern.
 *
 * ### Required validation
 * When `isRequired` is `true` and the value is `null`, the field shows
 * a `FieldError` below the input. The error disappears automatically
 * as soon as a valid range is selected.
 *
 * ### Dynamic font size
 * - **Empty or partially filled** → `text-[9px]` so the placeholder
 *   fits comfortably in 195px while the user types.
 * - **Fully selected range** (both `start` and `end` defined)
 *   → `text-[11px]` for better legibility.
 *
 * ### Compact styling
 * - `px-0` on each segment (removes internal padding)
 * - `gap-0` on the group (no gap between the two date fields)
 * - `mx-0 text-[8px]` on the separator (visible but minimal)
 * - `-ml-1` on the `DateField.Suffix` to pull the calendar trigger closer
 * - `size-3.5` on the trigger indicator (same as `HeroUIDatePicker`)
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
                                                                         requiredMessage = "This field is required",
                                                                         tooltip,
                                                                     }) => {
    /**
     * Whether the field has a value (both start and end defined).
     */
    const hasValue =
        value !== null &&
        value !== undefined &&
        value.start !== null &&
        value.start !== undefined &&
        value.end !== null &&
        value.end !== undefined;

    /**
     * The field is invalid when it's required but has no value.
     */
    /** El error de obligatorio se muestra tras el primer onBlur, no al montar. */
    const [isTouched, setIsTouched] = useState(false);

    const isInvalid = isTouched && isRequired && !hasValue;

    /**
     * Dynamic font size class applied to the DateField.Group.
     */
    const fontSizeClass = hasValue
        ? "text-[11px] [&_*]:text-[11px]"
        : "text-[9px] [&_*]:text-[9px]";

    const field = (
        <DateRangePicker
            aria-label={label ? undefined : ariaLabel}
            className={className}
            style={{width}}
            value={value}
            onChange={onChange}
            isDisabled={isDisabled}
            isRequired={isRequired}
            isInvalid={isInvalid}
            validationBehavior="aria"
            onBlur={() => setIsTouched(true)}
        >
            {label && <Label>{label}</Label>}

            <DateField.Group
                fullWidth
                className={`rounded-[5px] ${fontSizeClass} [&_[data-slot='segment']]:px-0 gap-0`}
            >
                <DateField.Input slot="start">
                    {(segment) => <DateField.Segment segment={segment}/>}
                </DateField.Input>

                {/* Compact separator, still visible */}
                <DateRangePicker.RangeSeparator className="mx-0 text-[8px]"/>

                <DateField.Input slot="end">
                    {(segment) => <DateField.Segment segment={segment}/>}
                </DateField.Input>

                {/* Pull the calendar trigger closer to the end date */}
                <DateField.Suffix className="-ml-1">
                    <DateRangePicker.Trigger>
                        <DateRangePicker.TriggerIndicator>
                            <Icon icon="fa6-solid:calendar" className="size-3.5"/>
                        </DateRangePicker.TriggerIndicator>
                    </DateRangePicker.Trigger>
                </DateField.Suffix>
            </DateField.Group>

            {/* FieldError shows the required message when isInvalid is true */}
            <FieldError>{requiredMessage}</FieldError>

            <DateRangePicker.Popover className="rounded-[5px]">
                {/* El calendario del popup no tiene etiqueta visible propia: conserva
                    un nombre accesible, con la etiqueta del campo como respaldo. */}
                <RangeCalendar aria-label={ariaLabel ?? label}>
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