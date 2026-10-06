# icore-rcm-fe

Demo de componentes sobre **HeroUI v3 + React 19 + TanStack Table v9**, con una capa
propia de wrappers en `src/HeroUI/`.

## Stack

| Pieza | Versión |
|---|---|
| React / React DOM | ^19.2.8 |
| HeroUI (`@heroui/react`, `@heroui/styles`) | 3.2.6 |
| TanStack Table | ^9.2.6 |
| Tailwind CSS (vía `@tailwindcss/vite`) | 4.3 |
| TypeScript | 6.0 |
| Vite | 8.3 |

Requiere **Node `^20.19 || ^22.13 || >=24`** (lo exigen Vite 8 y ESLint 10).

## Comandos

```bash
npm start        # servidor de desarrollo en http://localhost:7003 (--host)
npm run build    # tsc --noEmit && vite build
npm run preview  # sirve la build
npm run typecheck
npm run lint
```

No existe `npm run dev`: el script de desarrollo se llama **`start`**.

## Estructura

```
src/
  main.tsx                     # monta <StrictMode> + provider de notificaciones + estilos
  App.tsx
  HeroUI/
    HeroUIProvider/            # providers de la app (monta los snackbars)
    HeroUIUtils/               # compartidos: types.ts, tones.ts, rowHighlights.ts, reactSelect.css
    HeroUIStyles/
      HeroUIStyles.css         # importa @heroui/styles + ajustes de la tabla
      HeroUIThemes.tsx         # selector de temas
      HeroUIThemes.css         # presets [data-theme="..."]  (NO es un CSS Module)
    HeroUI<Tipo>/              # wrappers por componente, con su .module.css
    HeroUIReactSelectMultiple/ # combo multiple sobre react-select
    HeroUIReactSelectSingle/   # select simple sobre react-select
    HeroUISnackbar/            # notificaciones sobre notistack
    HeroUITable/               # tabla server-side + filtros, loader, paginación
      TablePagination/         # pie de paginación compartido (TanStack)
    HeroUIReactTable/          # la misma tabla, con markup <table> propio
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
de `useServerTable`, que además descarta respuestas obsoletas por `requestId` y
deja el fallo de la última petición en `error` (la tabla lo pinta en lugar del
estado vacío: una petición rota no es "no hay datos").

El fetcher devuelve **la página y el total**, porque una página sola no puede
decir cuántas hay:

```ts
const queryUsers = async (params: FetchParams): Promise<FetchResult<User>> => ({
  rows: pageOfUsers,
  total: totalOfUsers,
});
```

```tsx
const table = useServerTable<User>(queryUsers);

<HeroUiTable
  columns={userColumns}
  data={table.data}
  isLoading={table.isLoading}
  error={table.error}
  paginationOptions={table.paginationOptions}
  fetchData={table.fetchData}
  enableSelection
  getRowId={(user) => user.id}
