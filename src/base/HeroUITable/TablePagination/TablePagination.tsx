import React, {useEffect, useState} from "react";
import {Input, ListBox, Select} from "@heroui/react";
import HeroUIButton from "../../HeroUIButton/HeroUIButton";
// @ts-ignore
import styles from "./TablePagination.module.css";

interface TablePaginationProps {
    /** Página actual (base 1 para mostrar al usuario) */
    currentPage: number;
    /** Total de páginas */
    totalPages: number;
    /** Tamaño de página actual */
    pageSize: number;
    /** Opciones de tamaño de página */
    pageSizeOptions: number[];
    /** Se llama al cambiar de página (recibe base 1) */
    onPageChange: (page: number) => void;
    /** Se llama al cambiar el tamaño de página */
    onPageSizeChange: (size: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
                                                             currentPage,
                                                             totalPages,
                                                             pageSize,
                                                             pageSizeOptions,
                                                             onPageChange,
                                                             onPageSizeChange,
                                                         }) => {
    const [pageInput, setPageInput] = useState(String(currentPage));

    useEffect(() => {
        setPageInput(String(currentPage));
    }, [currentPage]);

    const goToPage = (page: number) => {
        const clamped = Math.min(Math.max(page, 1), totalPages);
        if (clamped !== currentPage) {
            onPageChange(clamped);
        }
    };

    const commitPageInput = () => {
        const parsed = Number(pageInput);
        if (!Number.isNaN(parsed)) {
            goToPage(parsed);
        } else {
            setPageInput(String(currentPage));
        }
    };

    return (
        <div className={styles.bar}>
            {/* Previous */}
            <HeroUIButton
                className={styles.navButton}
                isDisabled={currentPage <= 1}
                onPress={() => goToPage(currentPage - 1)}
            >
                Previous
            </HeroUIButton>

            {/* Page X of Y */}
            <div className={styles.pageInfo}>
                <span>Page</span>
                <Input
                    aria-label="Page number"
                    className={styles.pageInput}
                    type="text"
                    value={pageInput}
                    onBlur={commitPageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            commitPageInput();
                            (e.target as HTMLInputElement).blur();
                        }
                    }}
                />
                <span>of {totalPages}</span>
            </div>

            {/* Page size select */}
            <Select
                aria-label="Rows per page"
                className={styles.pageSizeSelect}
                value={String(pageSize)}
                onChange={(key) => onPageSizeChange(Number(key))}
            >
                <Select.Trigger className="rounded-[5px]">
                    <Select.Value/>
                    <Select.Indicator/>
                </Select.Trigger>
                <Select.Popover className="rounded-[5px]">
                    <ListBox>
                        {pageSizeOptions.map((size) => (
                            <ListBox.Item
                                key={String(size)}
                                id={String(size)}
                                textValue={String(size)}
                            >
                                {String(size)} rows
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>

            {/* Next */}
            <HeroUIButton
                className={styles.navButton}
                isDisabled={currentPage >= totalPages}
                onPress={() => goToPage(currentPage + 1)}
            >
                Next
            </HeroUIButton>
        </div>
    );
};

export default TablePagination;