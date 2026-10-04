import type React from "react";

/**
 * Types shared by the wrappers in `src/HeroUI`.
 *
 * Each component used to declare its own copy of `HeroUITooltipConfig`: that was
 * 15 declarations with 9 different variants (some with a `TooltipPlacement` alias,
 * others with the inline literal, with diverging comments). By living here, the
 * shape of the tooltip cannot drift apart again.
 */

/** Places where a tooltip or a popup can be positioned. */
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

/**
 * Tooltip configuration of a component.
 *
 * Every wrapper accepts `tooltip` as a `string` (shorthand for `{text}`) or as
 * this object.
 */
export interface HeroUITooltipConfig {
    /** Tooltip content. */
    text: React.ReactNode;
    /** Position relative to the control. Defaults to `"top"`. */
    placement?: TooltipPlacement;
    /** Shows or hides the arrow. Defaults to `false`. */
    showArrow?: boolean;
    /** Delay in ms before showing it. Defaults to `0`. */
    delay?: number;
    /** Extra classes for the tooltip content. */
    className?: string;
}

/** An option of a `HeroUISelect` or `HeroUIComboBox`. */
export interface HeroUISelectOption {
    /** Unique identifier of the option. */
    id: string;
    /** Visible text of the option. */
    label: string;
}
