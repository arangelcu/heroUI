import {Button} from "@heroui/react";
import {createColumnHelper} from "@tanstack/react-table";
import React, {useCallback, useState} from "react";
import {HeroUIDemoThemeSwitch} from "./HeroUIDemoThemeSwitch";
import TableLoader from "../HeroUITable/TableLoader/TableLoader";
import TableEmpty from "../HeroUITable/TableEmpty/TableEmpty";
import {FetchParams, HeroUiTable, PaginationOptions,} from "../HeroUITable/HeroUITable/HeroUiTable";
import HeroUIIconButton from "../HeroUIIConButton/HeroUIIconButton";
import HeroUIButton from "../HeroUIButton/HeroUIButton";
import TableFilters, {FilterValues} from "../HeroUITable/TableFilters/TableFilters";

interface User {
    id: number;
    name: string;
    role: string;
    status: "Active" | "Inactive" | "On Leave";
    email: string;
}

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
    Active: "success",
    Inactive: "danger",
    "On Leave": "warning",
};

const users: User[] = [
    {email: "kate@acme.com", id: 1, name: "Kate Moore", role: "CEO", status: "Active"},
    {email: "john@acme.com", id: 2, name: "John Smith", role: "CTO", status: "Active"},
    {email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave"},
    {email: "michael@acme.com", id: 4, name: "Michael Brown", role: "CFO", status: "Active"},
    {email: "emily@acme.com", id: 5, name: "Emily Davis", role: "Product Manager", status: "Inactive"},
    {email: "davis@acme.com", id: 6, name: "Davis Wilson", role: "Lead Designer", status: "Active"},
    {email: "olivia@acme.com", id: 7, name: "Olivia Martinez", role: "Frontend Engineer", status: "Active"},
    {email: "james@acme.com", id: 8, name: "James Taylor", role: "Backend Engineer", status: "Active"},
];

// 👇 Handlers de acciones
const handleView = (user: User) => console.log("View", user);
const handleEdit = (user: User) => console.log("Edit", user);
const handleDelete = (user: User) => console.log("Delete", user);

const columnHelper = createColumnHelper<any, User>();

const userColumns = columnHelper.columns([
    columnHelper.accessor("name", {
        header: "Name",
        minWidth: 160,
        defaultWidth: "1fr",
    } as any),
    columnHelper.accessor("role", {
        header: "Role",
        minWidth: 150,
        defaultWidth: "1fr",
    } as any),
    columnHelper.accessor("status", {
        header: "Status",
        minWidth: 120,
        defaultWidth: "1fr",
    } as any),
    columnHelper.accessor("email", {
        header: "Email",
        minWidth: 200,
        defaultWidth: "1fr",
    } as any),

    // 👇 Columna de acciones
    columnHelper.display({
        id: "actions",
        header: () => <div className="w-full text-end">Actions</div>,
        size: 160,
        enableSorting: false,
        cell: ({row}) => {
            const user = row.original;
            return (
                <div className="flex items-center justify-end gap-1">
                    <HeroUIIconButton
                        tooltip={"Details"}
                        aria-label={`View ${user.name}`}
                        icon="fa6-solid:eye"
                        onPress={() => handleView(user)}
                    />

                    {/* Edit — editar */}
                    <HeroUIIconButton
                        tooltip={"Edit"}
                        aria-label={`Edit ${user.name}`}
                        icon="fa6-solid:pen-to-square"
                        onPress={() => handleEdit(user)}
                    />

                    {/* Delete — eliminar */}
                    <HeroUIIconButton
                        tooltip={"Delete"}
                        aria-label={`Delete ${user.name}`}
                        icon="fa6-solid:trash-can"
                        variant="danger-soft"
                        onPress={() => handleDelete(user)}
                    />
                </div>
            );
        },
    }),
]);

// Simulación de "DB" — 57 filas
const ALL_USERS: User[] = Array.from({length: 57}, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    role: ["CEO", "CTO", "CMO", "Engineer"][i % 4],
    status: (["Active", "Inactive", "On Leave"] as const)[i % 3],
    email: `user${i + 1}@acme.com`,
}));

// 👇 Estado inicial de tu objeto
const initialPaginationOptions: PaginationOptions = {
    first: 0,
    offset: 0,
    currentPage: 0,
    totalElements: 0,
    countRows: 0,
    pageSize: 10,
    pages: 0,
};

