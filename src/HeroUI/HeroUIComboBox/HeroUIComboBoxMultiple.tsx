import React, {useCallback, useMemo, useState} from "react";
import {Chip, ComboBox, FieldError, Input, Label, ListBox, Spinner, Tooltip} from "@heroui/react";
import {Icon} from "@iconify/react";
import type {HeroUITooltipConfig} from "../HeroUIUtils/types";
import {HeroUIComboBoxOption} from "./HeroUIComboBox";

export type {HeroUIComboBoxOption};

/** Donde se colocan las etiquetas de lo seleccionado. */
export type HeroUIComboBoxChipsPlacement = "below" | "above";

interface HeroUIComboBoxMultipleProps {
    /** Aria label for accessibility. Defaults to `"ComboBox multiple"`. */
    ariaLabel?: string;
    /** Visible label above the ComboBox. Optional. */
    label?: React.ReactNode;
    /** List of options to render inside the popover. */
    options: HeroUIComboBoxOption[];
    /**
     * Currently selected option ids.
     *
     * Se normaliza a un array nuevo al emitir, para que el padre pueda comparar
     * por referencia.
     */
    value?: readonly string[];
    /** Fired with the full list of selected ids whenever the selection changes. */
    onChange?: (value: string[]) => void;
    /** Current input text. Controlled by the parent for async search. */
    inputValue?: string;
    /**
     * Fired on every input keystroke.
     * The parent should use it to trigger the async server-side search.
     */
    onInputChange?: (value: string) => void;
    /** Input placeholder. Defaults to `"Type to search..."`. */
    placeholder?: string;
    /** ComboBox width. Defaults to `"195px"`, igual que el resto de campos. */
    width?: string | number;
    /** Additional CSS classes for the ComboBox. */
    className?: string;
    /** Additional CSS classes for the selected-items row. */
    chipsClassName?: string;
    /**
     * Donde se pintan las etiquetas de lo seleccionado.
     *
     * Van **fuera** del campo, en su propia fila: meterlas dentro de un campo de
     * 195px obliga a que ocupen el ancho y el buscador acaba debajo, que se ve peor.
     * @default "below"
     */
    chipsPlacement?: HeroUIComboBoxChipsPlacement;
    /** Optional tooltip. Accepts a string or a full config object. */
    tooltip?: string | HeroUITooltipConfig;
    /** Disables the ComboBox. Defaults to `false`. */
    isDisabled?: boolean;
    /** Shows a spinner while options are loading. Defaults to `false`. */
    isLoading?: boolean;
    /** Text shown when there are no results. Defaults to `"No results found"`. */
    noResultsText?: string;
    /**
     * Shows an `x` on each chip to remove that specific option.
     * @default true
     */
    isChipRemovable?: boolean;
    /**
     * Marks the field as required.
     * When `true` and no option is selected, `isInvalid` becomes `true`
     * and the `FieldError` is displayed after the first interaction.
     * @default false
     */
    isRequired?: boolean;
    /**
     * Custom error message shown when the field is required and empty.
     * @default "This field is required"
     */
    requiredMessage?: string;
}

