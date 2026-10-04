import React from "react";
import {EmptyState} from "@heroui/react";
import {Icon} from "@iconify/react";
import styles from "./TableEmpty.module.css";

/**
 * Props for `TableEmpty`.
 *
 * A centered empty-state block designed to be rendered inside a table
 * when there is no data to show.
 */
interface TableEmptyProps {
    /** Iconify icon name (e.g. `"fa6-solid:inbox"`). Default: `"gravity-ui:tray"` */
    icon?: string;
    /** Main title. Default: `"No results found"` */
    title?: string;
    /** Optional secondary text below the title */
    description?: string;
    /** Extra content rendered below the description (buttons, links, etc.) */
    children?: React.ReactNode;
    /** Background color of the container. Default: `var(--loader-bg)` */
    overlayColor?: string;
    /** Height of the container. Default: `"300px"` */
    height?: string | number;
}

/**
 * `TableEmpty`
 *
 * A centered empty-state block to display when a table has no rows.
 *
 * ### Features
 * - Configurable icon, title, and description
 * - Optional children for actions (buttons, links, etc.)
 * - Background driven by `--loader-bg`, so it can share the same
 *   surface as the `TableLoader`
 * - Configurable height
 *
 * ### Example — Basic usage
 * ```tsx
 * <TableEmpty />
 * ```
 *
 * ### Example — Custom content
 * ```tsx
 * <TableEmpty
 *   icon="fa6-solid:users"
 *   title="No users yet"
 *   description="Invite your team to get started."
 * >
 *   <HeroUIButton icon="fa6-solid:plus" onPress={handleInvite}>
 *     Invite user
 *   </HeroUIButton>
 * </TableEmpty>
 * ```
 *
 * ### Example — Custom height and background
 * ```tsx
 * <TableEmpty
 *   title="Nothing here"
 *   overlayColor="var(--surface-secondary)"
 *   height={400}
 * />
 * ```
 */
const TableEmpty: React.FC<TableEmptyProps> = ({
                                                   icon = "gravity-ui:tray",
                                                   title = "No results found",
                                                   description,
                                                   overlayColor = "var(--loader-bg)",
                                                   height = "300px",
                                                   children,
                                               }) => {
    /** CSS variables consumed by the CSS Module. */
    const cssVars = {
        "--loader-bg": overlayColor,
    } as React.CSSProperties;

    return (
        <div className={styles.container} style={{...cssVars, height}}>
            <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-3 py-8 text-center">
                <Icon className="size-8 text-muted" icon={icon}/>

                <span className="text-sm font-medium text-default-foreground">
                    {title}
                </span>

                {description && (
                    <span className="max-w-sm text-xs text-muted">
                        {description}
                    </span>
                )}

                {children}
            </EmptyState>
        </div>
    );
};

TableEmpty.displayName = "TableEmpty";

export default TableEmpty;