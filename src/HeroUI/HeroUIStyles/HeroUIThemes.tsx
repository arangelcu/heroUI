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
    "sky",
    "lavender",
    "mint",
    "netflix",
    "uber",
    "spotify",
    "coinbase",
    "airbnb",
    "discord",
    "rabbit",
    "rose",
    "sms",
    "rcm",
] as const;

/** `data-theme` value that activates dark mode. */
const DARK_THEME = "dark";

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

    const isDark = theme === DARK_THEME;
    const active = resolvedTheme ?? theme;

    return (
        <div className="flex flex-col gap-3 items-center">
            <div
                role="group"
                aria-label="Tema de la interfaz"
                className="flex gap-2 flex-wrap justify-center"
            >
                {THEMES.map((name) => {
                    const isActive = !isDark && active === name;
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

                {/*
                 * Dark is a separate mode rather than another preset: it is the `.dark`
                 * variant of whichever preset is active, and `useTheme` stores the
                 * intention as "dark".
                 */}
                <Button
                    className="rounded-[5px]"
                    variant={isDark ? "primary" : "ghost"}
                    aria-pressed={isDark}
                    onPress={() => setTheme(DARK_THEME)}
                >
                    {DARK_THEME.toUpperCase()}
                </Button>
            </div>
        </div>
    );
}
