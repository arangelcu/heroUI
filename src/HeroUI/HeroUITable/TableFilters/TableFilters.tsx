import React from "react";
import styles from "./TableFilters.module.css";
import HeroUIIconButton from "../../HeroUIIConButton/HeroUIIconButton";
import HeroUISelect from "../../HeroUISelect/HeroUISelect";
import HeroUITextField from "../../HeroUITextField/HeroUITextField";
import {Icon} from "@iconify/react";
import {ROLE_OPTIONS, STATUS_OPTIONS} from "./filterOptions";

export interface FilterValues {
    /** Free-text filter applied to the "name" field */
    name?: string;
    /** Single-select filter applied to the "role" field */
    role?: string;
    /** Multi-select filter applied to the "status" field */
    status?: string[];
}

interface TableFiltersProps {
    /** Current filter values. The component is controlled. */
    filters: FilterValues;
    /** Name or string of the icon rendered at the start (e.g. "fa6-solid:users") */
    startIcon?: string;
    /** Free content aligned to the left (e.g. a title) */
    start?: React.ReactNode;
    /** Extra buttons aligned to the right (rendered before the built-in ones) */
    end?: React.ReactNode;

    /** Show the filters toggle button, plus the clear/save actions */
    enableFiltersBtn?: boolean;
    /** Show the refresh button */
    enableRefreshBtn?: boolean;
    /** Callback fired when the refresh button is pressed */
    onRefresh?: () => void;

    /** Show the "name" free-text filter */
    enableFilterName?: boolean;
    /** Show the "role" multi-option filter */
    enableFilterRole?: boolean;
    /** Show the "status" multi-select filter */
    enableFilterStatus?: boolean;

    /** Callback fired with the next filter values on every change */
    onFilterChange?: (filters: FilterValues) => void;
    /** Placeholder of the name search input */
    namePlaceholder?: string;
    /** Extra classes applied to the outer container */
    className?: string;
}

/**
 * `TableFilters`
 *
 * Filter bar that sits above the table: start slot (icon + title or filters),
 * end slot with the built-in clear / save / toggle / refresh actions.
 */
const TableFilters: React.FC<TableFiltersProps> = ({
                                                       filters,
                                                       startIcon,
                                                       start,
                                                       end,
                                                       enableFiltersBtn = false,
                                                       enableRefreshBtn = false,
                                                       onRefresh,
                                                       enableFilterName = false,
                                                       enableFilterRole = false,
                                                       enableFilterStatus = false,
                                                       onFilterChange,
                                                       namePlaceholder = "Type to Search...",
                                                       className = "",
                                                   }) => {
    const [showFilters, setShowFilters] = React.useState(false);

    /**
     * Because the component is controlled (the state lives in the parent), `filters`
     * always reflects the most recent value and there is no stale closure: the case
     * that failed was when the component itself kept a copy and the debounce of
     * `HeroUITextField` merged over an old version.
     */
    const updateFilter = <K extends keyof FilterValues>(
        key: K,
        value: FilterValues[K] | undefined
    ) => {
        onFilterChange?.({...filters, [key]: value});
    };

    /** Clears every filter by reporting an empty value map to the parent. */
    const handleClearFilters = () => {
        onFilterChange?.({});
    };

    /** Number of filters that currently hold a non-empty value. */
    const activeFiltersCount = (Object.keys(filters) as Array<keyof FilterValues>)
        .filter((key) => {
            const value = filters[key];
            if (value === undefined || value === null || value === "") return false;
            if (Array.isArray(value)) return value.length > 0;
            return true;
        }).length;

    return (
        <div className={`${styles.container} ${className}`.trim()}>
            {/* ---------------------------------------------------------------
                Left side: icon + title or filters
                --------------------------------------------------------------- */}
            <div className={styles.start}>
                {!showFilters && (
                    <div className="flex items-center gap-2">
                        {/* If a startIcon is passed, it is rendered using the theme's green color */}
                        {startIcon && (
                            <Icon
                                icon={startIcon}
                                style={{color: "var(--surface-tertiary)"}}
                                className="text-sm flex-shrink-0"
                            />
                        )}
                        {start}
                    </div>
                )}

                {showFilters && (
                    <>
                        {enableFilterName && (
                            <HeroUITextField
                                name="filterName"
                                type="text"
                                value={filters.name ?? ""}
                                placeholder={namePlaceholder}
                                onChange={(v) => updateFilter("name", v || undefined)}
                                tooltip="Filter by name"
                            />
                        )}

                        {enableFilterRole && (
                            <HeroUISelect
                                ariaLabel="Filter by role"
                                options={ROLE_OPTIONS}
                                value={filters.role ?? ""}
                                showClearButton
                                onChange={(key) => updateFilter("role", (key as string) || undefined)}
                                tooltip={{
                                    text: "Filter by role",
                                    placement: "top",
                                    showArrow: true,
                                    delay: 200,
                                }}
                            />
                        )}

                        {enableFilterStatus && (
                            <HeroUISelect
                                ariaLabel="Filter by status"
                                selectionMode="multiple"
                                options={STATUS_OPTIONS}
                                value={filters.status ?? []}
                                onChange={(value) => {
                                    const status = Array.isArray(value) ? value : value ? [value] : [];
                                    updateFilter("status", status.length > 0 ? status : undefined);
                                }}
                                tooltip="Filter by status"
                            />
                        )}
                    </>
                )}
            </div>

            {/* ---------------------------------------------------------------
                Right side: extra buttons + built-in actions
                --------------------------------------------------------------- */}
            <div className={styles.end}>
                {end}

                {enableFiltersBtn && (
                    <>
                        {showFilters && (
                            <>
                                <HeroUIIconButton
                                    tone="white-tertiary"
                                    aria-label="Clear filters"
                                    tooltip="Clear filters"
                                    icon="fa6-solid:broom"
                                    onPress={handleClearFilters}
                                />

                                <HeroUIIconButton
                                    tone="white-tertiary"
                                    aria-label="Save filters"
                                    tooltip={{
                                        text: "Save filters",
                                        placement: "top",
                                        showArrow: true,
                                        delay: 200,
                                    }}
                                    icon="fa6-solid:floppy-disk"
                                    onPress={() => {
                                        console.log("Save filters to user");
                                    }}
                                />
                            </>
                        )}

                        <div className={styles.filtersBtnWrapper}>
                            <HeroUIIconButton
                                tone="white-tertiary"
                                aria-label={showFilters ? "Hide filters" : "Show filters"}
                                tooltip={{
                                    text: showFilters ? "Hide filters" : "Show filters",
                                    placement: "top",
                                    showArrow: true,
                                    delay: 100,
                                }}
                                icon={
                                    showFilters
                                        ? "fa6-solid:filter-circle-xmark"
                                        : "fa6-solid:filter"
                                }
                                onPress={() => setShowFilters((v) => !v)}
                            />

                            {!showFilters && activeFiltersCount > 0 && (
                                <span className={styles.badge}>
                                    {activeFiltersCount}
                                </span>
                            )}
                        </div>
                    </>
                )}

                {enableRefreshBtn && (
                    <HeroUIIconButton
                        tone="white-tertiary"
                        aria-label="Refresh"
                        tooltip="Refresh"
                        icon="fa6-solid:arrows-rotate"
                        onPress={onRefresh}
                    />
                )}
            </div>
        </div>
    );
};

TableFilters.displayName = "TableFilters";

export default TableFilters;