/**
 * `HeroUIComboBoxMultiple`
 *
 * ComboBox de **seleccion multiple** sobre HeroUI v3, hermano de `HeroUIComboBox`.
 *
 * ### Como se muestran los seleccionados
 *
 * Las etiquetas van **en su propia fila, fuera del campo** (`chipsPlacement`), no
 * dentro. Se probo a meterlas dentro y con un campo de 195px no es viable: las
 * etiquetas ocupan todo el ancho y el buscador tiene que bajar a otra linea, con lo
 * que el campo se ve mas alto y desordenado. El campo queda identico al del combo
 * simple y debajo aparecen las etiquetas.
 *
 * ### Comportamiento
 * - Seleccion multiple: elegir una opcion la **suma**; volver a pulsarla la quita.
 * - `ListBox` con `selectionMode="multiple"` muestra un check por opcion.
 * - La lista **permanece abierta** tras elegir, para poder marcar varias seguidas
 *   (se cierra con `Escape` o pulsando fuera).
 * - Cada etiqueta lleva una `x` para quitarla sin abrir el popup.
 * - El buscador es asincrono: el padre recibe `onInputChange` y sirve `options`.
 * - Validacion de obligatorio como el resto de campos: el error aparece tras el
 *   primer `onBlur`, no al montar.
 *
 * ### Estado
 *
 * Usa la API vigente (`value` + `onChange`, de `ValueBase`). `selectedKey` y
 * `onSelectionChange` estan **deprecados** en react-stately. Nota: el
 * `HeroUIComboBox` de seleccion simple todavia usa los deprecados.
 *
 * ### Ejemplo
 * ```tsx
 * const [selected, setSelected] = useState<string[]>([]);
 *
 * <HeroUIComboBoxMultiple
 *   label="Equipos"
 *   options={options}
 *   value={selected}
 *   onChange={setSelected}
 *   onInputChange={buscar}
 *   isRequired
 *   requiredMessage="Elige al menos un equipo"
 *   tooltip="Puedes seleccionar varios"
 * />
 * ```
 */
