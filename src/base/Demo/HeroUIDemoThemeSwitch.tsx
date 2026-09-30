// HeroUIThemeSwitch.tsx
import React from "react";
import {Button, useTheme} from "@heroui/react";

export function HeroUIDemoThemeSwitch() {
    const {theme, setTheme} = useTheme();

    return (
        <div className="flex gap-2 flex-wrap">
            <Button className="rounded-[5px]" onClick={() => setTheme("light")}>Light</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("dark")}>Dark</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("uber")}>Uber</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("netflix")}>Netflix</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("spotify")}>Spotify</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("discord")}>Discord</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("lavender")}>Lavender</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("mint")}>Mint</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("sky")}>Sky</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("coinbase")}>Coinbase</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("airbnb")}>Airbnb</Button>
            <Button className="rounded-[5px]" onClick={() => setTheme("rabbit")}>Rabbit</Button>
        </div>
    );
}