function App() {
    const [data, setData] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationOptions, setPaginationOptions] =
        useState<PaginationOptions>(initialPaginationOptions);
    const [filters, setFilters] = useState<FilterValues>({});
    const [showFilters, setShowFilters] = useState(false);

    // 👇 Aquí va tu llamada real a la DB / API
    const fetchData = useCallback(async (params: FetchParams) => {
        setIsLoading(true);
        try {
            const {offset, pageSize, sorting} = params;

            // Simulación: filtrado + paginado + sorting en el "server"
            let result = [...ALL_USERS];

            if (sorting.length > 0) {
                const {id, desc} = sorting[0];
                result.sort((a, b) => {
                    const va = String(a[id as keyof User]);
                    const vb = String(b[id as keyof User]);
                    return desc ? vb.localeCompare(va) : va.localeCompare(vb);
                });
            }

            const startIdx = offset;
            const paged = result.slice(startIdx, startIdx + pageSize);

            // Simula latencia
            await new Promise((r) => setTimeout(r, 600));

            // 👇 Actualizamos data + tu objeto paginationOptions
            setData(paged);
            setPaginationOptions({
                first: offset,
                offset: offset,
                currentPage: params.currentPage,
                totalElements: result.length,
                countRows: paged.length,
                pageSize: pageSize,
                pages: Math.ceil(result.length / pageSize),
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
        fetchData({
            first: 0,
            offset: 0,
            currentPage: 0,
            pageSize: paginationOptions.pageSize,
            sorting: [],
            filters: newFilters,
        });
    };

    return (
        <div className="p-8">
            <HeroUIDemoThemeSwitch/>
            <br/>

            <div className="flex gap-2">

                <HeroUIButton
                    icon="fa6-solid:arrows-rotate"
                    iconPosition="start"
                    onClick={() => setIsLoading(!isLoading)}
                >
                    Loading
                </HeroUIButton>
                <HeroUIButton
                    appearance="header"
                    icon="fa6-solid:trash-can"
                    onPress={() => alert("dsdsds")}
                >
                    Eliminar
                </HeroUIButton>

                <Button
                    onClick={() => {
                        setData([]);
                        setPaginationOptions({
                            ...paginationOptions,
                            countRows: 0,
                            totalElements: 0,
                            pages: 0,
                        });
                    }}
                >
                    Clean
                </Button>

                <Button
                    onClick={() => {
                        fetchData({
                            first: 0,
                            offset: 0,
                            currentPage: 0,
                            pageSize: paginationOptions.pageSize,
                            sorting: [],
                            filters: filters,
                        });
                    }}
                >
                    Poblate
                </Button>
            </div>

            <br/>
            <br/>

            <HeroUiTable
                columns={userColumns}
                isLoading={isLoading}
                data={data}
                paginationOptions={paginationOptions}
                fetchData={fetchData}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                rowHeaderColumnId="name"
                renderLoading={() => <TableLoader loading={true}/>}
                renderEmpty={() => (
                    <TableEmpty
                        icon="fa6-solid:inbox"
                        title="No hay usuarios"
                        description="Cuando se registren usuarios aparecerán aquí."
                    />
                )}
                // 👇 ESTO ES LO QUE FALTA PROBABLEMENTE
                filtersConfig={{
                    start: <h2 className="text-lg font-semibold">Team members</h2>,
                    enableFiltersBtn: true,
                    enableRefreshBtn: true,
                    enableFilterName: true,
                    enableFilterRole: true,
                    enableFilterStatus: true,
                    namePlaceholder: "Buscar por nombre...",
                }}
            />


            <br/>
            <HeroUiTable
                columns={userColumns}
                isLoading={isLoading}
                data={data}
                paginationOptions={paginationOptions}
                fetchData={fetchData}
                pageSizeOptions={[5, 10, 25, 50, 100]}

                // 👇 Activar selección
                enableSelection
                getRowId={(user) => user.id}
                onSelectionChange={(selectedUsers) => {
                    console.log("Filas seleccionadas:", selectedUsers);
                    // aquí puedes guardar, borrar, etc.
                }}


                // 👇 Activar el resize
                enableColumnResizing

                ariaLabel="Team members"
                rowHeaderColumnId="name"
                renderLoading={() => <TableLoader loading={true}/>}
                renderEmpty={() => (
                    <TableEmpty
                        icon="fa6-solid:inbox"
                        title="No hay usuarios"
                        description="Cuando se registren usuarios aparecerán aquí."
                    />
                )}
            />


        </div>
    );
}

export default App;