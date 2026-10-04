import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Checkbox, Selection, SortDescriptor, Table} from "@heroui/react";
import type {ColumnDef, RowData, SortingState} from "@tanstack/react-table";
import {
    columnSizingFeature,
    createPaginatedRowModel,
    createSortedRowModel,
    flexRender,
    rowPaginationFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    tableFeatures,
    useTable,
} from "@tanstack/react-table";
import TablePagination from "../TablePagination/TablePagination";
import TableFilters, {FilterValues} from "../TableFilters/TableFilters";
import TableLoader from "../TableLoader/TableLoader";
import TableEmpty from "../TableEmpty/TableEmpty";

// --- Global features (created once) ----------------------------------------
const features = tableFeatures({
    columnSizingFeature,
    paginatedRowModel: createPaginatedRowModel(),
    rowPaginationFeature,
    rowSortingFeature,
    sortFns: {alphanumeric: sortFn_alphanumeric},
    sortedRowModel: createSortedRowModel(),
});

// --- Sorting bridge --------------------------------------------------------
/** Converts the TanStack sorting state into a HeroUI `SortDescriptor`. */
function toSortDescriptor(sorting: SortingState): SortDescriptor | undefined {
    const first = sorting[0];
    if (!first) return undefined;
    return {column: first.id, direction: first.desc ? "descending" : "ascending"};
}

/** Converts a HeroUI `SortDescriptor` back into the TanStack sorting state. */
function toSortingState(descriptor: SortDescriptor): SortingState {
    return [{desc: descriptor.direction === "descending", id: descriptor.column as string}];
}

// --- Types -----------------------------------------------------------------
/**
 * Pagination state controlled by the server.
 * All fields come from the backend response.
 */
export interface PaginationOptions {
    /** Offset of the first row on the current page (in records) */
    first: number;
    /** Same as `first` — kept for clarity in API contracts */
    offset: number;
    /** Current page index (0-based internally) */
    currentPage: number;
    /** Total number of rows in the server */
    totalElements: number;
    /** Number of rows returned in this page */
    countRows: number;
    /** Page size */
    pageSize: number;
    /** Total number of pages */
    pages: number;
}

/**
 * Parameters passed to `fetchData` whenever the user interacts
 * with pagination, sorting, or filters.
 */
export interface FetchParams {
    /** Offset of the first row to request */
    first: number;
    /** Same as `first`, kept for clarity in API contracts */
    offset: number;
    /** Page index to request (0-based) */
    currentPage: number;
    /** Number of rows per page */
    pageSize: number;
    /** Current sorting state */
    sorting: SortingState;
    /** Current filter values */
    filters: FilterValues;
}

/**
 * Configuration for the filters that `HeroUiTable` renders internally
 * when `filtersConfig` is provided.
 */
export interface TableFiltersConfig {
    /** Free content aligned to the left of the header */
    start?: React.ReactNode;
    /** Free content aligned to the right of the header */
    end?: React.ReactNode;
    /** Show the filters toggle button */
    enableFiltersBtn?: boolean;
    /** Show the refresh button */
    enableRefreshBtn?: boolean;
    /** Show the "name" filter */
    enableFilterName?: boolean;
    /** Show the "role" filter */
    enableFilterRole?: boolean;
    /** Show the "status" filter */
    enableFilterStatus?: boolean;
    /** Placeholder for the name filter */
    namePlaceholder?: string;
    /** Iconify name of the icon rendered at the start of the header */
    startIcon?: string;
}

// --- Props -----------------------------------------------------------------
interface HeroUITanStackTableProps<TData extends RowData> {
    /** Column definitions (TanStack Table) */
    columns: ColumnDef<any, TData, any>[];
    /** Rows for the current page (server-side data) */
    data: readonly TData[];
    /** Server-side pagination state */
    paginationOptions: PaginationOptions;
    /** Callback fired on pagination / sorting / filter changes */
    fetchData: (params: FetchParams) => void;
    /** Options for the "rows per page" selector */
    pageSizeOptions?: number[];
    /** Accessible label for the table */
    ariaLabel?: string;
    /** Column id used as the row header (for accessibility) */
    rowHeaderColumnId?: string;
    /**
     * Custom empty state.
     * Defaults to a `TableEmpty` component when not provided.
     */
    renderEmpty?: () => React.ReactNode;
    /**
     * Custom loading state.
     * Defaults to a `TableLoader` component when not provided.
     */
    renderLoading?: () => React.ReactNode;
    /** Whether the table is currently loading */
    isLoading?: boolean;

