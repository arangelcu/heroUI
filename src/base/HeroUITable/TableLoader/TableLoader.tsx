import React from "react";
// @ts-ignore
import styles from "./TableLoader.module.css";

interface TableLoaderProps {
    loading: boolean;
    primaryColor?: string;
    secondaryColor?: string;
    overlayColor?: string;
}

const TableLoader: React.FC<TableLoaderProps> = ({
                                                     loading,
                                                     primaryColor = "var(--accent)",
                                                     secondaryColor = "var(--accent-soft)",
                                                     overlayColor = "var(--surface)",
                                                 }) => {
    if (!loading) return null;

    const cssVars = {
        "--loader-primary": primaryColor,
        "--loader-secondary": secondaryColor,
        "--loader-bg": overlayColor,
    } as React.CSSProperties;

    return (
        <div style={{height: '300px'}}>
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

export default TableLoader;