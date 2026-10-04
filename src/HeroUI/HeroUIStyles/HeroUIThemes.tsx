import React from "react";
import {Button, useTheme} from "@heroui/react";

/**
 * Presets definidos en `HeroUIThemes.module.css`.
 *
 * Deben coincidir con los bloques `[data-theme="..."]` de ese archivo: antes solo
 * se ofrecian tres botones (light/sms/rcm) y los otros doce presets viajaban en el
 * bundle sin ninguna forma de activarlos.
 */
const THEMES = [
    "light",
    "sms",
    "rcm",
] as const;

const DARK_THEME = "dark";

export function HeroUIThemes() {
    // `theme` es la intencion guardada ("dark" o el nombre del preset);
    // `resolvedTheme` es lo que acaba aplicado al DOM.
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
            </div>
        </div>
    );
}
