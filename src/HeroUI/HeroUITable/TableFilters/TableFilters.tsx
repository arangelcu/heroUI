import React, { useState } from "react";
// @ts-ignore
import styles from "./TableFilters.module.css";
import HeroUIIconButton from "../../HeroUIIConButton/HeroUIIconButton";
import HeroUISelect from "../../HeroUISelect/HeroUISelect";
import HeroUITextField from "../../HeroUITextField/HeroUITextField";
import { Icon } from "@iconify/react"; // 👈 Aseguramos la importación del componente de íconos

export interface FilterValues {
    name?: string;
    role?: string;
    status?: string[];
}

interface TableFiltersProps {
    /** Nombre o string del ícono que se renderizará al inicio (ej: "fa6-solid:users") */
    startIcon?: string; // 👈 Nueva prop opcional
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

const ROLE_OPTIONS = [
    { id: "CEO", label: "CEO" },
    { id: "CTO", label: "CTO" },
    { id: "CMO", label: "CMO" },
    { id: "Engineer", label: "Engineer" },
];

const STATUS_OPTIONS = [
    { id: "Active", label: "Active" },
    { id: "Inactive", label: "Inactive" },
    { id: "On Leave", label: "On Leave" },
];

const TableFilters: React.FC<TableFiltersProps> = ({
                                                       startIcon, // 👈 Extraemos la nueva propiedad
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
    const [filters, setFilters] = useState<FilterValues>({});
    const [showFilters, setShowFilters] = useState(false);

    const updateFilter = <K extends keyof FilterValues>(
        key: K,
        value: FilterValues[K] | undefined
    ) => {
        const next = { ...filters, [key]: value };
        setFilters(next);
        onFilterChange?.(next);
    };

    const handleClearFilters = () => {
        setFilters({});
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
                                style={{ color: "var(--surface-tertiary)" }}
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
                {end}

                {enableFiltersBtn && (
                    <>
                        {showFilters && (
                            <>
                                <HeroUIIconButton
                                    tone="white-tertiary"
                                    tooltip="Clear filters"
                                    icon="fa6-solid:broom"
                                    onPress={handleClearFilters}
                                />

                                <HeroUIIconButton
                                    tone="white-tertiary"
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
