import React from "react";
import {Toast, ToastQueue} from "@heroui/react";

// Cola global — creada una sola vez
const toastQueue = new ToastQueue({
    maxVisibleToasts: 3,
    // Workaround para el jank en Edge:
    // wrapUpdate: (fn) => fn(),
});

export function HeroUIProvider({children}: { children: React.ReactNode }) {
    return (
        <>
            <Toast.Provider placement="top end" queue={toastQueue}/>
            {children}
        </>
    );
}

export {toastQueue};