import React from "react";
// @ts-ignore
import styles from "./TableFilters.module.css";

interface TableFiltersProps {
    /** Contenido que va alineado a la izquierda (filtros, búsqueda, etc.) */
    start?: React.ReactNode;
    /** Contenido que va alineado a la derecha (botones, acciones, etc.) */
    end?: React.ReactNode;
    /** Clases extra para el contenedor principal */
    className?: string;
}

const TableFilters: React.FC<TableFiltersProps> = ({
                                                       start,
                                                       end,
                                                       className = "",
                                                   }) => {
    return (
        <div className={`${styles.container} ${className}`.trim()}>
            <div className={styles.start}>
                {start}
            </div>

            <div className={styles.end}>
                {end}
            </div>
        </div>
    );
};

TableFilters.displayName = "TableFilters";

export default TableFilters;