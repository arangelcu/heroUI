import type React from "react";

/**
 * Tipos compartidos por los wrappers de `src/HeroUI`.
 *
 * Antes cada componente declaraba su propia copia de `HeroUITooltipConfig`: eran
 * 15 declaraciones con 9 variantes distintas (unas con un alias `TooltipPlacement`,
 * otras con el literal en linea, con comentarios divergentes). Al vivir aqui, la
 * forma del tooltip no puede volver a separarse.
 */

/** Sitios donde se puede situar un tooltip o un popup. */
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

/**
 * Configuracion del tooltip de un componente.
 *
 * Todos los wrappers aceptan `tooltip` como `string` (atajo para `{text}`) o como
 * este objeto.
 */
export interface HeroUITooltipConfig {
    /** Contenido del tooltip. */
    text: React.ReactNode;
    /** Posicion respecto al control. Por defecto `"top"`. */
    placement?: TooltipPlacement;
    /** Muestra u oculta la flecha. Por defecto `false`. */
    showArrow?: boolean;
    /** Retardo en ms antes de mostrarlo. Por defecto `0`. */
    delay?: number;
    /** Clases extra para el contenido del tooltip. */
    className?: string;
}

/** Una opcion de un `HeroUISelect` o `HeroUIComboBox`. */
export interface HeroUISelectOption {
    /** Identificador unico de la opcion. */
    id: string;
    /** Texto visible de la opcion. */
    label: string;
}
