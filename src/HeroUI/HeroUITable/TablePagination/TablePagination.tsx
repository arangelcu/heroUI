import React, {useEffect, useState} from "react";
import {Input} from "@heroui/react";
import HeroUIButton from "../../HeroUIButton/HeroUIButton";
import HeroUISelect from "../../HeroUISelect/HeroUISelect";
// @ts-ignore
import styles from "./TablePagination.module.css";

/**
 * Props for `TablePagination`.
 *
 * A footer pagination bar with Previous / Next buttons, a page indicator,
 * and a "rows per page" selector.
 */
interface TablePaginationProps {
    /** Current page (1-based, for display) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Current page size (rows per page) */
    pageSize: number;
    /** Available page size options */
    pageSizeOptions: number[];
    /** Called when the user changes the page (receives a 1-based page) */
    onPageChange: (page: number) => void;
    /** Called when the user changes the page size */
    onPageSizeChange: (size: number) => void;
}

/**
 * `TablePagination`
 *
 * A fully controlled pagination bar designed to sit below a table.
 *
 * ### Features
 * - Previous / Next buttons with disabled states
 * - Editable page input (press Enter or blur to jump)
 * - "Page X of Y" indicator
 * - "Rows per page" selector
 * - Uses `HeroUIButton` and `HeroUISelect` for consistent styling
 *
 * ### Example
 * ```tsx
 * <TablePagination
 *   currentPage={1}
 *   totalPages={10}
 *   pageSize={10}
 *   pageSizeOptions={[5, 10, 25, 50, 100]}
 *   onPageChange={(page) => setPage(page)}
 *   onPageSizeChange={(size) => setPageSize(size)}
 * />
 * ```
 */
const TablePagination: React.FC<TablePaginationProps> = ({
                                                             currentPage,
                                                             totalPages,
                                                             pageSize,
                                                             pageSizeOptions,
                                                             onPageChange,
                                                             onPageSizeChange,
                                                         }) => {
    /** Local input value for the page number (kept in sync with `currentPage`). */
    const [pageInput, setPageInput] = useState(String(currentPage));

    // Sync the local input whenever the page changes externally.
    useEffect(() => {
        setPageInput(String(currentPage));
    }, [currentPage]);

    /**
     * Navigates to a page, clamping it to the valid range
     * and avoiding duplicate `onPageChange` calls.
     */
    const goToPage = (page: number) => {
        const clamped = Math.min(Math.max(page, 1), totalPages);
        if (clamped !== currentPage) {
            onPageChange(clamped);
        }
    };

    /**
     * Commits the current input value.
     * Falls back to the current page if the input is not a number.
     */
    const commitPageInput = () => {
        const parsed = Number(pageInput);
        if (!Number.isNaN(parsed)) {
            goToPage(parsed);
        } else {
            setPageInput(String(currentPage));
        }
    };

    /** Options for the "rows per page" selector. */
    const pageSizeSelectOptions = pageSizeOptions.map((size) => ({
        id: String(size),
        label: `${size} rows`,
    }));

    return (
        <div className={styles.bar}>
            {/* Previous */}
            <HeroUIButton
                appearance="surface"
                tooltip="Previous page"
                className={styles.navButton}
                isDisabled={currentPage <= 1}
                onPress={() => goToPage(currentPage - 1)}
            >
                Previous
            </HeroUIButton>

            {/* Page indicator + editable input */}
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

            {/* Rows per page */}
            <HeroUISelect
                ariaLabel="Rows per page"
                options={pageSizeSelectOptions}
                value={String(pageSize)}
                className={styles.pageSizeSelect}
                onChange={(key) => onPageSizeChange(Number(key))}
            />

            {/* Next */}
            <HeroUIButton
                appearance="surface"
                tooltip="Next page"
                className={styles.navButton}
                isDisabled={currentPage >= totalPages}
                onPress={() => goToPage(currentPage + 1)}
            >
                Next
            </HeroUIButton>
        </div>
    );
};

TablePagination.displayName = "TablePagination";

export default TablePagination;