    // Selection
    /** Enable row selection with checkboxes */
    enableSelection?: boolean;
    /** Callback fired when the selected rows change */
    onSelectionChange?: (selectedRows: TData[]) => void;
    /** Extracts the unique id of a row. Default: `row.id` */
    getRowId?: (row: TData) => string | number;

    // Resizable
    /** Enable column resizing with drag handles */
    enableColumnResizing?: boolean;

    // Per-row styling
    /**
     * Extra CSS classes for a row, decided from its own data.
     *
     * Use it to highlight rows that match a condition, e.g. a row whose `status` is
     * `"Inactive"`. Utilities passed here win over the table's base row look, so they
     * are enough for a background or a border color; combine with `getRowStyle` when
     * the value has to be computed at runtime.
     *
     * ```tsx
     * getRowClassName={(user) => (user.status === "Inactive" ? "bg-danger-soft" : undefined)}
     * ```
     */
    getRowClassName?: (row: TData) => string | undefined;
    /**
     * Inline styles for a row, decided from its own data.
     *
     * Inline styles beat every stylesheet rule, so this is the reliable way to set a
     * value that comes from the data itself (a color stored in the record, a theme
     * token resolved at runtime...).
     *
     * ```tsx
     * getRowStyle={(user) =>
     *     user.status === "Inactive"
     *         ? {backgroundColor: "var(--danger-soft)", borderColor: "var(--danger)"}
     *         : undefined
     * }
     * ```
     */
    getRowStyle?: (row: TData) => React.CSSProperties | undefined;

    // Filters
    /**
     * If provided, `HeroUiTable` renders `TableFilters` internally
     * and fires `fetchData` whenever a filter changes.
     */
    filtersConfig?: TableFiltersConfig;
    /** Optional callback fired whenever the filters change */
    onFiltersChange?: (filters: FilterValues) => void;
}

// --- Generic component -----------------------------------------------------
/**
 * `HeroUiTable`
 *
 * A fully-featured server-side table built on top of TanStack Table v9
 * and HeroUI v3.
 *
 * ### Features
 * - Server-side pagination, sorting, and filtering
 * - Row selection with checkboxes (persists across pages)
 * - Column resizing with drag handles
 * - Built-in filters bar (`TableFilters`) when `filtersConfig` is provided
 * - Built-in loading (`TableLoader`) and empty (`TableEmpty`) states
 * - Integrated pagination footer (`TablePagination`)
 *
 * ### Example — Minimal setup
 * ```tsx
 * <HeroUiTable
 *   columns={columns}
 *   data={data}
 *   paginationOptions={pagination}
 *   fetchData={fetchData}
 *   isLoading={isLoading}
 * />
 * ```
 *
 * ### Example — With filters, selection, and resizing
 * ```tsx
 * <HeroUiTable
 *   columns={columns}
 *   data={data}
 *   paginationOptions={pagination}
 *   fetchData={fetchData}
 *   isLoading={isLoading}
 *   enableSelection
 *   enableColumnResizing
 *   getRowId={(row) => row.id}
 *   onSelectionChange={(rows) => console.log(rows)}
 *   filtersConfig={{
 *     start: <h2>Team members</h2>,
 *     enableFiltersBtn: true,
 *     enableRefreshBtn: true,
 *     enableFilterName: true,
 *     enableFilterRole: true,
 *     enableFilterStatus: true,
 *   }}
 * />
 * ```
 */
