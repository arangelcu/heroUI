import React from "react";
import {Icon} from "@iconify/react";
import {SnackbarProvider, useSnackbar, type CustomContentProps} from "notistack";
import styles from "./HeroUISnackbar.module.css";

/** Tones accepted by the snackbars. Mirrors the project vocabulary (`danger`, not `error`). */
export type HeroUISnackbarTone = "default" | "info" | "success" | "warning" | "danger";

/**
 * notistack variant -> project tone.
 *
 * notistack names the red variant `error`; the rest of the project calls it `danger`
 * (see `HeroUIUtils/tones.ts`), so the class applied here is the `danger` one. Kept
 * private: the public mapping lives in `snackbarQueue.ts`, which is the module call
 * sites import.
 */
const VARIANT_TO_TONE: Record<string, HeroUISnackbarTone> = {
    default: "default",
    info: "info",
    success: "success",
    warning: "warning",
    error: "danger",
};

/**
 * Body of a snackbar: icon, title and optional description.
 *
 * It is what `snackbar()` puts in notistack's `message`, so a snackbar enqueued
 * through the raw `enqueueSnackbar` API can reuse it as well.
 */
export function HeroUISnackbarMessage({
                                          title,
                                          description,
                                          icon = "fa6-solid:circle-info",
                                      }: {
    title: React.ReactNode;
    description?: React.ReactNode;
    /** Iconify name for the leading icon. */
    icon?: string;
}) {
    return (
        <div className={styles.content}>
            <Icon className={`${styles.icon} size-4`} icon={icon}/>
            <div className={styles.text}>
                <p className={styles.title}>{title}</p>
                {description ? <p className={styles.description}>{description}</p> : null}
            </div>
        </div>
    );
}

/**
 * Content component handed to notistack for every variant.
 *
 * notistack's own content renders `icon + message + action` and **no close button**, so
 * the close control is added here. `useSnackbar` works inside this component because
 * notistack renders the snackbars within its own context provider.
 *
 * ### Why `forwardRef` is mandatory here
 *
 * notistack clones this element to inject a `ref` and then reads `nodeRef.current` to
 * drive its enter/exit transition. If the ref is not attached to a DOM node it throws
 * `notistack - Custom snackbar is not refForwarding` and no snackbar ever shows. Its own
 * `MaterialDesignContent` forwards the ref for the same reason.
 */
const HeroUISnackbarContent = React.forwardRef<HTMLDivElement, CustomContentProps>(
    function HeroUISnackbarContent({id, message, variant, action}, forwardedRef) {
        const {closeSnackbar: close} = useSnackbar();
        const tone = VARIANT_TO_TONE[String(variant)] ?? "default";

        // notistack allows `action` to be a function of the key.
        const resolvedAction = typeof action === "function" ? action(id) : action;

        return (
            <div ref={forwardedRef} className={`${styles.snackbar} ${styles[tone]}`} role="alert">
                {message}

                {resolvedAction ? <div className={styles.action}>{resolvedAction}</div> : null}

                <button
                    type="button"
                    aria-label="Close notification"
                    className={styles.close}
                    onClick={() => close(id)}
                >
                    <Icon className="size-3" icon="fa6-solid:xmark"/>
                </button>
            </div>
        );
    }
);

/** Props of `HeroUISnackbarProvider`. */
export interface HeroUISnackbarProviderProps {
    children: React.ReactNode;
    /**
     * Maximum number of snackbars stacked at once.
     * @default 3
     */
    maxSnack?: number;
    /**
     * Where the stack sits.
     *
     * Defaults to the **top-right** corner, which is where the HeroUI toast this replaced
     * used to appear (`placement="top end"`). notistack derives both the stacking order
     * and the slide direction from this value, so moving it needs no extra work.
     * @default { vertical: "top", horizontal: "right" }
     */
    anchorOrigin?: { vertical: "top" | "bottom"; horizontal: "left" | "center" | "right" };
    /**
     * Auto-dismiss delay in milliseconds. `null` keeps them open until dismissed.
     * @default 4000
     */
    autoHideDuration?: number | null;
    /**
     * Tighter margins, recommended on mobile.
     * @default false
     */
    dense?: boolean;
}

/**
 * `HeroUISnackbarProvider`
 *
 * Mounts notistack and makes every snackbar render with the project look.
 *
 * ### Why notistack and not the HeroUI toast
 *
 * Both cover the same need (a brief, stackable message), so having the two mounted would
 * mean two ways of notifying in the same app. This wrapper is the single one: it replaced
 * `Toast.Provider`, and keeps an ergonomic API on top (`snackbar()` from
 * `snackbarQueue.ts`) so call sites never deal with notistack directly.
 *
 * ### Versions
 *
 * notistack 3.x is the first line that **does not depend on MUI** (it uses `goober`), so
 * it adds no second design system next to HeroUI, and its peer range accepts React 19.
 *
 * ### Example
 * ```tsx
 * <HeroUISnackbarProvider maxSnack={3}>
 *   <App/>
 * </HeroUISnackbarProvider>
 * ```
 */
export function HeroUISnackbarProvider({
                                           children,
                                           maxSnack = 3,
                                           anchorOrigin = {vertical: "top", horizontal: "right"},
                                           autoHideDuration = 4000,
                                           dense = false,
                                       }: HeroUISnackbarProviderProps) {
    return (
        <SnackbarProvider
            maxSnack={maxSnack}
            anchorOrigin={anchorOrigin}
            autoHideDuration={autoHideDuration}
            dense={dense}
            /*
             * `.container` is what raises the container above the HeroUI overlays:
             * notistack's own z-index (1400) sits below them, so a snackbar fired from a
             * modal would be hidden behind the backdrop.
             */
            classes={{containerRoot: styles.container}}
            Components={{
                default: HeroUISnackbarContent,
                info: HeroUISnackbarContent,
                success: HeroUISnackbarContent,
                warning: HeroUISnackbarContent,
                error: HeroUISnackbarContent,
            }}
        >
            {children}
        </SnackbarProvider>
    );
}
