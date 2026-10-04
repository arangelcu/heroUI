import React from "react";
import {Icon} from "@iconify/react";
import {tv} from "tailwind-variants";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */

/* -------------------------------------------------------------------------- */

export interface NavItem {
    icon: string;
    label: string;
}

const NAV_ITEMS: NavItem[] = [
    {icon: "fa6-solid:house", label: "Home"},
    {icon: "fa6-solid:magnifying-glass", label: "Search"},
    {icon: "fa6-solid:bell", label: "Notifications"},
    {icon: "fa6-solid:envelope", label: "Messages"},
    {icon: "fa6-solid:image", label: "Gallery"},
    {icon: "fa6-solid:star", label: "Favorites"},
    {icon: "fa6-solid:user", label: "Profile"},
    {icon: "fa6-solid:gear", label: "Settings"},
];

/* -------------------------------------------------------------------------- */
/*                                Variants                                    */
/* -------------------------------------------------------------------------- */

const iconTile = tv({
    base: "flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] transition-transform",
    variants: {
        variant: {
            /** Idéntico al ícono del título del toolbar (coral + ícono blanco) */
            primary: "bg-surface-tertiary text-surface-tertiary-foreground",
            /** Activo suave: coral translúcido con ícono coral */
            active: "bg-surface-tertiary/25 text-surface-tertiary",
            /** Inactivo: coral muy tenue */
            subtle: "bg-surface-tertiary/10 text-surface-tertiary",
        },
        interactive: {
            true: "cursor-pointer hover:scale-105",
            false: "",
        },
    },
    defaultVariants: {
        variant: "primary",
        interactive: false,
    },
});

/* -------------------------------------------------------------------------- */
/*                              Sidebar props                                 */

/* -------------------------------------------------------------------------- */

interface SidebarProps {
    /** Whether the sidebar is expanded */
    expanded: boolean;
    /** Callback to toggle expansion */
    onExpandedChange: (v: boolean) => void;
    /** Active item key (matches `label`) */
    activeKey?: string;
    /** Callback fired when an item is clicked */
    onSelect?: (item: NavItem) => void;
    /** Height of the top toolbar (px) — sidebar starts below it */
    topOffset?: number;
    /** Width of the collapsed rail (px) */
    railWidth?: number;
    /** Width of the expanded sidebar (px) */
    expandedWidth?: number;
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function HeroUIDemoSidebar({
                                              expanded,
                                              onExpandedChange,
                                              activeKey,
                                              onSelect,
                                              topOffset = 60,
                                              railWidth = 64,
                                              expandedWidth = 260,
                                          }: SidebarProps) {
    const width = expanded ? expandedWidth : railWidth;

    return (
        <aside
            className="fixed left-0 bottom-0 z-30 flex flex-col bg-surface-secondary/40 backdrop-blur-sm transition-[width] duration-200 ease-out hidden"
            style={{
                top: `${topOffset}px`,
                width: `${width}px`,
            }}
        >
            {/* ---- Header (hamburger / title) ---- */}
            <div className="flex items-center gap-3 px-3 py-3">
                <button
                    type="button"
                    onClick={() => onExpandedChange(!expanded)}
                    aria-label={expanded ? "Collapse menu" : "Expand menu"}
                    className={iconTile({variant: "primary", interactive: true})}
                >
                    <Icon
                        icon={expanded ? "fa6-solid:chevron-left" : "fa6-solid:bars"}
                        className="size-4"
                    />
                </button>

                {expanded && (
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-foreground">Navigation</span>
                        <span className="text-xs text-muted">Menu</span>
                    </div>
                )}
            </div>

            {/* ---- Nav items ---- */}
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.label === activeKey;

                    return (
                        <button
                            key={item.label}
                            type="button"
                            title={item.label}
                            aria-label={item.label}
                            onClick={() => onSelect?.(item)}
                            className={[
                                "flex items-center gap-3 rounded-[8px] p-1 transition-colors",
                                isActive ? "bg-surface/70" : "hover:bg-surface/60",
                            ].join(" ")}
                        >
                            {/* Icon tile — mismo estilo que el título del toolbar */}
                            <div className={iconTile({variant: isActive ? "primary" : "active"})}>
                                <Icon icon={item.icon} className="size-4"/>
                            </div>

                            {/* Label (solo visible en expanded) */}
                            {expanded && (
                                <span className="truncate text-sm text-foreground">
                                    {item.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ---- Footer (avatar) ---- */}
            <div className="mt-auto px-3 py-3">
                <button
                    type="button"
                    aria-label="Profile"
                    className="flex items-center gap-3 rounded-[8px] p-1 transition-colors hover:bg-surface/60"
                >
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-xs font-semibold text-surface-tertiary-foreground">
                        SMS
                    </div>
                    {expanded && (
                        <span className="truncate text-sm text-foreground">SMS User</span>
                    )}
                </button>
            </div>
        </aside>
    );
}