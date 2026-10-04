import type {HeroUISelectOption} from "../../HeroUIUtils/types";

/**
 * Listas de opciones de los filtros de `HeroUITable`.
 *
 * Antes estaban copiadas literalmente en `HeroUITable` y en el demo: al anadir una
 * opcion en un sitio y no en el otro, el filtro y el listado se desincronizaban.
 */
export const ROLE_OPTIONS: HeroUISelectOption[] = [
    {id: "CEO", label: "CEO"},
    {id: "CTO", label: "CTO"},
    {id: "CMO", label: "CMO"},
    {id: "Engineer", label: "Engineer"},
];

export const STATUS_OPTIONS: HeroUISelectOption[] = [
    {id: "Active", label: "Active"},
    {id: "Inactive", label: "Inactive"},
    {id: "On Leave", label: "On Leave"},
];
