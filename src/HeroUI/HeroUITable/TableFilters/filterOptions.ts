import type {HeroUISelectOption} from "../../HeroUIUtils/types";

/**
 * Option lists for the `HeroUITable` filters.
 *
 * They used to be copied literally into `HeroUITable` and into the demo: adding an
 * option in one place and not in the other desynchronized the filter and the list.
 */

/** Role options shared by the table filter, the demo selects, and the forms. */
export const ROLE_OPTIONS: HeroUISelectOption[] = [
    {id: "CEO", label: "CEO"},
    {id: "CTO", label: "CTO"},
    {id: "CMO", label: "CMO"},
    {id: "Engineer", label: "Engineer"},
];

/** Status options shared by the table filter, the demo selects, and the forms. */
export const STATUS_OPTIONS: HeroUISelectOption[] = [
    {id: "Active", label: "Active"},
    {id: "Inactive", label: "Inactive"},
    {id: "On Leave", label: "On Leave"},
];
