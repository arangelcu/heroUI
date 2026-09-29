import React from "react";
import {EmptyState} from "@heroui/react";
import {Icon} from "@iconify/react";
// @ts-ignore
import styles from "./TableEmpty.module.css";

interface TableEmptyProps {
    icon?: string;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    /** Color de fondo del contenedor (por defecto: --loader-bg) */
    overlayColor?: string;
}

const TableEmpty: React.FC<TableEmptyProps> = ({
                                                   icon = "gravity-ui:tray",
                                                   title = "No results found",
                                                   description,
                                                   overlayColor = "var(--loader-bg)",
                                                   children,
                                               }) => {
    const cssVars = {
        "--loader-bg": overlayColor,
    } as React.CSSProperties;

    return (
        <div className={styles.container} style={cssVars}>
            <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-3 py-8 text-center">
                <Icon className="size-8 text-muted" icon={icon}/>
                <span className="text-sm font-medium text-default-foreground">{title}</span>
                {description && (
                    <span className="max-w-sm text-xs text-muted">{description}</span>
                )}
                {children}
            </EmptyState>
        </div>
    );
};

export default TableEmpty;