import React, {useState} from "react";
// @ts-ignore
import styles from "./TableFilters.module.css";
import HeroUIIconButton from "../../HeroUIIConButton/HeroUIIconButton";
import HeroUISelect from "../../HeroUISelect/HeroUISelect";
import HeroUITextField from "../../HeroUITextField/HeroUITextField";

export interface FilterValues {
    name?: string;
    role?: string;
    status?: string;
}

interface TableFiltersProps {
    start?: React.ReactNode;
    /** 👇 Botones extra a la derecha (antes de los de filtro/refresh) */
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
    {id: "CEO", label: "CEO"},
    {id: "CTO", label: "CTO"},
    {id: "CMO", label: "CMO"},
    {id: "Engineer", label: "Engineer"},
];

const STATUS_OPTIONS = [
    {id: "Active", label: "Active"},
    {id: "Inactive", label: "Inactive"},
    {id: "On Leave", label: "On Leave"},
];

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
    const [filters, setFilters] = useState<FilterValues>({});
    const [showFilters, setShowFilters] = useState(false);

    const updateFilter = (key: keyof FilterValues, value: string | undefined) => {
        const next = {...filters, [key]: value};
        setFilters(next);
        onFilterChange?.(next);
    };

    const handleClearFilters = () => {
        setFilters({});
        onFilterChange?.({});
    };

    const activeFiltersCount = [
        filters.name,
        filters.role,
        filters.status,
    ].filter((v) => v !== undefined && v !== null && v !== "").length;

    return (
        <div className={`${styles.container} ${className}`.trim()}>
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
                                onChange={(key) => updateFilter("role", key || undefined)}
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
                                options={STATUS_OPTIONS}
                                value={filters.status ?? ""}
                                showClearButton
                                onChange={(key) => updateFilter("status", key || undefined)}
                                tooltip="Filter by status"
                            />
                        )}
                    </>
                )}
            </div>

            <div className={styles.end}>
                {/* 👇 Tus botones extra van aquí (antes de los de filtro/refresh) */}
                {end}

                {enableFiltersBtn && (
                    <>
                        {showFilters && (
                            <>
                                <HeroUIIconButton
                                    appearance="row"
                                    tooltip="Clear filters"
                                    icon="fa6-solid:broom"
                                    onPress={handleClearFilters}
                                />

                                <HeroUIIconButton
                                    appearance="row"
                                    tooltip={{
                                        text: "Save Filters",
                                        placement: "top",
                                        showArrow: true,
                                        delay: 200,
                                    }}
                                    icon="fa6-solid:floppy-disk"
                                    onPress={() => {
                                        console.log("save Filter to user");
                                    }}
                                />
                            </>
                        )}

                        <div className={styles.filtersBtnWrapper}>
                            <HeroUIIconButton
                                appearance="row"
                                tooltip={{
                                    text: "Toggle Filters",
                                    placement: "top",
                                    showArrow: true,
                                    delay: 100,
                                }}
                                icon={showFilters ? "fa6-solid:filter-circle-xmark" : "fa6-solid:filter"}
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
                        appearance="row"
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