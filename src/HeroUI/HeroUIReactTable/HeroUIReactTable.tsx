import React, {useCallback, useState} from "react";
import {Checkbox} from "@heroui/react";
import {Icon} from "@iconify/react";
import type {ColumnDef, PaginationState, RowData, SortingState, Updater} from "@tanstack/react-table";
import {
    createPaginatedRowModel,
    createSortedRowModel,
    flexRender,
    functionalUpdate,
    rowPaginationFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    tableFeatures,
    useTable,
} from "@tanstack/react-table";
// The footer is shared with `HeroUiTable`: one pagination bar, the two tables.
import TablePagination from "../HeroUITable/TablePagination/TablePagination";
// The loading and empty states are the very same components `HeroUiTable` renders.
import TableLoader from "../HeroUITable/TableLoader/TableLoader";
import TableEmpty from "../HeroUITable/TableEmpty/TableEmpty";
// The server-side contract is shared with `HeroUiTable`, so both tables can be driven
// by the same `useServerTable`. Type-only import: nothing of that module is bundled.
import type {FetchParams, PaginationOptions, TableFiltersConfig} from "../HeroUITable/HeroUITable/HeroUiTable";
// The filter bar is the very same component `HeroUiTable` renders.
import type {FilterValues} from "../HeroUITable/TableFilters/TableFilters";
import TableFilters from "../HeroUITable/TableFilters/TableFilters";
import styles from "./HeroUIReactTable.module.css";

/**
 * Feature set of the table.
 *
 * Created once at module level (as TanStack requires) and kept to what this component
 * actually offers: sorting and pagination. `columnSizingFeature` is intentionally
 * absent because this table has no resizing yet.
 */
const features = tableFeatures({
    paginatedRowModel: createPaginatedRowModel(),
    rowPaginationFeature,
    rowSortingFeature,
    sortFns: {alphanumeric: sortFn_alphanumeric},
    sortedRowModel: createSortedRowModel(),
});

/** Props of `HeroUIReactTable`. */
export interface HeroUIReactTableProps<TData extends RowData> {
    /** Column definitions (TanStack Table). */
    columns: ColumnDef<any, TData, any>[];
    /** Rows of the **current page**. The server is the source of truth. */
    data: readonly TData[];
    /** Server-side pagination state, same shape `HeroUiTable` uses. */
    paginationOptions: PaginationOptions;
    /**
     * Called whenever the user changes page, page size or sorting, with the parameters the
     * server needs. Same contract as `HeroUiTable`, so `useServerTable` drives both.
     */
    fetchData: (params: FetchParams) => void;
    /** Options of the "rows per page" selector. Defaults to `[5, 10, 20, 50, 100]`. */
    pageSizeOptions?: number[];
    /** Accessible name of the table. Defaults to `"Data table"`. */
    ariaLabel?: string;
    /**
     * Id of the column that names the row. Its cells render as the primary text
     * (`--field-foreground`) and medium weight instead of the secondary one.
     *
     * Optional: without it every column is painted the same.
     */
    rowHeaderColumnId?: string;
    /** Whether rows are being fetched. */
    isLoading?: boolean;
    /** Custom content shown when there are no rows. */
    renderEmpty?: () => React.ReactNode;
    /**
     * Failure of the last request, when there is one.
     *
     * It takes priority over the empty state: a broken request is not "no data".
     */
    error?: Error | null;
    /**
     * Custom error state.
     * Defaults to a `TableEmpty` showing the error message.
     */
    renderError?: (error: Error) => React.ReactNode;
    /** Custom content shown while loading. */
    renderLoading?: () => React.ReactNode;
    /** Enables the checkbox column that selects rows. Defaults to `false`. */
    enableSelection?: boolean;
    /** Fired with the selected rows (they survive page changes). */
    onSelectionChange?: (selectedRows: TData[]) => void;
    /** Extracts the unique id of a row. Default: `row.id`. */
    getRowId?: (row: TData) => string | number;
    /**
     * Extra CSS classes for a row, decided from its own data.
     * Same behaviour as in `HeroUiTable`.
     */
    getRowClassName?: (row: TData) => string | undefined;
    /** Inline styles for a row, decided from its own data. */
    getRowStyle?: (row: TData) => React.CSSProperties | undefined;
    /**
     * Current filter values when the consumer owns the filter UI.
     *
     * With `filtersConfig` these are only the initial values; without it they are the ones
     * that travel back inside `FetchParams`.
     */
    filters?: FilterValues;
    /**
     * If provided, the table renders the shared `TableFilters` bar above itself (same
     * contract as `HeroUiTable`) and sends a request whenever a filter changes.
     */
    filtersConfig?: TableFiltersConfig;
    /** Fired whenever the built-in filter bar changes the filters. */
    onFiltersChange?: (filters: FilterValues) => void;
    /** Minimum width of the `<table>`, so it can scroll horizontally. Defaults to `"600px"`. */
    minTableWidth?: string | number;
}