const HeroUIComboBoxMultiple: React.FC<HeroUIComboBoxMultipleProps> = ({
                                                                           ariaLabel = "ComboBox multiple",
                                                                           label,
                                                                           options,
                                                                           value,
                                                                           onChange,
                                                                           inputValue,
                                                                           onInputChange,
                                                                           placeholder = "Type to search...",
                                                                           width = "195px",
                                                                           className = "",
                                                                           chipsClassName = "",
                                                                           chipsPlacement = "below",
                                                                           tooltip,
                                                                           isDisabled = false,
                                                                           isLoading = false,
                                                                           noResultsText = "No results found",
                                                                           isChipRemovable = true,
                                                                           isRequired = false,
                                                                           requiredMessage = "This field is required",
                                                                       }) => {
    /** El error de obligatorio se muestra tras el primer onBlur, no al montar. */
    const [isTouched, setIsTouched] = useState(false);

    /** Ids seleccionados normalizados a array mutable. */
    const selectedIds = useMemo(() => (value ? [...value] : []), [value]);

    const isInvalid = isTouched && isRequired && selectedIds.length === 0;

    /** Las `Key` de react-aria son `string | number`: se comparan como string. */
    const selectedKeys = useMemo(
        () => selectedIds.map((id) => String(id)),
        [selectedIds]
    );

    /** Para resolver la etiqueta de cada id a partir de las opciones cargadas. */
    const optionsById = useMemo(() => {
        const map = new Map<string, HeroUIComboBoxOption>();
        options.forEach((opt) => map.set(String(opt.id), opt));
        return map;
    }, [options]);

    /**
     * Etiquetas a pintar, resueltas desde `value`.
     *
     * No se usa `ComboBox.Value` porque su render prop solo puede dibujar dentro
     * del campo; como las etiquetas van fuera, se resuelven aqui.
     */
    const chips = useMemo(
        () => selectedIds.map((id) => ({
            id: String(id),
            text: optionsById.get(String(id))?.label ?? String(id),
        })),
        [selectedIds, optionsById]
    );

    /**
     * Emite siempre un array nuevo, para que el padre pueda comparar por
     * referencia sin miedo a mutaciones.
     */
    const emit = useCallback((keys: Iterable<React.Key>) => {
        onChange?.([...keys].map(String));
    }, [onChange]);

    /** Quita una opcion desde la `x` del chip. */
    const removeOption = useCallback((id: string) => {
        emit(selectedKeys.filter((key) => key !== id));
    }, [emit, selectedKeys]);

    const chipsRow = chips.length > 0 && (
        <div
            className={`flex min-w-0 flex-wrap items-center gap-1 text-left ${chipsPlacement === "below" ? "mt-1" : "mb-1"} ${chipsClassName}`.trim()}
        >
            {chips.map(({id, text}) => (
                <Chip
                    key={id}
                    size="sm"
                    variant="soft"
                    className="max-w-full !h-5 !px-1.5 !text-[11px]"
                >
                    <span className="max-w-[90px] truncate">{text}</span>
                    {isChipRemovable && (
                        <button
                            type="button"
                            aria-label={`Quitar ${text}`}
                            className="ms-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-full text-muted hover:text-foreground"
                            onClick={(event) => {
                                // Sin esto el clic llegaria al input y abriria el popup.
                                event.stopPropagation();
                                event.preventDefault();
                                removeOption(id);
                            }}
                        >
                            <Icon className="size-2.5" icon="fa6-solid:xmark"/>
                        </button>
                    )}
                </Chip>
            ))}
        </div>
    );

    const field = (
        /* El contenedor toma el MISMO ancho que el campo via variable CSS, para que
           la fila de etiquetas haga wrap a esos 195px. Con `max-w-full` solo, el
           limite era el de la columna que lo contiene (211px en el demo) y los chips
           se estiraban mas alla del campo. `w-fit` evita que el wrapper se estire
           cuando hay mas sitio del necesario. */
        <div
            className="w-fit"
            style={{width, maxWidth: "100%", ["--combo-width" as string]: typeof width === "number" ? `${width}px` : width}}
        >
            <ComboBox
                aria-label={label ? undefined : ariaLabel}
                className={`rounded-[5px] w-full ${className}`.trim()}
                style={{width: "100%"}}
                selectionMode="multiple"
                value={selectedKeys}
                onChange={emit}
                inputValue={inputValue}
                onInputChange={(query) => onInputChange?.(query)}
                isDisabled={isDisabled}
                isRequired={isRequired}
                isInvalid={isInvalid}
                validationBehavior="aria"
                onBlur={() => setIsTouched(true)}
                menuTrigger="focus"
                allowsEmptyCollection
            >
                {label && <Label>{label}</Label>}

                <ComboBox.InputGroup className="rounded-[5px]">
                    <Input className="rounded-[5px]" placeholder={placeholder}/>

                    {isLoading && <Spinner className="size-4"/>}

                    <ComboBox.Trigger className="rounded-[5px]"/>
                </ComboBox.InputGroup>

                {/* FieldError only renders when isInvalid is true */}
                <FieldError>{requiredMessage}</FieldError>

                <ComboBox.Popover className="rounded-[5px]">
                    <ListBox
                        selectionMode="multiple"
                        renderEmptyState={() => (
                            <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
                                <Icon className="size-6 text-muted" icon="fa6-solid:inbox"/>
                                <span className="text-sm text-muted">{noResultsText}</span>
                            </div>
                        )}
                    >
                        {options.map((opt) => (
                            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                {opt.label}
                                <ListBox.ItemIndicator/>
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </ComboBox.Popover>
            </ComboBox>

            {chipsPlacement === "above" && chipsRow}
            {chipsPlacement === "below" && chipsRow}
        </div>
    );

    if (!tooltip) return field;

    const config: HeroUITooltipConfig =
        typeof tooltip === "string" ? {text: tooltip} : tooltip;

    const {
        text,
        placement = "top",
        showArrow = false,
        delay = 0,
        className: tooltipClassName,
    } = config;

    return (
        <Tooltip delay={delay}>
            <Tooltip.Trigger>
                {field}
            </Tooltip.Trigger>
            <Tooltip.Content
                className={tooltipClassName}
                placement={placement}
                showArrow={showArrow}
            >
                {showArrow && <Tooltip.Arrow/>}
                <p>{text}</p>
            </Tooltip.Content>
        </Tooltip>
    );
};

HeroUIComboBoxMultiple.displayName = "HeroUIComboBoxMultiple";

export default HeroUIComboBoxMultiple;
