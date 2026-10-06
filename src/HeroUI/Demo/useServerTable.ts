import {useCallback, useEffect, useRef, useState} from "react";
import type {FetchParams, PaginationOptions} from "../HeroUITable/HeroUITable/HeroUiTable";

/**
 * One page of server data plus the size of the whole result set.
 *
 * The `total` is what makes pagination possible: a page alone cannot say how
 * many pages there are. It is the number of rows the server holds for the
 * current filters, not the number of rows in `rows`.
 */
export interface FetchResult<TData> {
    /** Rows of the requested page. */
    rows: TData[];
    /** Total number of rows on the server for the current filters. */
    total: number;
}

/** Fetches one page of rows, already filtered and sorted by the server. */
export type ServerTableFetcher<TData> = (params: FetchParams) => Promise<FetchResult<TData>>;

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
    /** Rows of the page that was fetched last. */
    data: TData[];
    /** Whether a request is in flight. */
    isLoading: boolean;
    /** Failure of the last request, or `null` when it succeeded. */
    error: Error | null;
    /** Pagination state reported by the fetcher. */
    paginationOptions: PaginationOptions;
    /** Requests a page; fires the fetcher and stores the result. */
    fetchData: (params: FetchParams) => void;
}

/** Normalises anything a fetcher throws into an `Error`. */
function toError(cause: unknown): Error {
    return cause instanceof Error ? cause : new Error(String(cause));
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
 *
 * A failed request lands in `error` instead of leaving the previous page on
 * screen, so a broken backend cannot be mistaken for "no results".
 */
export function useServerTable<TData>(
    fetcher: ServerTableFetcher<TData>,
): ServerTable<TData> {
    const [data, setData] = useState<TData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [paginationOptions, setPaginationOptions] =
        useState<PaginationOptions>(initialPaginationOptions);

    // The fetcher lives in a ref so that the identity of the parent callback is not
    // part of any effect dependency list.
    const fetcherRef = useRef(fetcher);
    const requestIdRef = useRef(0);

    /**
     * Applies a response. Returns `false` when the response is already stale.
     * Cancellation is handled with the `requestId` of the request, without a
     * "mounted" flag: a flag set to `false` on cleanup would block writes forever
     * if the ref survives the double mount cycle of StrictMode, and that was
     * exactly the bug that left the tables empty.
     */
    const applyResult = useCallback(
        (result: FetchResult<TData>, params: FetchParams, requestId: number) => {
            if (requestId !== requestIdRef.current) return false;

            const {rows, total} = result;

            setData(rows);
            setPaginationOptions({
                first: params.offset,
                offset: params.offset,
                currentPage: params.currentPage,
                totalElements: total,
                countRows: rows.length,
                pageSize: params.pageSize,
                // `total` comes from the server, so this is the real page count. Using
                // the rows of the current page made every table a single page long.
                pages: Math.max(1, Math.ceil(total / params.pageSize)),
            });
            setIsLoading(false);
            setError(null);
            return true;
        },
        [],
    );

    /** Reports a failure, as long as it still belongs to the latest request. */
    const applyError = useCallback((cause: unknown, requestId: number) => {
        if (requestId !== requestIdRef.current) return;
        setIsLoading(false);
        setError(toError(cause));
    }, []);

    /** Request from an event handler: it flags loading immediately. */
    const fetchData = useCallback((params: FetchParams) => {
        const requestId = ++requestIdRef.current;

        setIsLoading(true);
        setError(null);
        fetcherRef.current(params)
            .then((result) => applyResult(result, params, requestId))
            .catch((cause: unknown) => applyError(cause, requestId));
    }, [applyResult, applyError]);

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
            .then((result) => applyResult(result, params, requestId))
            .catch((cause: unknown) => applyError(cause, requestId));
    }, [applyResult, applyError]);

    return {data, isLoading, error, paginationOptions, fetchData};
}
