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
    HeroUIUtils/               # compartidos: types.ts, tones.ts, reactSelect.css
    HeroUIStyles/
      HeroUIStyles.css         # importa @heroui/styles + ajustes de la tabla
      HeroUIThemes.tsx         # selector de temas
      HeroUIThemes.css         # presets [data-theme="..."]  (NO es un CSS Module)
    HeroUI<Tipo>/              # wrappers por componente, con su .module.css
    HeroUIReactSelectMultiple/ # combo multiple sobre react-select
    HeroUIReactSelectSingle/   # select simple sobre react-select
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

### ComboBox / Select

Cinco variantes. Las dos primeras se apoyan en HeroUI; las tres últimas en
`react-select`. Todas comparten el mismo contrato: `label` + `ariaLabel` de respaldo,
`tooltip`, búsqueda asíncrona vía `onInputChange` y validación de obligatorio tras la
primera interacción.

| Componente | Base | Selección | Valor | Etiquetas |
|---|---|---|---|---|
| `HeroUIComboBox` | HeroUI | una | `value: string` | — |
| `HeroUIComboBoxMultiple` | HeroUI | varias | `value: readonly string[]` | fuera del campo |
| `HeroUIReactSelectMultiple` | `react-select` | varias | `value: readonly string[]` | dentro del campo |
| `HeroUIReactSelectSingle` | `react-select` | una | `value: string` | — |
| `HeroUISelect` | HeroUI | una | `value: string` | — |

**`HeroUIComboBoxMultiple`** pinta las etiquetas en su propia fila **bajo el
campo**: meterlas dentro de un campo de 195px obliga a que ocupen todo el ancho y
el buscador acaba debajo, que se ve peor.

**`HeroUIReactSelectMultiple`** y **`HeroUIReactSelectSingle`** se apoyan en
`react-select` v5 precisamente porque sí resuelven las etiquetas **dentro** del
control. Se montan con `unstyled`, de modo que todo el aspecto lo ponen los tokens del
tema (`HeroUIUtils/reactSelect.css`, compartido por ambos), y mapean
`getOptionValue`/`getOptionLabel` a los campos `id`/`label` del proyecto: sin ese
mapeo react-select lee `option.value` (inexistente), considera todas las opciones la
misma y el menú se queda vacío tras la primera elección.

En el de selección simple, `isSearchable` (por defecto `true`) permite escribir para
filtrar; con `false` funciona como desplegable y el placeholder pasa a
`"Select an option"`. Ojo: **sin buscador no hay búsqueda asíncrona posible**, porque
no hay texto que escribir, así que `options` tiene que traer la lista completa.
`isClearable` (por defecto `true`) añade la `x` para dejar el campo vacío.

Con `clearInputOnSelect` (por defecto `true`) el buscador se vacía tras cada
elección —hay que volver a escribir para buscar otra cosa— pero **la lista se
conserva**, así que se puede seguir seleccionando sin escribir nada. El componente
fija la última lista de opciones recibida para que no se pierda aunque el padre
vacíe las suyas al quedar la consulta corta.

```tsx
const [selected, setSelected] = useState<string[]>([]);
const [uno, setUno] = useState("");

<HeroUIComboBoxMultiple
  label="Usuarios"
  options={options}
  value={selected}
  onChange={setSelected}
  onInputChange={buscar}
  isRequired
/>

<HeroUIReactSelectMultiple
  label="Usuarios"
  options={options}
  value={selected}
  onChange={setSelected}
  onInputChange={buscar}
  isRequired
/>

<HeroUIReactSelectSingle
  label="Responsable"
  options={options}
  value={uno}
  onChange={setUno}
  onInputChange={buscar}
  isRequired
/>
```

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

#### Estilo por fila según su dato

La tabla expone dos props, y se pueden combinar:

| Prop | Para qué |
|---|---|
| `getRowStyle(row)` | Estilos en línea, para valores resueltos en tiempo de ejecución |
| `getRowClassName(row)` | Clases CSS (Tailwind). Admite `hover:` |

Encima de ellas, `HeroUIUtils/rowHighlights.ts` añade una capa **declarativa**: la paleta
se define **una vez** con nombres de tono (`danger`, `warning`, `accent`, `success`) y
cada tabla solo mapea su dato a un tono. Cambiar un color es cambiar una entrada de la
paleta, y todas las tablas que la compartan siguen.

```tsx
// 1. La paleta. Este es el ÚNICO sitio con colores.
const ROW_TONES = {
  danger: toneHighlight("danger"),    // mezcla de --danger con --surface + borde --danger
  warning: toneHighlight("warning"),  // --warning es más claro, así que mezcla más
  accent: toneHighlight("accent"),
};

// 2. Qué tono le toca a cada valor del dato.
const STATUS_TONES: Record<User["status"], keyof typeof ROW_TONES | undefined> = {
  Active: undefined,        // sin resaltado, aspecto normal
  Inactive: "danger",
  "On Leave": "warning",
};

// 3. La regla, construida una vez y compartida por todas las tablas.
const highlightByStatus = createRowHighlighter<User>({
  tones: ROW_TONES,
  toneFor: (user) => STATUS_TONES[user.status],
});

<HeroUiTable getRowStyle={highlightByStatus} ... />
```

Para la ruta por clases, `createRowClassifier` es el equivalente:

```tsx
const classifyByRole = createRowClassifier<User>({
  classes: {
    accent: "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_22%,var(--surface))]",
  },
  toneFor: (user) => (user.role === "CTO" ? "accent" : undefined),
});

<HeroUiTable getRowClassName={classifyByRole} ... />
```

Tres detalles que conviene saber:

- **Las celdas son transparentes** (`.table__cell` en `HeroUIStyles.css`) a propósito:
  HeroUI pinta cada `<td>` con `bg-surface`, y ese fondo queda **encima** de la fila y
  oculta cualquier color puesto en el `<tr>`. Con las celdas transparentes pinta la
  fila y el estilo por fila se ve. El aspecto normal no cambia.
- Los tokens `--*-soft` son un 15 % de alfa (pensados para chips pequeños): en una fila
  entera apenas se aprecian. Por eso `toneHighlight` mezcla con `--surface` en vez de
  usar el token directo, con una intensidad distinta por tono (los claros necesitan más).
  Al ser opaco, se lee igual sobre cualquier fondo y en cualquier tema.
- **No mezcles las dos rutas en la misma tabla para las mismas filas**: el estilo en
  línea gana siempre, así que la clase quedaría oculta. En el demo las tres tablas usan
  la misma regla en línea a propósito.

`getRowStyle` usa estilos en línea, que ganan siempre, así que esas filas **conservan su
color al pasar el ratón**. Si quieres que el hover las oscurezca, usa la ruta por clases
con una variante `hover:bg-...`.

## Temas

Los presets se definen como variables CSS bajo `[data-theme="nombre"]` y se activan
con `useTheme` de HeroUI, que escribe **el mismo valor** en `class` y en
`data-theme` del `<html>`.

Disponibles: `light`, `sky`, `lavender`, `mint`, `netflix`, `uber`, `spotify`,
`coinbase`, `airbnb`, `discord`, `rabbit`, `rose`, `sms`, `rcm` y `dark`.

Los colores deben salir de los tokens de HeroUI (`--surface`, `--accent`,
`--field-border`…). Evita colores fijos como `white` o la paleta por defecto de
Tailwind: anulan el sistema de temas.
