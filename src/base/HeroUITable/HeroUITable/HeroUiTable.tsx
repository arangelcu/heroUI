import React, {useMemo, useState} from "react";
import {EmptyState, SortDescriptor, Spinner, Table} from "@heroui/react";
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
                                                   }: HeroUITanStackTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);

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

    return (
        <Table>
            <Table.ScrollContainer>
                <Table.Content
                    aria-label={ariaLabel}
                    className="min-w-[600px]"
                    sortDescriptor={sortDescriptor}
                    onSortChange={handleSortChange}
                >
                    <Table.Header className="bg-surface-secondary [&>tr]:border-b [&>tr]:border-border">
                        {table.getHeaderGroups()[0]?.headers.map((header) => (
                            <Table.Column
                                key={header.id}
                                allowsSorting={
                                    header.column.getCanSort() &&
                                    "accessorFn" in header.column.columnDef &&
                                    !!header.column.columnDef.accessorFn
                                }
                                id={header.id}
                                isRowHeader={header.id === rowHeaderColumnId}
                                className="px-4 py-3 text-left font-semibold text-default-foreground"
                                style={
                                    header.column.columnDef.size
                                        ? {width: `${header.getSize()}px`}
                                        : undefined
                                }
                            >
                                {({sortDirection}) => (
                                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </Table.SortableColumnHeader>
                                )}
                            </Table.Column>
                        ))}
                    </Table.Header>
                    <Table.Body
                        items={isLoading || !hasRows ? [] : rows}
                        renderEmptyState={renderEmptyState}
                    >
                        {(row) => (
                            <Table.Row
                                key={row.id}
                                id={row.id}
                                className="border-b border-border hover:bg-surface-secondary-hover"
                            >
                                {row.getAllCells().map((cell) => (
                                    <Table.Cell
                                        key={cell.id}
                                        className="px-4 py-3 text-muted"
                                        style={
                                            cell.column.columnDef.size
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
            </Table.ScrollContainer>

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