import React from "react";

/**
 * Configuration for the toolbar shown at the top of the card.
 */
export interface HeroUICardToolbar {
    /**
     * Actions rendered on the right side of the toolbar,
     * aligned vertically with the title/description.
     */
    end?: React.ReactNode;
}

/**
 * Props for `HeroUICard`.
 */
interface HeroUICardProps {
    /** Card title, rendered with the standard bold style */
    title?: React.ReactNode;
    /** Optional description shown below the title, muted */
    description?: React.ReactNode;
    /** Content rendered inside the card */
    children?: React.ReactNode;
    /**
     * Toolbar configuration.
     * - `end` → actions rendered on the right side of the toolbar
     */
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
 * - A **toolbar** at the top using the table-header color (`--surface-tertiary`).
 * - A **content** area with 25px rounded top corners and 15px rounded bottom
 *   corners that visually overlaps the toolbar.
 *
 * ### Toolbar
 * - `title` is rendered with `text-sm font-semibold`.
 * - `description` (optional) is rendered below the title, muted
 *   (`text-xs opacity-70`).
 * - `toolbar.end` renders on the right side, vertically aligned with
 *   the title block.
 *
 * ### How the "inverted" effect works
 * - The **wrapper** has `rounded-[15px]` + `overflow-hidden`.
 * - The **toolbar** is a short colored block (`bg-surface-tertiary`)
 *   that acts as the back panel.
 * - The **content** is a white block with `rounded-t-[25px]` and
 *   `rounded-b-[15px]`, pulled up with `-mt-[15px]` so its rounded top
 *   edge overlaps the toolbar. The toolbar color fills the "empty" corners.
 *
 * ### Example — Basic usage
 * ```tsx
 * <HeroUICard>
 *   <p>Card content</p>
 * </HeroUICard>
 * ```
 *
 * ### Example — With title, description, and actions
 * ```tsx
 * <HeroUICard
 *   title="Theme Buttons"
 *   description="All HeroUI default themes"
 *   toolbar={{
 *     end: (
 *       <>
 *         <HeroUIIconButton icon="fa6-solid:filter" />
 *         <HeroUIIconButton icon="fa6-solid:arrows-rotate" />
 *       </>
 *     ),
 *   }}
 * >
 *   <p>Card content</p>
 * </HeroUICard>
 * ```
 */
const HeroUICard: React.FC<HeroUICardProps> = ({
                                                   title,
                                                   description,
                                                   children,
                                                   toolbar,
                                                   className = "",
                                                   contentClassName = "",
                                               }) => {
    const hasToolbar = Boolean(title || description || toolbar?.end);

    return (
        <div
            className={`
                w-full
                rounded-[15px]
                overflow-hidden
                shadow-sm
                bg-surface-tertiary
                ${className}
            `.trim()}
        >
            {/* Toolbar — colored block that acts as the "back panel" */}
            {hasToolbar && (
                <div
                    className="
                        flex items-start justify-between gap-2
                        px-4 pt-3 pb-2
                        bg-surface-tertiary text-surface-tertiary-foreground
                        rounded-[25px]
                    "
                    style={{height: "25px"}}
                />
            )}

            {/* Content — rounded and pulled up over the toolbar.
                The toolbar color fills the "empty" corners. */}
            <div
                className={`
                    bg-surface
                    rounded-t-[25px]
                    rounded-b-[15px]
                    ${hasToolbar ? "-mt-[15px]" : ""}
                    ${contentClassName}
                `.trim()}
            >
                {/* Toolbar content (title / description / actions) */}
                {hasToolbar && (
                    <div
                        style={{padding: "15px"}}
                        className="flex items-start justify-between gap-2"
                    >
                        {/* Title + description block */}
                        <div className="flex flex-col leading-tight flex-1">
                            {title && (
                                <span className="text-sm font-semibold">
                                    {title}
                                </span>
                            )}
                            {description && (
                                <span className="text-xs opacity-70">
                                    {description}
                                </span>
                            )}
                        </div>

                        {/* Actions on the right */}
                        {toolbar?.end && (
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