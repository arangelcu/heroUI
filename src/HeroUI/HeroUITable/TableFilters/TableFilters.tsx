import React, {useState} from "react";
// @ts-ignore
import styles from "./TableFilters.module.css";
import HeroUIIconButton from "../../HeroUIIConButton/HeroUIIconButton";
import HeroUISelect from "../../HeroUISelect/HeroUISelect";
import HeroUITextField from "../../HeroUITextField/HeroUITextField";

/**
 * Values of the currently active filters.
 * Only keys that have a value are considered "active".
 *
 * - `name` and `role` are single-value filters (`string`).
 * - `status` is a multi-value filter (`string[]`).
 */
export interface FilterValues {
    /** Free-text search on the "name" column */
    name?: string;
    /** Selected role */
    role?: string;
    /** Selected statuses (multi-select) */
    status?: string[];
}

/**
 * Props for `TableFilters`.
 *
 * A header bar that sits above a table and provides:
 * - A "start" slot for a title or custom content.
 * - An "end" slot for extra action buttons.
 * - Optional built-in filters (name, role, status).
 * - Optional toggle, refresh, clear, and save buttons.
 * - A badge showing the number of active filters when collapsed.
 */
interface TableFiltersProps {
    /** Free content aligned to the left (e.g. a title) */
    start?: React.ReactNode;
    /** Extra buttons aligned to the right (rendered before the built-in ones) */
    end?: React.ReactNode;

    /** Show the filters toggle button. Default: `false` */
    enableFiltersBtn?: boolean;
    /** Show the refresh button. Default: `false` */
    enableRefreshBtn?: boolean;
    /** Callback fired when the refresh button is pressed */
    onRefresh?: () => void;

    /** Show the "name" filter (text input). Default: `false` */
    enableFilterName?: boolean;
    /** Show the "role" filter (select). Default: `false` */
    enableFilterRole?: boolean;
    /** Show the "status" filter (multi-select). Default: `false` */
    enableFilterStatus?: boolean;

    /** Callback fired whenever any filter changes */
    onFilterChange?: (filters: FilterValues) => void;

    /** Placeholder for the name filter. Default: `"Type to Search..."` */
    namePlaceholder?: string;

    /** Extra classes for the outer container */
    className?: string;
}

/** Predefined role options for the role filter. */
const ROLE_OPTIONS = [
    {id: "CEO", label: "CEO"},
    {id: "CTO", label: "CTO"},
    {id: "CMO", label: "CMO"},
    {id: "Engineer", label: "Engineer"},
];

/** Predefined status options for the status filter. */
const STATUS_OPTIONS = [
    {id: "Active", label: "Active"},
    {id: "Inactive", label: "Inactive"},
    {id: "On Leave", label: "On Leave"},
];

/**
 * `TableFilters`
 *
 * A configurable filters header for tables. It provides:
 * - A collapsed state showing only `start` and `end`.
 * - An expanded state showing the built-in filters.
 * - A badge on the toggle button with the number of active filters.
 *
 * ### Features
 * - Toggle between collapsed/expanded filters
 * - Built-in filters: name (text), role (select), status (multi-select)
 * - Clear filters button
 * - Save filters button (placeholder — connect your own logic)
 * - Active filters badge when collapsed
 * - Fully responsive (filters wrap, buttons stay put)
 *
 * ### Example — Minimal usage
 * ```tsx
 * <TableFilters
 *   start={<h2>Team members</h2>}
 *   enableFiltersBtn
 *   enableFilterName
 *   onFilterChange={(filters) => console.log(filters)}
 * />
 * ```
 *
 * ### Example — Full setup
 * ```tsx
 * <TableFilters
 *   start={<h2>Team members</h2>}
 *   end={<HeroUIButton icon="fa6-solid:plus">Add</HeroUIButton>}
 *   enableFiltersBtn
 *   enableRefreshBtn
 *   enableFilterName
 *   enableFilterRole
 *   enableFilterStatus
 *   namePlaceholder="Search by name..."
 *   onFilterChange={(filters) => fetchData(filters)}
 *   onRefresh={() => fetchData()}
 * />
 * ```
 */
const TableFilters: React.FC<TableFiltersProps> = ({
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
    /** Current filter values. */
    const [filters, setFilters] = useState<FilterValues>({});

    /** Whether the built-in filters are visible. */
    const [showFilters, setShowFilters] = useState(false);

    /**
     * Updates a single filter key and notifies the parent.
     *
     * The generic `K` ensures the value type matches the key:
     * - `name` → `string | undefined`
     * - `role` → `string | undefined`
     * - `status` → `string[] | undefined`
     */
    const updateFilter = <K extends keyof FilterValues>(
        key: K,
        value: FilterValues[K] | undefined
    ) => {
        const next = {...filters, [key]: value};
        setFilters(next);
        onFilterChange?.(next);
    };

    /** Clears all filters and notifies the parent. */
    const handleClearFilters = () => {
        setFilters({});
        onFilterChange?.({});
    };

    /**
     * Number of active filters.
     * Counts only keys with a non-empty value (for arrays: length > 0).
     */
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
                Left side: title or filters
                --------------------------------------------------------------- */}
            <div className={styles.start}>
                {!showFilters && start}

                {showFilters && (
                    <>
                        {enableFilterName && (
                            <HeroUITextField
                                name="filterName"
                                type="text"
                                value={filters.name ?? ""}
                                placeholder={namePlaceholder}
                                onChange={(v) => updateFilter("name", v || undefined)}
                                startIcon="fa6-solid:magnifying-glass"
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
                                onChange={(keys) => {
                                    const arr = keys as string[];
                                    updateFilter("status", arr.length > 0 ? arr : undefined);
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
                {/* Extra user-provided buttons */}
                {end}

                {enableFiltersBtn && (
                    <>
                        {/* Actions visible only when filters are expanded */}
                        {showFilters && (
                            <>
                                <HeroUIIconButton
                                    appearance="surface"
                                    tooltip="Clear filters"
                                    icon="fa6-solid:broom"
                                    onPress={handleClearFilters}
                                />

                                <HeroUIIconButton
                                    appearance="surface"
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

                        {/* Toggle button with active filters badge */}
                        <div className={styles.filtersBtnWrapper}>
                            <HeroUIIconButton
                                appearance="surface"
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
                        appearance="surface"
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