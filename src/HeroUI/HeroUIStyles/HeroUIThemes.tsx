import React from "react";
import {Button, useTheme} from "@heroui/react";

/**
 * Presets defined in `HeroUIThemes.css`.
 *
 * They must match the `[data-theme="..."]` blocks of that file. The list used to have
 * only three entries (light/sms/rcm) while twelve other presets shipped in the bundle
 * with no way of activating them, and `DARK_THEME` was dead code because no button ever
 * set it. `light` is not a block in the CSS: it is the base theme, so selecting it just
 * drops the preset.
 */
const THEMES = [
    "light",
    "sms",
    "rcm",
    "dark",
] as const;

/**
 * `HeroUIThemes`
 *
 * Theme switcher: one button per preset declared in `THEMES`, which applies the
 * matching `data-theme` to the document through `useTheme`.
 */
export function HeroUIThemes() {
    // `theme` is the stored intention ("dark" or the preset name);
    // `resolvedTheme` is what ends up applied to the DOM.
    const {theme, resolvedTheme, setTheme} = useTheme("rcm");

    const active = resolvedTheme ?? theme;

    return (
        <div className="flex flex-col gap-3 items-center">
            <div
                role="group"
                aria-label="Tema de la interfaz"
                className="flex gap-2 flex-wrap justify-center"
            >
                {THEMES.map((name) => {
                    const isActive = active === name;
                    return (
                        <Button
                            key={name}
                            className="rounded-[5px]"
                            variant={isActive ? "primary" : "ghost"}
                            aria-pressed={isActive}
                            onPress={() => setTheme(name)}
                        >
                            {name.toUpperCase()}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
