import React, {useState} from "react";
import {Icon} from "@iconify/react";
import styles from "./TablePagination.module.css";

/**
 * Pagination slice of the TanStack Table instance this footer drives.
 *
 * Declared as the minimum the footer needs instead of importing the whole
 * `Table` type: the footer only navigates and asks for counts, so any TanStack
 * table with the `rowPaginationFeature` enabled satisfies it.
 */
export interface TablePaginationApi {
    /** Total number of pages (`options.pageCount` or `rowCount / pageSize`). */
    getPageCount: () => number;
    /** Total number of rows (`options.rowCount` when the server owns it). */
    getRowCount: () => number;
    /** Whether the current page index can move backwards. */
    getCanPreviousPage: () => boolean;
    /** Whether the current page index can move forwards. */
    getCanNextPage: () => boolean;
    /** Moves one page backwards. */
    previousPage: () => void;
    /** Moves one page forwards. */
    nextPage: () => void;
    /** Jumps to a zero-based page index. */
    setPageIndex: (pageIndex: number) => void;
    /** Changes how many rows fit on a page. */
    setPageSize: (pageSize: number) => void;
}

interface TablePaginationProps {
    /** TanStack Table instance driving the page count and the navigation. */
    table: TablePaginationApi;
    /**
     * Zero-based page index on screen.
     *
     * It comes from the server state (`PaginationOptions.currentPage`) and not
     * from the table, because with `manualPagination` the server is the only
     * source of truth for which page is loaded.
     */
    pageIndex: number;
    /** Rows per page currently loaded. */
    pageSize: number;
    /** Options of the "rows per page" selector. */
    pageSizeOptions?: number[];
    /** Disables the controls while a request is in flight. */
    isLoading?: boolean;
}

/**
 * `TablePagination`
 *
 * Pagination footer shared by `HeroUiTable` and `HeroUIReactTable`.
 *
 * ### What it does not do
 *
 * It never slices or sorts anything: with `manualPagination` the rows already
 * come paginated from the server. All the numbers (`pageCount`, `rowCount`,
 * `canPrevious`, `canNext`) and the navigation itself are delegated to the
 * TanStack Table instance through `table`, so both tables paginate exactly the
 * same way and there is no second pagination implementation to keep in sync.
 *
 * The look follows `HeroUIReactTable`'s footer (plain markup painted with the
 * theme tokens) so a `HeroUiTable` and a plain table side by side are
 * indistinguishable.
 *
 * ### Page input
 *
 * The number is a draft: it is committed on `Enter` or blur, clamped to the
 * valid range, and re-synchronised when `pageIndex` changes from the outside.
 * Adjusting it during render (instead of in an effect) is the React pattern for
 * "adjusting state when a prop changes" and avoids a second render.
 */
const TablePagination: React.FC<TablePaginationProps> = ({
                                                             table,
                                                             pageIndex,
                                                             pageSize,
                                                             pageSizeOptions = [5, 10, 20, 50, 100],
                                                             isLoading = false,
                                                         }) => {
    /** Draft of the page number, kept as text so partial input is allowed. */
    const [pageDraft, setPageDraft] = useState(() => String(pageIndex + 1));
    const [lastPageIndex, setLastPageIndex] = useState(pageIndex);

    if (pageIndex !== lastPageIndex) {
        setLastPageIndex(pageIndex);
        setPageDraft(String(pageIndex + 1));
    }

    const pageCount = Math.max(1, table.getPageCount());
    const rowCount = table.getRowCount();

    /** Commits a one-based page number, clamped to the known page count. */
    const goToPage = (page: number) => {
        const whole = Math.trunc(page);
        if (!Number.isFinite(whole)) return;
        const clamped = Math.min(Math.max(whole, 1), pageCount);
        table.setPageIndex(clamped - 1);
    };

    /** Applies the typed page number, or restores the current one when invalid. */
    const commitPageDraft = () => {
        const parsed = parseInt(pageDraft, 10);
        if (Number.isNaN(parsed)) {
            setPageDraft(String(pageIndex + 1));
            return;
        }
        goToPage(parsed);
    };

    return (
        <div className={styles.footer}>
            <span>
                {rowCount} {rowCount === 1 ? "row" : "rows"}
            </span>

            <span className={styles.footerSpacer}/>

            <button
                type="button"
                className={styles.pageButton}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
                aria-label="Previous page"
            >
                <Icon className="size-3" icon="fa6-solid:chevron-left"/>
            </button>

            <span className={styles.pageIndicator}>
                Page
                <input
                    className={`${styles.pageInput} mx-1`}
                    value={pageDraft}
                    onChange={(event) => setPageDraft(event.target.value.replace(/[^0-9]/g, ""))}
                    onBlur={commitPageDraft}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                    }}
                    aria-label="Page number"
                />
                of {pageCount}
            </span>

            <button
                type="button"
                className={styles.pageButton}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
                aria-label="Next page"
            >
                <Icon className="size-3" icon="fa6-solid:chevron-right"/>
            </button>

            <select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={(event) => table.setPageSize(Number(event.target.value))}
                aria-label="Rows per page"
            >
                {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                        {size} rows
                    </option>
                ))}
            </select>
        </div>
    );
};

TablePagination.displayName = "TablePagination";

export default TablePagination;
