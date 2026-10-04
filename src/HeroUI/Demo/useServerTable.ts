import {useCallback, useEffect, useRef, useState} from "react";
import type {FetchParams, PaginationOptions} from "../HeroUITable/HeroUITable/HeroUiTable";

/** Pagination state used until the first response arrives. */
const initialPaginationOptions: PaginationOptions = {
    first: 0,
    offset: 0,
    currentPage: 0,
    totalElements: 0,
    countRows: 0,
    pageSize: 10,
    pages: 0,
};

/** State returned by `useServerTable` for a single table instance. */
export interface ServerTable<TData> {
    /** Rows of the page that was fetched last */
    data: TData[];
    /** Whether a request is in flight */
    isLoading: boolean;
    /** Pagination state reported by the fetcher */
    paginationOptions: PaginationOptions;
    /** Requests a page; fires the fetcher and stores the result */
    fetchData: (params: FetchParams) => void;
}

/**
 * Server-side table state, isolated per instance.
 *
 * Every table needs its own `data` / `isLoading` / `paginationOptions`: sharing
 * them makes paginating one table move the others, and makes two simultaneous
 * requests overwrite each other depending on which one answers last.
 *
 * Every request carries a `requestId`: only the latest one can write state, so a
 * slow response does not overwrite a more recent one.
 */
export function useServerTable<TData>(
    fetcher: (params: FetchParams) => Promise<TData[]>,
): ServerTable<TData> {
    const [data, setData] = useState<TData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationOptions, setPaginationOptions] =
        useState<PaginationOptions>(initialPaginationOptions);

    // The fetcher lives in a ref so that the identity of the parent callback is not
    // part of any effect dependency list.
    const fetcherRef = useRef(fetcher);
    const requestIdRef = useRef(0);

    /**
     * Applies a response. Returns `false` when the response is already stale.
     * Cancellation is handled with the `requestId` of the request effect itself,
     * without a "mounted" flag: a flag set to `false` on cleanup would block writes
     * forever if the ref survives the double mount cycle of StrictMode, and that
     * was exactly the bug that left the tables empty.
     */
    const applyResult = useCallback((rows: TData[], params: FetchParams, requestId: number) => {
        if (requestId !== requestIdRef.current) return false;

        setData(rows);
        setPaginationOptions({
            first: params.offset,
            offset: params.offset,
            currentPage: params.currentPage,
            totalElements: rows.length,
            countRows: rows.length,
            pageSize: params.pageSize,
            pages: Math.max(1, Math.ceil(rows.length / params.pageSize)),
        });
        setIsLoading(false);
        return true;
    }, []);

    /** Request from an event handler: it flags loading immediately. */
    const fetchData = useCallback((params: FetchParams) => {
        const requestId = ++requestIdRef.current;

        setIsLoading(true);
        fetcherRef.current(params)
            .then((rows) => applyResult(rows, params, requestId))
            .catch((error: unknown) => {
                if (requestId === requestIdRef.current) setIsLoading(false);
                console.error("useServerTable: fallo la peticion", error);
            });
    }, [applyResult]);

    // Keeps the ref up to date without writing it during render.
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    // Initial load: every table requests its first page on mount.
    useEffect(() => {
        const requestId = ++requestIdRef.current;
        const params: FetchParams = {
            first: 0,
            offset: 0,
            currentPage: 0,
            pageSize: initialPaginationOptions.pageSize,
            sorting: [],
            filters: {},
        };

        fetcherRef.current(params)
            .then((rows) => applyResult(rows, params, requestId))
            .catch((error: unknown) => {
                if (requestId === requestIdRef.current) setIsLoading(false);
                console.error("useServerTable: fallo la carga inicial", error);
            });
    }, [applyResult]);

    return {data, isLoading, paginationOptions, fetchData};
}