/**
 * `HeroUIReactTable`
 *
 * Server-side data table built on **TanStack Table v9** that renders **its own markup**.
 *
 * ### Why it exists next to `HeroUiTable`
 *
 * `HeroUiTable` uses TanStack for the state and HeroUI's `Table.*` primitives for the DOM.
 * This one keeps TanStack for the state but renders a plain `<table>`, so the markup and
 * the CSS are entirely ours: it does not depend on HeroUI's table slots, and its styles
 * live in `HeroUIReactTable.module.css` on top of the theme tokens.
 *
 * ### Server-side
 *
 * Pagination and sorting are **manual**: the component never slices or sorts the array
 * itself. It reports what the user asked for through `fetchData(params)` and renders
 * whatever comes back, so it can be driven by the same `useServerTable` as `HeroUiTable`.
 *
 * ### Filters
 *
 * With `filtersConfig` it mounts the same `TableFilters` bar `HeroUiTable` uses —the name,
 * role and status fields plus the clear / save / toggle / refresh buttons— and every change
 * goes out as a new request with the page reset to the first one. Without it, the consumer
 * owns the filter UI and passes the values in through `filters`.
 *
 * ### Empty, loading and error states
 *
 * They are the same components `HeroUiTable` uses: `TableEmpty` (icon, title and
 * description) and `TableLoader` (the two spinning rings). The priority is error →
 * loading → empty, and each one can be replaced from outside with `renderError`,
 * `renderLoading` or `renderEmpty`.
 *
 * ### What it does not have (yet)
 *
 * Column resizing.
 *
 * ### Example
 * ```tsx
 * const table = useServerTable<User>(queryUsers);
 *
 * <HeroUIReactTable
 *   columns={userColumns}
 *   data={table.data}
 *   isLoading={table.isLoading}
 *   paginationOptions={table.paginationOptions}
 *   fetchData={table.fetchData}
 *   rowHeaderColumnId="name"
 * />
 * ```
 */
