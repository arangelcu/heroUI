import React from "react";
import {closeSnackbar as closeSnackbarNotistack, enqueueSnackbar, useSnackbar} from "notistack";
import {HeroUISnackbarMessage, type HeroUISnackbarTone} from "./HeroUISnackbar";
import styles from "./HeroUISnackbar.module.css";

export {useSnackbar};
export type {HeroUISnackbarTone};

/**
 * Imperative API of the snackbars.
 *
 * Lives apart from `HeroUISnackbar.tsx` on purpose: the Fast Refresh plugin cannot
 * refresh a module that exports a component **and** plain functions, and the provider
 * is a component. Call sites only need this module.
 */

/** Project tone -> notistack variant. notistack calls the red one `error`. */
const TONE_TO_VARIANT: Record<HeroUISnackbarTone, "default" | "info" | "success" | "warning" | "error"> = {
    default: "default",
    info: "info",
    success: "success",
    warning: "warning",
    danger: "error",
};

/** Icon used per tone when the caller does not pass one (same set the demo buttons use). */
const DEFAULT_ICONS: Record<HeroUISnackbarTone, string> = {
    default: "fa6-solid:circle-info",
    info: "fa6-solid:circle-info",
    success: "fa6-solid:circle-check",
    warning: "fa6-solid:triangle-exclamation",
    danger: "fa6-solid:circle-xmark",
};

/** Options of {@link snackbar}. */
export interface HeroUISnackbarOptions {
    /** Message heading. */
    title: React.ReactNode;
    /** Optional second line with the detail. */
    description?: React.ReactNode;
    /**
     * Colour of the snackbar, using the project tones.
     * @default "default"
     */
    tone?: HeroUISnackbarTone;
    /** Iconify name for the leading icon. Defaults to the one of the tone. */
    icon?: string;
    /**
     * Optional single action, the one thing a Material snackbar allows that a plain toast
     * does not. Material's rule applies: one action, and it must not be "Dismiss" or
     * "Cancel" (the close button already covers that).
     */
    action?: { label: string; onPress: () => void };
    /**
     * Auto-dismiss delay in milliseconds, overriding the provider value.
     * `null` keeps it open until dismissed.
     */
    autoHideDuration?: number | null;
    /** Keeps the snackbar on screen until the user closes it. Defaults to `false`. */
    persist?: boolean;
}

/**
 * Shows a snackbar.
 *
 * Keeps the ergonomics the project had with HeroUI's queue
 * (`toastQueue.add({title, description, variant})`) and translates it to notistack, so
 * call sites neither import notistack nor know about its variants.
 *
 * ```tsx
 * snackbar({title: "Success", description: "Your changes have been saved.", tone: "success"});
 * snackbar({title: "Item deleted", persist: true, action: {label: "Undo", onPress: undo}});
 * ```
 *
 * @returns The snackbar key, to close it later with `closeSnackbar(key)`.
 */
export function snackbar(options: HeroUISnackbarOptions) {
    const {title, description, tone = "default", icon, action, autoHideDuration, persist} = options;

    return enqueueSnackbar({
        message: (
            <HeroUISnackbarMessage
                title={title}
                description={description}
                icon={icon ?? DEFAULT_ICONS[tone]}
            />
        ),
        variant: TONE_TO_VARIANT[tone],
        action: action ? (
            <button type="button" className={styles.actionButton} onClick={action.onPress}>
                {action.label}
            </button>
        ) : undefined,
        // Passed through untouched: notistack reads `null` as "no auto-hide" and
        // `undefined` as "use the provider default". Coercing with `?? undefined`
        // turned the documented `null` into the 4s default.
        autoHideDuration,
        persist,
    });
}

/**
 * Closes a snackbar by key, or all of them when no key is given.
 *
 * Re-exported so consumers do not import notistack directly.
 */
export const closeSnackbar = closeSnackbarNotistack;
