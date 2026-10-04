import {useCallback, useEffect, useRef, useState} from "react";
import type {FetchParams, PaginationOptions} from "../HeroUITable/HeroUITable/HeroUiTable";

const initialPaginationOptions: PaginationOptions = {
    first: 0,
    offset: 0,
    currentPage: 0,
    totalElements: 0,
    countRows: 0,
    pageSize: 10,
    pages: 0,
};

export interface ServerTable<TData> {
    data: TData[];
    isLoading: boolean;
    paginationOptions: PaginationOptions;
    fetchData: (params: FetchParams) => void;
}

/**
 * Estado de tabla server-side, aislado por instancia.
 *
 * Cada tabla necesita su propio `data` / `isLoading` / `paginationOptions`:
 * compartirlos hace que paginar una tabla mueva las demás, y que dos peticiones
 * simultáneas se sobrescriban según cuál responda última.
 *
 * Cada petición lleva un `requestId`: solo la última puede escribir estado, así
 * que una respuesta lenta no pisa a una más reciente.
 */
export function useServerTable<TData>(
    fetcher: (params: FetchParams) => Promise<TData[]>,
): ServerTable<TData> {
    const [data, setData] = useState<TData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationOptions, setPaginationOptions] =
        useState<PaginationOptions>(initialPaginationOptions);

    // El fetcher vive en un ref para que la identidad del callback del padre no
    // forme parte de las dependencias de ningun efecto.
    const fetcherRef = useRef(fetcher);
    const requestIdRef = useRef(0);

    /**
     * Aplica una respuesta. Devuelve `false` si la respuesta ya es obsoleta.
     * La cancelacion se gestiona con el `requestId` del propio efecto de pedido,
     * sin un flag de "montado": un flag puesto a `false` en la limpieza bloquearia
     * para siempre las escrituras si el ref sobrevive al ciclo de montaje doble
     * de StrictMode, y ese fue justo el fallo que dejo las tablas vacias.
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

    /** Peticion desde un manejador de evento: marca la carga de inmediato. */
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

    // Mantiene el ref al dia sin escribirlo durante el render.
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    // Carga inicial: cada tabla pide su primera pagina al montarse.
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
