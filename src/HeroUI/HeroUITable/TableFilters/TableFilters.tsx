import React from "react";
import styles from "./TableFilters.module.css";
import HeroUIIconButton from "../../HeroUIIConButton/HeroUIIconButton";
import HeroUISelect from "../../HeroUISelect/HeroUISelect";
import HeroUITextField from "../../HeroUITextField/HeroUITextField";
import {Icon} from "@iconify/react";
import {ROLE_OPTIONS, STATUS_OPTIONS} from "./filterOptions";

export interface FilterValues {
    name?: string;
    role?: string;
    status?: string[];
}

interface TableFiltersProps {
    /** Estado actual de los filtros. El componente es controlado. */
    filters: FilterValues;
    /** Nombre o string del icono que se renderizara al inicio (ej: "fa6-solid:users") */
    startIcon?: string;
    /** Free content aligned to the left (e.g. a title) */
    start?: React.ReactNode;
    /** Extra buttons aligned to the right (rendered before the built-in ones) */
    end?: React.ReactNode;

    enableFiltersBtn?: boolean;
    enableRefreshBtn?: boolean;
    onRefresh?: () => void;

    enableFilterName?: boolean;
    enableFilterRole?: boolean;
    enableFilterStatus?: boolean;

    onFilterChange?: (filters: FilterValues) => void;
    namePlaceholder?: string;
    className?: string;
}

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
     * Como el componente es controlado (el estado vive en el padre), `filters`
     * siempre refleja el valor mas reciente y no hay closure obsoleta: el caso que
     * fallaba era cuando el propio componente guardaba una copia y el debounce de
     * `HeroUITextField` fusionaba sobre una version vieja.
     */
    const updateFilter = <K extends keyof FilterValues>(
        key: K,
        value: FilterValues[K] | undefined
    ) => {
        onFilterChange?.({...filters, [key]: value});
    };

    const handleClearFilters = () => {
        onFilterChange?.({});
    };

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
                        {/* 👇 Si se pasa un startIcon, se renderiza usando el color verde del tema */}
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
