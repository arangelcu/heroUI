import React, {useState} from "react";
import {Input, ListBox, Select, TextField} from "@heroui/react";

// @ts-ignore
import styles from "./TableFilters.module.css";
import HeroUIIconButton from "../../HeroUIIConButton/HeroUIIconButton";

export interface FilterValues {
    name?: string;
    role?: string;
    status?: string;
}

interface TableFiltersProps {
    /** Contenido libre alineado a la izquierda */
    start?: React.ReactNode;
    /** Contenido libre alineado a la derecha */
    end?: React.ReactNode;

    // 👇 Botones integrados
    /** Muestra el botón de toggle de filtros */
    enableFiltersBtn?: boolean;
    /** Muestra el botón de refrescar */
    enableRefreshBtn?: boolean;
    /** Callback al pulsar refresh */
    onRefresh?: () => void;

    // 👇 Filtros predefinidos (opt-in)
    enableFilterName?: boolean;
    enableFilterRole?: boolean;
    enableFilterStatus?: boolean;

    /** Callback que se llama cada vez que cambia cualquier filtro */
    onFilterChange?: (filters: FilterValues) => void;

    /** Placeholder para el filtro de nombre */
    namePlaceholder?: string;

    /** Clases extra para el contenedor principal */
    className?: string;
}

const ROLE_OPTIONS = [
    {id: "all", label: "Todos"},
    {id: "CEO", label: "CEO"},
    {id: "CTO", label: "CTO"},
    {id: "CMO", label: "CMO"},
    {id: "Engineer", label: "Engineer"},
];

const STATUS_OPTIONS = [
    {id: "all", label: "Todos"},
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

    return (
        <div className={`${styles.container} ${className}`.trim()}>
            <div className={styles.start}>
                {/* 👇 Si los filtros están visibles, ocultamos el start */}
                {!showFilters && start}

                {/* 👇 Filtros: solo si showFilters está activo */}
                {showFilters && (
                    <>
                        {enableFilterName && (<>
                                <TextField
                                    className="w-full max-w-64"
                                    name="filterName"
                                    type="text"
                                    value={filters.name ?? ""}
                                    style={{width: "195px"}}
                                    onChange={(v) => updateFilter("name", v || undefined)}
                                >
                                    <Input className="rounded-[5px]" placeholder={namePlaceholder}/>
                                </TextField>
                            </>
                        )}

                        {enableFilterRole && (
                            <Select
                                aria-label="Filter by role"
                                className="w-40"
                                value={filters.role ?? "all"}
                                style={{width: "195px"}}
                                onChange={(key) =>
                                    updateFilter("role", key === "all" ? undefined : String(key))
                                }
                            >
                                <Select.Trigger className="rounded-[5px]">
                                    <Select.Value/>
                                    <Select.Indicator/>
                                </Select.Trigger>
                                <Select.Popover className="rounded-[5px]" style={{width: "195px"}}>
                                    <ListBox>
                                        {ROLE_OPTIONS.map((opt) => (
                                            <ListBox.Item
                                                key={opt.id}
                                                id={opt.id}
                                                textValue={opt.label}
                                            >
                                                {opt.label}
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        )}

                        {enableFilterStatus && (
                            <Select
                                aria-label="Filter by status"
                                className="w-40 rounded-[5px]"
                                style={{width: "195px"}}
                                value={filters.status ?? "all"}
                                onChange={(key) =>
                                    updateFilter("status", key === "all" ? undefined : String(key))
                                }
                            >
                                <Select.Trigger className="rounded-[5px]">
                                    <Select.Value/>
                                    <Select.Indicator/>
                                </Select.Trigger>
                                <Select.Popover className="rounded-[5px]">
                                    <ListBox>
                                        {STATUS_OPTIONS.map((opt) => (
                                            <ListBox.Item
                                                key={opt.id}
                                                id={opt.id}
                                                textValue={opt.label}
                                            >
                                                {opt.label}
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                        )}
                    </>
                )}
            </div>

            <div className={styles.end}>
                {end}

                {/* 👇 Botón de toggle de filtros */}
                {enableFiltersBtn && (<>

                        {showFilters && (<>
                            <HeroUIIconButton
                                appearance="row"
                                tooltip="Clear filters"
                                icon="fa6-solid:broom"
                                onPress={() => {
                                    setFilters({});
                                    onFilterChange?.({});
                                    onRefresh?.();
                                }}
                            />

                            <HeroUIIconButton
                                appearance="row"
                                tooltip={{
                                    text: "Save Filters",
                                    placement: "top",
                                    showArrow: true,
                                    delay: 200,
                                }}
                                icon={"fa6-solid:floppy-disk"}
                                onPress={() => {
                                    alert("save Filter to user")
                                }}
                            />
                        </>)}

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
                        /></>
                )}

                {/* 👇 Botón de refresh */}
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