export function HeroUiTable<TData extends RowData>({
                                                       columns,
                                                       data,
                                                       paginationOptions,
                                                       fetchData,
                                                       pageSizeOptions = [5, 10, 20, 50, 100],
                                                       ariaLabel = "Data table",
                                                       rowHeaderColumnId,
                                                       renderEmpty,
                                                       renderLoading,
                                                       isLoading = false,
                                                       enableSelection = false,
                                                       onSelectionChange,
                                                       getRowId = (row: any) => row.id,
                                                       enableColumnResizing = false,
                                                       getRowClassName,
                                                       getRowStyle,
                                                       filtersConfig,
                                                       onFiltersChange,
                                                   }: HeroUITanStackTableProps<TData>) {
    // --- State --------------------------------------------------------------
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedRowsMap, setSelectedRowsMap] = useState<Map<string | number, TData>>(new Map());
    const [filters, setFilters] = useState<FilterValues>({});

    // --- Derived from pagination options -----------------------------------
    const pageIndex = paginationOptions.currentPage;
    const pageSize = paginationOptions.pageSize;
    const total = paginationOptions.totalElements;
    const pageCount = paginationOptions.pages;

    // --- TanStack table instance -------------------------------------------
    const table = useTable({
        columns,
        data: data as TData[],
        features,
        manualPagination: true,
        manualSorting: true,
        rowCount: total,
        // Without this TanStack keys the rows by index ("0".."9") while the
        // selection uses `getRowId`: two identity systems running in parallel.
        getRowId: (row: TData) => String(getRowId(row)),
        onSortingChange: setSorting,
        state: {sorting, pagination: {pageIndex, pageSize}},
    });

    const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);
    const rows = table.getRowModel().rows;
    const hasRows = rows.length > 0;

    // --- Selection ----------------------------------------------------------
    useEffect(() => {
        if (!enableSelection) return;
        onSelectionChange?.(Array.from(selectedRowsMap.values()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRowsMap]);

    const selectedKeys: Selection = useMemo(
        () => new Set(Array.from(selectedRowsMap.keys()).map(String)),
        [selectedRowsMap]
    );

    const handleSelectionChange = (keys: Selection) => {
        const next = new Map(selectedRowsMap);

        // "Select all" → add every row from the current page
        if (keys === "all") {
            rows.forEach((r) => {
                const id = getRowId(r.original);
                if (!next.has(id)) next.set(id, r.original);
            });
            setSelectedRowsMap(next);
            return;
        }

        // Remove rows from the current page that are no longer selected
        const currentPageIds = new Set(rows.map((r) => String(getRowId(r.original))));
        currentPageIds.forEach((idStr) => {
            if (!(keys as Set<string>).has(idStr)) {
                for (const key of next.keys()) {
                    if (String(key) === idStr) {
                        next.delete(key);
                        break;
                    }
                }
            }
        });

        // Add newly selected rows from the current page
        rows.forEach((r) => {
            const id = getRowId(r.original);
            if ((keys as Set<string>).has(String(id)) && !next.has(id)) {
                next.set(id, r.original);
            }
        });

        setSelectedRowsMap(next);
    };

    // --- Empty / loading ---------------------------------------------------
    /**
     * Renders the `Table.Body` empty slot.
     *
     * Priority:
     * 1. `renderLoading` / `renderEmpty` (if provided)
     * 2. `TableLoader` / `TableEmpty` (defaults)
     */
    const renderEmptyState = () => {
        if (isLoading) {
            return renderLoading ? renderLoading() : <TableLoader loading={true}/>;
        }

        return renderEmpty ? renderEmpty() : (
            <TableEmpty
                icon="fa6-solid:inbox"
                title="No results found"
                description="There's nothing to show here yet."
            />
        );
    };

    // --- Handlers -----------------------------------------------------------
    const handlePageChange = useCallback((newPageIndex: number) => {
        fetchData({
            first: newPageIndex * pageSize,
            offset: newPageIndex * pageSize,
            currentPage: newPageIndex,
            pageSize,
            sorting,
            filters,
        });
    }, [fetchData, pageSize, sorting, filters]);

    const handlePageSizeChange = useCallback((newSize: number) => {
        fetchData({
            first: 0,
            offset: 0,
            currentPage: 0,
            pageSize: newSize,
            sorting,
            filters,
        });
    }, [fetchData, sorting, filters]);

    const handleSortChange = useCallback((descriptor: SortDescriptor) => {
        const newSorting = toSortingState(descriptor);
        setSorting(newSorting);
        fetchData({
            first: 0,
            offset: 0,
            currentPage: 0,
            pageSize,
            sorting: newSorting,
            filters,
        });
    }, [fetchData, pageSize, filters]);

    const handleFilterChange = useCallback((newFilters: FilterValues) => {
        setFilters(newFilters);
        onFiltersChange?.(newFilters);

        fetchData({
            first: 0,
            offset: 0,
            currentPage: 0,
            pageSize,
            sorting,
            filters: newFilters,
        });
    }, [fetchData, onFiltersChange, pageSize, sorting]);

    const handleRefresh = useCallback(() => {
        fetchData({
            first: 0,
            offset: 0,
            currentPage: 0,
            pageSize,
            sorting,
            filters,
        });
    }, [fetchData, pageSize, sorting, filters]);

    // --- Table content -----------------------------------------------------
    const tableContent = (
        <Table.Content
            aria-label={ariaLabel}
            className="min-w-[600px]"
            sortDescriptor={sortDescriptor}
            onSortChange={handleSortChange}
            selectedKeys={enableSelection ? selectedKeys : undefined}
            selectionMode={enableSelection ? "multiple" : "none"}
            onSelectionChange={enableSelection ? handleSelectionChange : undefined}
        >
            <Table.Header className="bg-transparent [&>tr]:border-b [&>tr]:border-border">
                {/* Selection column */}
                {enableSelection && (
                    <Table.Column
                        className="pe-0 w-[40px]"
                        id="__selection__"
                        defaultWidth={enableColumnResizing ? 40 : undefined}
                        minWidth={enableColumnResizing ? 40 : undefined}
                    >
                        <Checkbox aria-label="Select all" slot="selection">
                            <Checkbox.Content>
                                <Checkbox.Control>
                                    <Checkbox.Indicator/>
                                </Checkbox.Control>
                            </Checkbox.Content>
                        </Checkbox>
                    </Table.Column>
                )}

                {/* Data columns */}
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                    // `getCanSort()` already accounts for the sorting feature and the
                    // accessor. It used to check `accessorFn` on `columnDef`, but
                    // TanStack v9 computes it on the column instance, not on the
                    // definition, so that condition was always false and no column
                    // ever became sortable.
                    const canSort = header.column.getCanSort();
                    const colDef = header.column.columnDef as any;
                    const isLast = table.getHeaderGroups()[0]?.headers.slice(-1)[0]?.id === header.id;

                    return (
                        <Table.Column
                            key={header.id}
                            allowsSorting={canSort}
                            id={header.id}
                            isRowHeader={header.id === rowHeaderColumnId}
                            // Vertical padding comes from `.table__column` in HeroUIStyles.css:
                            // a `py-*` utility here would win over that @layer components rule
                            // and silently split the spacing across two places.
                            className="px-4 text-left font-semibold text-default-foreground"
                            defaultWidth={colDef.defaultWidth}
                            minWidth={colDef.minWidth}
                            style={
                                !enableColumnResizing && header.column.columnDef.size
                                    ? {width: `${header.getSize()}px`}
                                    : undefined
                            }
                        >
                            {({sortDirection}) => (
                                <>
                                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </Table.SortableColumnHeader>
                                    {enableColumnResizing && !isLast && <Table.ColumnResizer/>}
                                </>
                            )}
                        </Table.Column>
                    );
                })}
            </Table.Header>

            <Table.Body items={isLoading || !hasRows ? [] : rows} renderEmptyState={renderEmptyState}>
                {(row) => (
                    <Table.Row
                        key={row.id}
                        id={String(getRowId(row.original))}
                        // The base look (border, background, hover) comes from
                        // `.table__row` in HeroUIStyles.css, so whatever the consumer
                        // returns here is free to override it.
                        className={getRowClassName?.(row.original)}
                        style={getRowStyle?.(row.original)}
                    >
                        {/* Selection cell */}
                        {enableSelection && (
                            <Table.Cell
                                className="pe-0"
                                style={!enableColumnResizing ? {width: "40px"} : undefined}
                            >
                                <Checkbox
                                    aria-label={`Select row ${row.id}`}
                                    slot="selection"
                                    variant="secondary"
                                >
                                    <Checkbox.Content>
                                        <Checkbox.Control>
                                            <Checkbox.Indicator/>
                                        </Checkbox.Control>
                                    </Checkbox.Content>
                                </Checkbox>
                            </Table.Cell>
                        )}

                        {/* Data cells */}
                        {row.getAllCells().map((cell) => (
                            <Table.Cell
                                key={cell.id}
                                // Same as the header: vertical padding lives in
                                // `.table__cell` so there is a single place to tune row height.
                                className="px-4 text-muted"
                                style={
                                    !enableColumnResizing && cell.column.columnDef.size
                                        ? {width: `${cell.column.getSize()}px`}
                                        : undefined
                                }
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Table.Cell>
                        ))}
                    </Table.Row>
                )}
            </Table.Body>
        </Table.Content>
    );

    // --- Render -------------------------------------------------------------
    return (

        <>
            {filtersConfig && (
                <TableFilters
                    filters={filters}
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

            <Table className="rounded-[15px] overflow-hidden shadow-sm border border-border/40">
                {/* Filters bar (only when filtersConfig is provided) */}


                {/* Table body: resizable or scrollable */}
                {enableColumnResizing ? (
                    <Table.ResizableContainer>
                        {tableContent}
                    </Table.ResizableContainer>
                ) : (
                    <Table.ScrollContainer>
                        {tableContent}
                    </Table.ScrollContainer>
                )}

                {/* Pagination footer */}
                <Table.Footer>
                    {isLoading || !hasRows ? null : (
                        <TablePagination
                            currentPage={pageIndex + 1}
                            totalPages={pageCount}
                            pageSize={pageSize}
                            pageSizeOptions={pageSizeOptions}
                            onPageChange={(page) => handlePageChange(page - 1)}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )}
                </Table.Footer>
            </Table>
        </>


    );
}

HeroUiTable.displayName = "HeroUiTable";