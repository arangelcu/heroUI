/**
 * Tonos de color comunes a `HeroUIButton` y `HeroUIIconButton`.
 *
 * Antes cada componente tenia su propia tabla `tv({...})` con las mismas 27
 * claves: ~55 lineas duplicadas por componente. Aqui vive la parte identica y
 * cada uno compone solo lo que difiere, que queda explicito en lugar de escondido
 * en una copia.
 *
 * Nota: la mayoria de estos tonos usan la paleta por defecto de Tailwind, no
 * tokens del tema, asi que no siguen a los presets de `HeroUIThemes`. Es deuda
 * conocida; los tonos `white-*` del tema si usan tokens (`accent`,
 * `surface-secondary`, `surface-tertiary`).
 */
export const sharedTones = {
    default: "",

    /* --- Info (azul) --- */
    info: "bg-blue-500 text-white hover:bg-blue-600 border-none",
    "info-soft": "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-none dark:text-blue-300",
    "white-info": "bg-white text-blue-600 border border-blue-500/30 hover:bg-blue-50 [&_svg]:text-blue-600",

    /* --- Success (verde) --- */
    success: "bg-green-500 text-white hover:bg-green-600 border-none",
    "success-soft": "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-none dark:text-green-300",
    "white-success": "bg-white text-green-600 border border-green-500/30 hover:bg-green-50 [&_svg]:text-green-600",

    /* --- Warning (amarillo, icono blanco) --- */
    warning: "bg-yellow-500 text-black hover:bg-yellow-600 border-none [&_svg]:text-white",
    "warning-soft": "bg-yellow-500/20 text-yellow-800 hover:bg-yellow-500/30 border-none dark:text-yellow-300",
    "white-warning": "bg-white text-yellow-600 border border-yellow-500/30 hover:bg-yellow-50 [&_svg]:text-yellow-600",

    /* --- Danger (rojo) --- */
    danger: "bg-red-500 text-white hover:bg-red-600 border-none",
    "danger-soft": "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-none dark:text-red-300",
    "white-danger": "bg-white text-red-600 border border-red-500/30 hover:bg-red-50 [&_svg]:text-red-600",

    /* --- Brown (carmelita) --- */
    brown: "bg-amber-800 text-white hover:bg-amber-900 border-none",
    "brown-soft": "bg-amber-800/15 text-amber-900 hover:bg-amber-800/25 border-none dark:text-amber-300",
    "white-brown": "bg-white text-amber-800 border border-amber-800/30 hover:bg-amber-50 [&_svg]:text-amber-800",

    /* --- Yellow (amarillo puro, distinto de warning) --- */
    yellow: "bg-yellow-400 text-black hover:bg-yellow-500 border-none [&_svg]:text-white",
    "yellow-soft": "bg-yellow-400/20 text-yellow-800 hover:bg-yellow-400/30 border-none dark:text-yellow-300",
    "white-yellow": "bg-white text-yellow-600 border border-yellow-500/30 hover:bg-yellow-50 [&_svg]:text-yellow-600",

    /* --- Gray (gris) --- */
    gray: "bg-gray-500 text-white hover:bg-gray-600 border-none",
    "gray-soft": "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-none dark:text-gray-300",
    "white-gray": "bg-white text-gray-700 border border-gray-500/30 hover:bg-gray-50 [&_svg]:text-gray-700",

    /* --- White (fondo blanco, texto/icono negro) --- */
    white: "bg-white text-black border border-black/10 hover:bg-gray-100",

    /* --- White + color del tema ---
       `text-primary` NO existe en HeroUI v3 (no hay `--color-primary`): los
       colores del tema son accent / success / danger / warning. El tono anterior
       no pintaba nada; este usa `accent`. */
    "white-primary": "bg-white text-accent border border-accent/20 hover:bg-accent/5 [&_svg]:text-accent",

    "white-secondary-soft": "bg-surface-secondary/10 text-surface-secondary border border-surface-secondary/20 hover:bg-surface-secondary/20",
    "white-tertiary-soft": "bg-surface-tertiary/10 text-surface-tertiary border border-surface-tertiary/20 hover:bg-surface-tertiary/20",
};

/**
 * Variantes que SI difieren entre boton normal y boton icon-only.
 *
 * El boton normal colorea el texto; el de solo icono solo el `<svg>`, porque no
 * tiene texto al que aplicar color. Es la unica divergencia real entre las dos
 * tablas, y queda declarada aqui.
 */
export const buttonOnlyTones = {
    "white-secondary": "bg-white text-surface-secondary border border-black/10 hover:bg-surface-secondary/10 [&_svg]:text-surface-secondary",
    "white-tertiary": "bg-white text-surface-tertiary border border-black/10 hover:bg-surface-tertiary/10 [&_svg]:text-surface-tertiary",
};

export const iconButtonOnlyTones = {
    "white-secondary": "bg-white border border-black/10 hover:bg-surface-secondary/10 [&_svg]:text-surface-secondary",
    "white-tertiary": "bg-white border border-black/10 hover:bg-surface-tertiary/10 [&_svg]:text-surface-tertiary",
};
