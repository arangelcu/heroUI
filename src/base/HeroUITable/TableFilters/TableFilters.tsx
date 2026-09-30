import React from "react";
import {Input, ListBox, Select, TextField} from "@heroui/react";
// @ts-ignore
import styles from "./TableFilters.module.css";

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

    /** 👇 Controla si los filtros son visibles */
    showFilters?: boolean;

    // Filtros predefinidos (opt-in)
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
                                                       showFilters = false,
                                                       enableFilterName = false,
                                                       enableFilterRole = false,
                                                       enableFilterStatus = false,
                                                       onFilterChange,
                                                       namePlaceholder = "Type to Search...",
                                                       className = "",
                                                   }) => {
    // 👇 Estado interno para los valores, sincronizado con el padre vía callback
    const [filters, setFilters] = React.useState<FilterValues>({});

    const updateFilter = (key: keyof FilterValues, value: string | undefined) => {
        const next = {...filters, [key]: value};
        setFilters(next);
        onFilterChange?.(next);
    };

    return (
        <div className={`${styles.container} ${className}`.trim()}>
            <div className={styles.start}>
                {start}

                {/* 👇 Solo mostramos los filtros si showFilters es true */}
                {showFilters && (
                    <>
                        {enableFilterName && (
                            <TextField
                                className="w-full max-w-64"
                                name="filterName"
                                type="text"
                                value={filters.name ?? ""}
                                onChange={(v) => updateFilter("name", v || undefined)}
                            >
                                <Input placeholder={namePlaceholder}/>
                            </TextField>
                        )}

                        {enableFilterRole && (
                            <Select
                                aria-label="Filter by role"
                                className="w-40"
                                value={filters.role ?? "all"}
                                onChange={(key) =>
                                    updateFilter("role", key === "all" ? undefined : String(key))
                                }
                            >
                                <Select.Trigger>
                                    <Select.Value/>
                                    <Select.Indicator/>
                                </Select.Trigger>
                                <Select.Popover>
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
                                className="w-40"
                                value={filters.status ?? "all"}
                                onChange={(key) =>
                                    updateFilter("status", key === "all" ? undefined : String(key))
                                }
                            >
                                <Select.Trigger>
                                    <Select.Value/>
                                    <Select.Indicator/>
                                </Select.Trigger>
                                <Select.Popover>
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
            </div>
        </div>
    );
};

TableFilters.displayName = "TableFilters";

export default TableFilters;