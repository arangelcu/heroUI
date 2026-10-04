# icore-rcm-fe

Demo de componentes sobre **HeroUI v3 + React 19 + TanStack Table v9**, con una capa
propia de wrappers en `src/HeroUI/`.

## Stack

| Pieza | Versión |
|---|---|
| React / React DOM | 19.3 |
| HeroUI (`@heroui/react`, `@heroui/styles`) | 3.2.6 |
| TanStack Table | 9.2.4 |
| Tailwind CSS (vía `@tailwindcss/vite`) | 4.3 |
| TypeScript | 6.0 |
| Vite | 8.3 |

Requiere **Node `^20.19 || ^22.13 || >=24`** (lo exigen Vite 8 y ESLint 10).

## Comandos

```bash
npm start        # servidor de desarrollo en http://localhost:7002 (--host)
npm run build    # tsc --noEmit && vite build
npm run preview  # sirve la build
npm run typecheck
npm run lint
```

No existe `npm run dev`: el script de desarrollo se llama **`start`**.

## Estructura

```
src/
  main.tsx                     # monta <StrictMode> + provider de toasts + estilos
  App.tsx
  HeroUI/
    HeroUIProvider/            # Toast.Provider + cola global (toastQueue.ts)
    HeroUIStyles/
      HeroUIStyles.css         # importa @heroui/styles + ajustes de la tabla
      HeroUIThemes.tsx         # selector de temas
      HeroUIThemes.Module.css  # presets [data-theme="..."]  (NO es un CSS Module)
    HeroUI<Tipo>/              # wrappers por componente, con su .module.css
    HeroUITable/               # tabla server-side + filtros, loader, paginación
    Demo/                      # demo que compone todo
      useServerTable.ts        # estado de tabla por instancia
```

## Componentes

Cada wrapper sigue el mismo contrato:

- `label` para la etiqueta visible; **`ariaLabel` solo se usa como respaldo cuando
  no hay `label`**, de forma que la etiqueta visible quede asociada al control.
- `tooltip` acepta `string` o `{text, placement, showArrow, delay}`.
- Los mensajes de "obligatorio" aparecen **tras el primer `onBlur`**, no al montar.

### Tabla (`HeroUiTable`)

Server-side: paginación, orden, filtros y selección se delegan al consumidor
mediante `fetchData(params)`. El estado de cada tabla vive en su propia instancia
de `useServerTable`, que además descarta respuestas obsoletas por `requestId`.

```tsx
const table = useServerTable<User>(queryUsers);

<HeroUiTable
  columns={userColumns}
  data={table.data}
  isLoading={table.isLoading}
  paginationOptions={table.paginationOptions}
  fetchData={table.fetchData}
  enableSelection
  getRowId={(user) => user.id}
/>
```

## Temas

Los presets se definen como variables CSS bajo `[data-theme="nombre"]` y se activan
con `useTheme` de HeroUI, que escribe **el mismo valor** en `class` y en
`data-theme` del `<html>`.

Disponibles: `light`, `sky`, `lavender`, `mint`, `netflix`, `uber`, `spotify`,
`coinbase`, `airbnb`, `discord`, `rabbit`, `rose`, `sms`, `rcm` y `dark`.

Los colores deben salir de los tokens de HeroUI (`--surface`, `--accent`,
`--field-border`…). Evita colores fijos como `white` o la paleta por defecto de
Tailwind: anulan el sistema de temas.