export function HeroUIReactTable<TData extends RowData>({
                                                             columns,
                                                             data,
                                                             paginationOptions,
                                                             fetchData,
                                                             pageSizeOptions = [5, 10, 20, 50, 100],
                                                             ariaLabel = "Data table",
                                                             rowHeaderColumnId,
                                                             isLoading = false,
                                                             renderEmpty,
                                                             renderLoading,
                                                             error = null,
                                                             renderError,
                                                             enableSelection = false,
                                                             onSelectionChange,
                                                             getRowId = (row: any) => row.id,
                                                             getRowClassName,
                                                             getRowStyle,
                                                             filters = {},
                                                             filtersConfig,
                                                             onFiltersChange,
                                                             minTableWidth = "600px",
                                                         }: HeroUIReactTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);

    /**
     * Values of the built-in filter bar.
     *
     * With `filtersConfig` the table renders the bar and owns the values, exactly like
     * `HeroUiTable`; without it the consumer owns them and passes them in through the
     * `filters` prop.
     */
    const [barFilters, setBarFilters] = useState<FilterValues>(filters);
    const activeFilters = filtersConfig ? barFilters : filters;

    /**
     * Selected rows, kept in a map keyed by id.
     *
     * A map (and not the ids of the current page) so the selection **survives page
     * changes**: `onSelectionChange` can report rows that are no longer on screen.
     */
    const [selectedRowsMap, setSelectedRowsMap] = useState<Map<string | number, TData>>(new Map());

    const pageIndex = paginationOptions.currentPage;
    const pageSize = paginationOptions.pageSize;
    const rowCount = paginationOptions.totalElements;

    // --- Emitting the server parameters ------------------------------------
    /**
     * Sends a page request to the server.
     *
     * Shared by sorting, filtering and pagination: the server is the only one that slices,
     * filters and sorts, so every interaction ends up as a request. The filters arrive as a
     * parameter instead of being read from the closure: a filter changed in this same
     * handler would still not be visible there.
     */
    const emit = useCallback((nextPage: number, nextSize: number, nextSorting: SortingState, nextFilters: FilterValues) => {
        fetchData({
            first: nextPage * nextSize,
            offset: nextPage * nextSize,
            currentPage: nextPage,
            pageSize: nextSize,
            sorting: nextSorting,
            filters: nextFilters,
        });
    }, [fetchData]);

    /**
     * Pagination handler of the table instance.
     *
     * TanStack resolves the next `{pageIndex, pageSize}` from the updater (including the
     * page-size maths) and hands it over here; the request goes out from this callback and
     * the response lands back in `paginationOptions`, which is the state the table is bound
     * to. Nothing slices rows locally: `manualPagination` is on.
     */
    const handlePaginationChange = useCallback((updater: Updater<PaginationState>) => {
        const next = functionalUpdate(updater, {pageIndex, pageSize});
        if (next.pageIndex === pageIndex && next.pageSize === pageSize) return;
        emit(next.pageIndex, next.pageSize, sorting, activeFilters);
    }, [emit, pageIndex, pageSize, sorting, activeFilters]);

    const table = useTable({
        columns,
        data: data as TData[],
        features,
        manualPagination: true,
        manualSorting: true,
        rowCount,
        getRowId: (row: TData) => String(getRowId(row)),
        onSortingChange: setSorting,
        onPaginationChange: handlePaginationChange,
        state: {sorting, pagination: {pageIndex, pageSize}},
    });

    const rows = table.getRowModel().rows;
    const headerGroups = table.getHeaderGroups();
    const columnCount = (headerGroups[0]?.headers.length ?? 0) + (enableSelection ? 1 : 0);
    const hasRows = rows.length > 0;

    // --- Sorting ------------------------------------------------------------
    /**
     * Cycles a column through ascending -> descending -> unsorted.
     *
     * Only one sorted column is kept, which is what the server contract
     * (`FetchParams.sorting`) and `HeroUiTable` support.
     */
    const handleSort = useCallback((columnId: string) => {
        const current = sorting[0];
        let next: SortingState;
        if (!current || current.id !== columnId) {
            next = [{id: columnId, desc: false}];
        } else if (!current.desc) {
            next = [{id: columnId, desc: true}];
        } else {
            next = [];
        }
        setSorting(next);
        // Back to the first page: the previous one may not exist with the new order.
        emit(0, pageSize, next, activeFilters);
    }, [sorting, pageSize, activeFilters, emit]);

    const sortDirectionOf = (columnId: string): "ascending" | "descending" | "none" => {
        const current = sorting[0];
        if (!current || current.id !== columnId) return "none";
        return current.desc ? "descending" : "ascending";
    };

    // --- Pagination ---------------------------------------------------------
    // Nothing to do here: the footer calls the TanStack pagination API and the requests
    // go out through `handlePaginationChange`.

    // --- Filters ------------------------------------------------------------
    /**
     * Applies the values of the filter bar and goes back to the first page, which may not
     * exist with the new filters.
     */
    const handleFilterChange = useCallback((nextFilters: FilterValues) => {
        setBarFilters(nextFilters);
        onFiltersChange?.(nextFilters);
        emit(0, pageSize, sorting, nextFilters);
    }, [emit, onFiltersChange, pageSize, sorting]);

    /**
     * Reloads the first page with the filters that are active.
     *
     * Same behaviour as the refresh button of `HeroUiTable`.
     */
    const handleRefresh = useCallback(() => {
        emit(0, pageSize, sorting, activeFilters);
    }, [emit, pageSize, sorting, activeFilters]);

    // --- Selection ----------------------------------------------------------
    const isRowSelected = useCallback(
        (id: string | number) => selectedRowsMap.has(id),
        [selectedRowsMap]
    );

    const toggleRow = useCallback((id: string | number, row: TData, selected: boolean) => {
        setSelectedRowsMap((prev) => {
            const next = new Map(prev);
            if (selected) next.set(id, row);
            else next.delete(id);
            onSelectionChange?.(Array.from(next.values()));
            return next;
        });
    }, [onSelectionChange]);

    const selectedOnPage = rows.filter((r) => selectedRowsMap.has(getRowId(r.original))).length;
    const allOnPageSelected = hasRows && selectedOnPage === rows.length;

    /**
     * Selects or clears every row of the current page.
     *
     * Deliberately **not** wrapped in `useCallback`: it closes over `rows`, which comes
     * from `table.getRowModel()`, and the React Compiler refuses to preserve memoization
     * over a value it cannot prove stable (it reports "existing memoization could not be
     * preserved" and skips optimising the whole component). `HeroUiTable` does the same.
     */
    const toggleAllOnPage = (selected: boolean) => {
        setSelectedRowsMap((prev) => {
            const next = new Map(prev);
            rows.forEach((r) => {
                const id = getRowId(r.original);
                if (selected) next.set(id, r.original);
                else next.delete(id);
            });
            onSelectionChange?.(Array.from(next.values()));
            return next;
        });
    };

    // --- Empty / loading / error --------------------------------------------
    /**
     * Single row used by the three "no data" states.
     *
     * Same priority as `HeroUiTable` (error → loading → empty) and the same default
     * components: `TableEmpty` for the empty and error states, `TableLoader` for the
     * loading one. Each of them can be replaced from outside through `renderError`,
     * `renderLoading` or `renderEmpty`, whose content is centred by `stateContent`.
     */
    const renderStateRow = () => {
        let content: React.ReactNode;

        if (error) {
            // A failed request comes first: showing "No results found" for a 500 hides
            // the only thing the user needs to know.
            content = renderError ? (
                <div className={styles.stateContent}>{renderError(error)}</div>
            ) : (
                <TableEmpty
                    icon="fa6-solid:triangle-exclamation"
                    title="Something went wrong"
                    description={error.message}
                />
            );
        } else if (isLoading) {
            content = renderLoading ? (
                <div className={styles.stateContent}>{renderLoading()}</div>
            ) : (
                <TableLoader loading={true}/>
            );
        } else {
            content = renderEmpty ? (
                <div className={styles.stateContent}>{renderEmpty()}</div>
            ) : (
                <TableEmpty
                    icon="fa6-solid:inbox"
                    title="No results found"
                    description="There's nothing to show here yet."
                />
            );
        }

        return (
            <tr>
                <td className={styles.stateCell} colSpan={columnCount}>
                    {content}
                </td>
            </tr>
        );
    };

    // --- Render -------------------------------------------------------------
    return (
        <>
            {/* Same filter bar as `HeroUiTable`, outside the table card. */}
            {filtersConfig && (
                <TableFilters
                    filters={activeFilters}
                    startIcon={filtersConfig.startIcon}
                    start={filtersConfig.start}
                    end={filtersConfig.end}
                    enableFiltersBtn={filtersConfig.enableFiltersBtn}
                    enableRefreshBtn={filtersConfig.enableRefreshBtn}
                    enableFilterName={filtersConfig.enableFilterName}
                    enableFilterRole={filtersConfig.enableFilterRole}
                    enableFilterStatus={filtersConfig.enableFilterStatus}
                    namePlaceholder={filtersConfig.namePlaceholder}
                    onFilterChange={handleFilterChange}
                    onRefresh={handleRefresh}
                />
            )}

            <div className={styles.wrapper}>
                <div className={styles.scroller}>
                    <table className={styles.table} aria-label={ariaLabel} style={{minWidth: minTableWidth}}>
                        <thead className={styles.header}>
                        <tr>
                            {enableSelection && (
                                <th className={`${styles.column} ${styles.selectColumn}`} scope="col">
                                    <Checkbox
                                        aria-label="Select all rows on this page"
                                        isSelected={allOnPageSelected}
                                        isIndeterminate={selectedOnPage > 0 && !allOnPageSelected}
                                        onChange={toggleAllOnPage}
                                    >
                                        <Checkbox.Content>
                                            <Checkbox.Control>
                                                <Checkbox.Indicator/>
                                            </Checkbox.Control>
                                        </Checkbox.Content>
                                    </Checkbox>
                                </th>
                            )}

                            {headerGroups[0]?.headers.map((header) => {
                                const canSort = header.column.getCanSort();
                                const direction = sortDirectionOf(header.id);
                                const label = flexRender(header.column.columnDef.header, header.getContext());

                                return (
                                    <th
                                        key={header.id}
                                        scope="col"
                                        className={styles.column}
                                        aria-sort={canSort ? direction : undefined}
                                        // `columnDef.size` and not `header.getSize()`: that method
                                        // comes from `columnSizingFeature`, which this table does not
                                        // enable (no resizing), so calling it would throw.
                                        style={header.column.columnDef.size ? {width: `${header.column.columnDef.size}px`} : undefined}
                                    >
                                        {canSort ? (
                                            <button
                                                type="button"
                                                className={styles.sortButton}
                                                onClick={() => handleSort(header.id)}
                                            >
                                                {label}
                                                <Icon className={`${styles.sortIcon} size-3`} icon="fa6-solid:chevron-up"/>
                                            </button>
                                        ) : label}
                                    </th>
                                );
                            })}
                        </tr>
                        </thead>

                        <tbody>
                        {isLoading || !hasRows ? renderStateRow() : rows.map((row) => (
                            <tr
                                key={row.id}
                                className={`${styles.row} ${getRowClassName?.(row.original) ?? ""}`.trim()}
                                style={getRowStyle?.(row.original)}
                            >
                                {enableSelection && (
                                    <td className={`${styles.cell} ${styles.selectCell}`}>
                                        <Checkbox
                                            aria-label={`Select row ${row.id}`}
                                            isSelected={isRowSelected(getRowId(row.original))}
                                            onChange={(selected) => toggleRow(getRowId(row.original), row.original, selected)}
                                        >
                                            <Checkbox.Content>
                                                <Checkbox.Control>
                                                    <Checkbox.Indicator/>
                                                </Checkbox.Control>
                                            </Checkbox.Content>
                                        </Checkbox>
                                    </td>
                                )}

                                {row.getAllCells().map((cell) => {
                                    const isRowHeader = cell.column.id === rowHeaderColumnId;
                                    return (
                                        <td
                                            key={cell.id}
                                            className={`${styles.cell} ${isRowHeader ? styles.rowHeaderCell : ""}`.trim()}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Same footer component as `HeroUiTable`, driven by the same TanStack
                    pagination API: the two tables cannot drift apart. */}
                <TablePagination
                    table={table}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    pageSizeOptions={pageSizeOptions}
                    isLoading={isLoading}
                />
            </div>
        </>
    );
}