/>
```

**Paginación.** El pie (`HeroUITable/TablePagination`) lo conduce el propio
TanStack Table: pide `getPageCount()`, `getRowCount()`, `getCanPreviousPage()` y
`getCanNextPage()`, y navega con `previousPage()` / `nextPage()` /
`setPageIndex()` / `setPageSize()`. Las peticiones salen de `onPaginationChange`
y, como `manualPagination` está activo, el servidor sigue siendo el único que
corta las filas. `HeroUIReactTable` monta **el mismo** pie y la misma API, así que
las dos tablas paginan —y se ven— igual.

**Filtros.** Las dos tablas comparten también la barra `TableFilters` y el mismo
`filtersConfig` (`enableFilterName`, `enableFilterRole`, `enableFilterStatus`,
`enableFiltersBtn`, `enableRefreshBtn`, `start`, `end`, `startIcon`,
`namePlaceholder`). En `HeroUiTable` la barra va siempre delante de la tarjeta; en
`HeroUIReactTable` se monta con `filtersConfig` y, sin ella, el consumidor puede
renderizar su propia UI y pasar los valores por `filters`. Cualquier cambio de
filtro vuelve a la primera página y sale como una petición nueva.

**Estados.** Comparten también el vacío y el de carga —`TableEmpty` (icono, título
y descripción) y `TableLoader`— más el de error. La prioridad es error → carga →
vacío, y cada uno se puede sustituir con `renderError` / `renderLoading` /
`renderEmpty`.

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

El selector (`HeroUIThemes.tsx`) expone los presets que el proyecto usa:
**`light`, `sms` y `rcm`**. `HeroUIThemes.css` define además `sky`, `lavender`,
`mint`, `netflix`, `uber`, `spotify`, `coinbase`, `airbnb`, `discord`, `rabbit` y
`rose`, pero **sin botón que los active**: para usarlos hay que añadirlos a la
lista `THEMES`. Sus variantes `.dark` tampoco se alcanzan hoy —`useTheme` escribe
el mismo valor en `class` y en `data-theme`, y `[data-theme="rcm"].dark` exige
las dos a la vez—, así que el modo oscuro de los presets queda pendiente.

Los colores deben salir de los tokens de HeroUI (`--surface`, `--accent`,
`--field-border`…). Evita colores fijos como `white` o la paleta por defecto de
Tailwind: anulan el sistema de temas. (`HeroUICard` todavía usa `bg-white`; queda
como deuda conocida mientras no se use el tema oscuro.)

## Notificaciones (`HeroUISnackbar`)

Las notificaciones van con **notistack** y viven en `HeroUIUtils/../HeroUISnackbar/`:

| Archivo | Qué es |
|---|---|
| `HeroUISnackbar.tsx` | `HeroUISnackbarProvider` (monta notistack) y el contenido de cada variante |
| `snackbarQueue.tsx` | `snackbar()`, `closeSnackbar` y `useSnackbar` — lo que importan los consumidores |

```tsx
import {snackbar} from "../HeroUISnackbar/snackbarQueue";

snackbar({title: "Success", description: "Your changes have been saved.", tone: "success"});

// Con acción y sin autocierre, lo que permite un snackbar y no un toast simple:
snackbar({title: "Item deleted", persist: true, action: {label: "Undo", onPress: undo}});
```

Salen **arriba a la derecha**, que es donde aparecía el toast de HeroUI al que sustituyen
(`placement="top end"`). Se cambia con `anchorOrigin` en `HeroUISnackbarProvider`;
notistack deriva de ahí el orden del apilado y la dirección del deslizamiento.

**Se eligió notistack 3.x** porque es la primera línea que **no depende de MUI** (usa
`goober`): no añade un segundo sistema de diseño junto a HeroUI, y su rango de peers
acepta React 19. La v1 y la v2 sí se construían sobre `@mui/material`.

Cosas que conviene saber de la integración:

- **El contenido custom debe reenviar la `ref`** (`forwardRef`). notistack la clona en el
  elemento para medir la transición y, si no acaba en un nodo del DOM, lanza
  `notistack - Custom snackbar is not refForwarding` y **no muestra nada**.
- **El `z-index` hay que subirlo a mano.** notistack deja su contenedor en `1400`, por
  debajo de los overlays de HeroUI (`--z-index-overlay: 100000`), así que un snackbar
  lanzado desde un modal quedaba tapado. Se sube a `--z-index-toast`.
- Notistack **no trae botón de cerrar** en su contenido (solo icono, mensaje y acción):
  el de `HeroUISnackbarContent` es propio.
- Los tonos usan el vocabulario del proyecto (`danger`, no `error`); la traducción a las
  variantes de notistack está en `snackbarQueue.tsx`.

Se quitó el `Toast.Provider` de HeroUI junto con su `toastQueue.ts` para que la app tenga
**una sola** forma de notificar.
