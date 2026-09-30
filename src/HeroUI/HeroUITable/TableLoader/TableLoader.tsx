import React from "react";
// @ts-ignore
import styles from "./TableLoader.module.css";

/**
 * Props for `TableLoader`.
 *
 * A loading spinner overlay designed to cover a table area while data is
 * being fetched. Renders two spinning rings with configurable colors.
 */
interface TableLoaderProps {
    /** Whether the loader is visible */
    loading: boolean;
    /** Color of the primary (outer) ring. Default: `var(--accent)` */
    primaryColor?: string;
    /** Color of the secondary (inner) ring. Default: `var(--accent-soft)` */
    secondaryColor?: string;
    /** Background color of the overlay. Default: `var(--surface)` */
    overlayColor?: string;
    /** Height of the wrapper. Default: `"300px"` */
    height?: string | number;
}

/**
 * `TableLoader`
 *
 * A centered overlay with two spinning rings, meant to be rendered inside
 * a table body while loading data.
 *
 * ### Features
 * - Two rings spinning in opposite directions
 * - Colors driven by CSS variables, so they adapt to any theme
 * - Fully configurable via props (`primaryColor`, `secondaryColor`, `overlayColor`)
 * - Renders nothing when `loading === false`
 *
 * ### Example
 * ```tsx
 * <TableLoader loading={isLoading} />
 * ```
 *
 * ### Example — Custom colors and height
 * ```tsx
 * <TableLoader
 *   loading={isLoading}
 *   primaryColor="var(--accent)"
 *   secondaryColor="var(--accent-soft)"
 *   overlayColor="var(--surface-secondary)"
 *   height={400}
 * />
 * ```
 */
const TableLoader: React.FC<TableLoaderProps> = ({
                                                     loading,
                                                     primaryColor = "var(--accent)",
                                                     secondaryColor = "var(--accent-soft)",
                                                     overlayColor = "var(--surface)",
                                                     height = "300px",
                                                 }) => {
    if (!loading) return null;

    /** CSS variables consumed by the CSS Module. */
    const cssVars = {
        "--loader-primary": primaryColor,
        "--loader-secondary": secondaryColor,
        "--loader-bg": overlayColor,
    } as React.CSSProperties;

    return (
        <div style={{height}}>
            <div className={styles.overlay} style={cssVars}>
                <div className={styles.spinner}>
                    <div className={styles.ldio}>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

TableLoader.displayName = "TableLoader";

export default TableLoader;