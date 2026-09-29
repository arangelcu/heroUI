import React, {useEffect, useMemo, useState} from "react";
import {Checkbox, EmptyState, Selection, SortDescriptor, Spinner, Table} from "@heroui/react";
import {Icon} from "@iconify/react";
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

// --- Features globales -----------------------------------------------------
const features = tableFeatures({
    columnSizingFeature,
    paginatedRowModel: createPaginatedRowModel(),
    rowPaginationFeature,
    rowSortingFeature,
    sortFns: {
        alphanumeric: sortFn_alphanumeric,
    },
    sortedRowModel: createSortedRowModel(),
});

// --- Sorting Bridge -------------------------------------------------------
function toSortDescriptor(sorting: SortingState): SortDescriptor | undefined {
    const first = sorting[0];
    if (!first) return undefined;
    return {
        column: first.id,
        direction: first.desc ? "descending" : "ascending",
    };
}

function toSortingState(descriptor: SortDescriptor): SortingState {
    return [{desc: descriptor.direction === "descending", id: descriptor.column as string}];
}

// --- Tipos ----------------------------------------------------------------
export interface PaginationOptions {
    first: number;
    offset: number;
    currentPage: number;
    totalElements: number;
    countRows: number;
    pageSize: number;
    pages: number;
}

export interface FetchParams {
    first: number;
    offset: number;
    currentPage: number;
    pageSize: number;
    sorting: SortingState;
}

// --- Props del componente -------------------------------------------------
interface HeroUITanStackTableProps<TData extends RowData> {
    columns: ColumnDef<any, TData, any>[];
    data: readonly TData[];
    paginationOptions: PaginationOptions;
    fetchData: (params: FetchParams) => void;
    pageSizeOptions?: number[];
    ariaLabel?: string;
    rowHeaderColumnId?: string;
    renderEmpty?: () => React.ReactNode;
    renderLoading?: () => React.ReactNode;
    isLoading?: boolean;

    // Selección
    enableSelection?: boolean;
    onSelectionChange?: (selectedRows: TData[]) => void;
    getRowId?: (row: TData) => string | number;

    // Resizable
    enableColumnResizing?: boolean;

    // 👇 Header personalizado (siempre visible si se pasa)
    renderHeader?: React.ReactNode;
}

// --- Componente genérico --------------------------------------------------
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
                                                       renderHeader,
                                                   }: HeroUITanStackTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const [selectedRowsMap, setSelectedRowsMap] = useState<Map<string | number, TData>>(new Map());

    const pageIndex = paginationOptions.currentPage;
    const pageSize = paginationOptions.pageSize;
    const total = paginationOptions.totalElements;
    const pageCount = paginationOptions.pages;

    const table = useTable({
        columns,
        data: data as TData[],
        features,
        manualPagination: true,
        manualSorting: true,
        rowCount: total,
        onSortingChange: setSorting,
        state: {
            sorting,
            pagination: {pageIndex, pageSize},
        },
    });

    const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);

    const rows = table.getRowModel().rows;
    const hasRows = rows.length > 0;

    // --- Selección ---------------------------------------------------------
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

        if (keys === "all") {
            rows.forEach((r) => {
                const id = getRowId(r.original);
                if (!next.has(id)) next.set(id, r.original);
            });
            setSelectedRowsMap(next);
            return;
        }

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

        rows.forEach((r) => {
            const id = getRowId(r.original);
            if ((keys as Set<string>).has(String(id)) && !next.has(id)) {
                next.set(id, r.original);
            }
        });

        setSelectedRowsMap(next);
    };

    // --- Empty / loading ---------------------------------------------------
    const renderEmptyState = () => {
        if (isLoading) {
            return renderLoading ? (
                renderLoading()
            ) : (
                <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-3 py-8 text-center">
                    <Spinner className="size-8 text-accent"/>
                    <span className="text-sm text-muted">Cargando...</span>
                </EmptyState>
            );
        }

        return renderEmpty ? (
            renderEmpty()
        ) : (
            <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-3 py-8 text-center">
                <Icon className="size-8 text-muted" icon="gravity-ui:tray"/>
                <span className="text-sm text-muted">No results found</span>
            </EmptyState>
        );
    };

    // --- Handlers paginado / sorting --------------------------------------
    const handlePageChange = (newPageIndex: number) => {
        fetchData({
            first: newPageIndex * pageSize,
            offset: newPageIndex * pageSize,
            currentPage: newPageIndex,
            pageSize,
            sorting,
        });
    };

    const handlePageSizeChange = (newSize: number) => {
        fetchData({
            first: 0,
            offset: 0,
            currentPage: 0,
            pageSize: newSize,
            sorting,
        });
    };

    const handleSortChange = (descriptor: SortDescriptor) => {
        const newSorting = toSortingState(descriptor);
        setSorting(newSorting);
        fetchData({
            first: 0,
            offset: 0,
            currentPage: 0,
            pageSize,
            sorting: newSorting,
        });
    };

    // --- Contenido reutilizable (con o sin resize) -------------------------
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
            <Table.Header className="bg-surface-secondary [&>tr]:border-b [&>tr]:border-border">
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

                {table.getHeaderGroups()[0]?.headers.map((header) => {
                    const canSort =
                        header.column.getCanSort() &&
                        "accessorFn" in header.column.columnDef &&
                        !!header.column.columnDef.accessorFn;

                    const colDef = header.column.columnDef as any;
                    const isLast = table.getHeaderGroups()[0]?.headers.slice(-1)[0]?.id === header.id;

                    return (
                        <Table.Column
                            key={header.id}
                            allowsSorting={canSort}
                            id={header.id}
                            isRowHeader={header.id === rowHeaderColumnId}
                            className="px-4 py-3 text-left font-semibold text-default-foreground"
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
            <Table.Body
                items={isLoading || !hasRows ? [] : rows}
                renderEmptyState={renderEmptyState}
            >
                {(row) => (
                    <Table.Row
                        key={row.id}
                        id={String(getRowId(row.original))}
                        className="border-b border-border hover:bg-surface-secondary-hover"
                    >
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

                        {row.getAllCells().map((cell) => (
                            <Table.Cell
                                key={cell.id}
                                className="px-4 py-3 text-muted"
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

    return (
        <Table>
            {renderHeader}
            {enableColumnResizing ? (
                <Table.ResizableContainer>
                    {tableContent}
                </Table.ResizableContainer>
            ) : (
                <Table.ScrollContainer>
                    {tableContent}
                </Table.ScrollContainer>
            )}

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
    );
}