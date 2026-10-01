import React from "react";
import {Button, useTheme} from "@heroui/react";

export function HeroUIThemes() {
    const {theme, setTheme} = useTheme();

    return (
        <div className="flex gap-2 flex-wrap justify-center">
            <Button className="rounded-[5px]" onClick={() => setTheme("light")}>Light</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("dark")}>Dark</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("sms")}>SMS</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("rcm")}>RCM</Button>
        </div>
    );
}