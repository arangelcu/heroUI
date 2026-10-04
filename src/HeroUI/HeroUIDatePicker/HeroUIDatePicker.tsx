import React, {useState} from "react";
import {Calendar, DateField, DatePicker, FieldError, Label, Tooltip,} from "@heroui/react";
import type {CalendarDate} from "@internationalized/date";
import {Icon} from "@iconify/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";


interface HeroUIDatePickerProps {
    /** Aria label for accessibility. Defaults to `"Date picker"`. */
    ariaLabel?: string;
    /** Optional visible label rendered above the field via the `Label` component. */
    label?: React.ReactNode;
    /** Controlled date value. `null` means no date selected. */
    value?: CalendarDate | null;
    /** Fired when the date changes. Receives the new value or `null`. */
    onChange?: (value: CalendarDate | null) => void;
    /** Field width. Defaults to `"195px"`. */
    width?: string | number;
    /** Additional CSS classes for the root DatePicker component. */
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
    /**
     * Optional tooltip shown on hover.
     */
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
 * ### Required validation
 * When `isRequired` is `true` and the value is `null`, the field shows
 * a `FieldError` below the input. The error disappears automatically
 * as soon as a valid date is selected.
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
 * ├── FieldError
 * └── DatePicker.Popover
 *     └── Calendar
 *         ├── Calendar.Header
 *         ├── Calendar.Grid
 *         └── Calendar.YearPickerGrid (optional)
 * ```
 *
 * ### Example — Required field
 * ```tsx
 * <HeroUIDatePicker
 *   label="Appointment"
 *   isRequired
 *   requiredMessage="Please pick a date"
 *   value={datePickerValue}
 *   onChange={setDatePickerValue}
 * />
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
                                                               requiredMessage = "This field is required",
                                                               tooltip,
                                                           }) => {
    /**
     * The field is invalid when it's required but has no value.
     * `null` and `undefined` both count as empty.
     */
    /** El error de obligatorio se muestra tras el primer onBlur, no al montar. */
    const [isTouched, setIsTouched] = useState(false);

    const isInvalid = isTouched && isRequired && (value === null || value === undefined);

    const field = (
        <DatePicker
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

            {/* FieldError shows the required message when isInvalid is true */}
            <FieldError>{requiredMessage}</FieldError>

            <DatePicker.Popover className="rounded-[5px]">
                {/* El calendario del popup no tiene etiqueta visible propia: conserva
                    un nombre accesible, con la etiqueta del campo como respaldo. */}
                <Calendar aria-label={ariaLabel ?? label}>
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