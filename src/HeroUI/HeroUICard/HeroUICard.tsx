import React from "react";

/**
 * Configuration for the toolbar shown at the top of the card.
 */
export interface HeroUICardToolbar {
    /** Free content aligned to the left of the toolbar */
    start?: React.ReactNode;
    /** Free content aligned to the right of the toolbar */
    end?: React.ReactNode;
}

/**
 * Props for `HeroUICard`.
 */
interface HeroUICardProps {
    /** Content rendered inside the card */
    children?: React.ReactNode;
    /** Toolbar configuration */
    toolbar?: HeroUICardToolbar;
    /** Additional CSS classes for the root wrapper */
    className?: string;
    /** Additional CSS classes for the content area */
    contentClassName?: string;
}

/**
 * `HeroUICard`
 *
 * A card with an inverted layout:
 * - A **toolbar** at the top using the table-header color (`--surface-secondary`).
 * - A **content** area with 25px rounded corners that visually overlaps the toolbar.
 *
 * ### How the "inverted" effect works
 * - The **wrapper** has `rounded-[25px]` + `overflow-hidden` so the whole
 *   card keeps consistent corners.
 * - The **toolbar** is a colored block (`bg-surface-secondary`) at the top.
 *   It also has `rounded-[25px]`, so if the content were not there, you'd
 *   see a colored pill.
 * - The **content** is a white block (`bg-surface`) with its own
 *   `rounded-[25px]`, pulled up with `-mt-[15px]` so its rounded top edge
 *   overlaps the toolbar. Since the toolbar is **behind** and colored,
 *   the "empty" corners left by the content's rounding are filled with
 *   the toolbar color — no white gaps.
 *
 * ### Layout
 * ```
 * ┌───────────────────────────────────────┐  ← wrapper (rounded-[25px], overflow-hidden)
 * │ ╭───────────────────────────────────╮ │  ← toolbar (bg-surface-secondary, rounded)
 * │ │ [start]                   [end]   │ │
 * │ ╰───────────────────────────────────╯ │
 * │ ╭───────────────────────────────────╮ │  ← content (bg-surface, rounded, -mt)
 * │ │                                   │ │
 * │ │         children                  │ │
 * │ │                                   │ │
 * │ ╰───────────────────────────────────╯ │
 * └───────────────────────────────────────┘
 * ```
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUICard>
 *   <p>Card content</p>
 * </HeroUICard>
 * ```
 *
 * ### Example — With toolbar
 * ```tsx
 * <HeroUICard
 *   toolbar={{
 *     start: <h2 className="text-lg font-semibold">Team members</h2>,
 *     end: <HeroUIIconButton icon="fa6-solid:filter" />,
 *   }}
 * >
 *   <p>Card content</p>
 * </HeroUICard>
 * ```
 */
const HeroUICard: React.FC<HeroUICardProps> = ({
                                                   children,
                                                   toolbar,
                                                   className = "",
                                                   contentClassName = "",
                                               }) => {
    return (
        <div
            className={`
                w-full
                rounded-[15px]
                overflow-hidden
                shadow-sm
                bg-surface-secondary
                ${className}
            `.trim()}
        >
            {/* Toolbar — colored block that acts as the "back panel" */}
            {toolbar && (
                <div
                    className="
                        flex items-start justify-between gap-2
                        px-4 pt-3 pb-2
                        bg-surface-secondary text-surface-secondary-foreground
                        rounded-[25px]
                    "
                    style={{height: '25px'}}
                />
            )}

            {/* Content — rounded and pulled up over the toolbar.
                The toolbar color fills the "empty" corners. */}
            <div
                className={`
                        bg-surface text-surface-foreground
                        rounded-t-[25px]
                        rounded-b-[15px]
                        ${toolbar ? "-mt-[15px]" : ""}
                        ${contentClassName}
                    `.trim()}
            >

                {toolbar && (
                    <div
                        style={{padding:'15px'}}
                        className="
                        flex items-start justify-between gap-2 "
                    >
                        <div className="flex items-start gap-2 flex-1">
                            {toolbar.start}
                        </div>
                        {toolbar.end && (
                            <div className="flex items-center gap-2">
                                {toolbar.end}
                            </div>
                        )}

                    </div>
                )}

                {children}
            </div>
        </div>
    );
};

HeroUICard.displayName = "HeroUICard";

export default HeroUICard;