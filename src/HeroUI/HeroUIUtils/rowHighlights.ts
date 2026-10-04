import type React from "react";

/**
 * Declarative per-row highlighting for `HeroUiTable`.
 *
 * The table itself only accepts `getRowStyle` / `getRowClassName`, which is all the
 * flexibility needed but pushes the colours into every call site. These helpers add a
 * small indirection on top: the palette is declared **once** as named tones, and each
 * table only maps its data to a tone name. Changing a colour then means changing one
 * entry in the palette, and every table that shares it follows.
 *
 * Nothing here is tied to the demo: any table can import it.
 *
 * ```ts
 * const palette = { danger: toneHighlight("danger"), warning: toneHighlight("warning", 35) };
 * const byStatus = createRowHighlighter<User>({
 *     tones: palette,
 *     toneFor: (user) => (user.status === "Inactive" ? "danger" : undefined),
 * });
 *
 * <HeroUiTable getRowStyle={byStatus} ... />
 * ```
 */

/** Inline styles for a row (what `getRowStyle` has to return). */
export type RowHighlight = React.CSSProperties;

/** Tones with a matching `--<tone>` / `--<tone>-soft` pair in the theme. */
export type HighlightTone = "accent" | "success" | "warning" | "danger";

/**
 * Builds a row highlight from a theme tone.
 *
 * The background is `--<tone>` mixed with `--surface` and **opaque** on purpose: the
 * `--<tone>-soft` tokens are a 15% alpha meant for small chips, and across a whole row
 * that tint is barely perceptible. Mixing with the surface also makes the result read
 * the same over any background and in every theme, instead of depending on what is
 * painted underneath.
 *
 * @param tone     Theme tone driving both the background and the border colour.
 * @param strength Percentage of the tone in the background mix. Higher is stronger.
 *                 The defaults are tuned per tone because they differ a lot in
 *                 lightness: `warning` is much lighter than `danger`.
 */
export function toneHighlight(tone: HighlightTone, strength?: number): RowHighlight {
    const porcentaje = strength ?? DEFAULT_STRENGTH[tone];
    return {
        backgroundColor: `color-mix(in oklab, var(--${tone}) ${porcentaje}%, var(--surface))`,
        borderColor: `var(--${tone})`,
    };
}

/** Tuned mix per tone: lighter tones need more of themselves to be noticeable. */
const DEFAULT_STRENGTH: Record<HighlightTone, number> = {
    accent: 22,
    success: 30,
    warning: 35,
    danger: 18,
};

/** Configuration of {@link createRowHighlighter}. */
export interface RowHighlighterConfig<TData> {
    /** Named highlights. The key is what `toneFor` returns. */
    tones: Record<string, RowHighlight>;
    /**
     * Maps a row to the name of a tone in `tones`.
     * Return `undefined` (or `null`) for rows that should keep the default look.
     */
    toneFor: (row: TData) => string | null | undefined;
}

/**
 * Turns a `toneFor` mapping into the `getRowStyle` callback the table expects.
 *
 * Returned as `undefined` when a row has no tone, so the table falls back to its own
 * base style instead of receiving an empty object.
 */
export function createRowHighlighter<TData>(
    config: RowHighlighterConfig<TData>
): (row: TData) => RowHighlight | undefined {
    const {tones, toneFor} = config;
    return (row: TData) => {
        const tone = toneFor(row);
        return tone ? tones[tone] : undefined;
    };
}

/** Configuration of {@link createRowClassifier}. */
export interface RowClassifierConfig<TData> {
    /** Named CSS classes. The key is what `toneFor` returns. */
    classes: Record<string, string>;
    /** Maps a row to the name of a class set in `classes`. */
    toneFor: (row: TData) => string | null | undefined;
}

/**
 * Same idea as {@link createRowHighlighter} but for `getRowClassName`.
 *
 * Useful when the highlight is better expressed as utilities, e.g. to keep a `hover:`
 * variant or a `dark:` one, which inline styles cannot express.
 */
export function createRowClassifier<TData>(
    config: RowClassifierConfig<TData>
): (row: TData) => string | undefined {
    const {classes, toneFor} = config;
    return (row: TData) => {
        const tone = toneFor(row);
        return tone ? classes[tone] : undefined;
    };
}
