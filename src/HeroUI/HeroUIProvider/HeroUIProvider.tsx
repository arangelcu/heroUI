import React from "react";
import {Toast} from "@heroui/react";
import {toastQueue} from "./toastQueue";

export function HeroUIProvider({children}: { children: React.ReactNode }) {
    return (
        <>
            <Toast.Provider placement="top end" queue={toastQueue}/>
            {children}
        </>
    );
}
