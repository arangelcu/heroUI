import React from "react";
import {HeroUISnackbarProvider} from "../HeroUISnackbar/HeroUISnackbar";

/**
 * App-level providers.
 *
 * Notifications go through `HeroUISnackbarProvider` (notistack under the project
 * look). HeroUI's `Toast.Provider` used to be mounted here too; it was removed so the
 * app has a single way of notifying, and its queue (`toastQueue.ts`) with it.
 */
export function HeroUIProvider({children}: { children: React.ReactNode }) {
    return (
        <HeroUISnackbarProvider maxSnack={3}>
            {children}
        </HeroUISnackbarProvider>
    );
}
