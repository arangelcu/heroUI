import {createColumnHelper} from "@tanstack/react-table";
import React, {useCallback, useState} from "react";
import {HeroUIDemoThemeSwitch} from "./HeroUIDemoThemeSwitch";
import {FetchParams, HeroUiTable, PaginationOptions,} from "../HeroUITable/HeroUITable/HeroUiTable";
import HeroUIIconButton from "../HeroUIIConButton/HeroUIIconButton";
import HeroUIButton from "../HeroUIButton/HeroUIButton";
import HeroUIComboBox, {HeroUIComboBoxOption} from "../HeroUIComboBox/HeroUIComboBox";

interface User {
    id: number;
    name: string;
    role: string;
    status: "Active" | "Inactive" | "On Leave";
    email: string;
}

// Action handlers
const handleView = (user: User) => console.log("View", user);
const handleEdit = (user: User) => console.log("Edit", user);
const handleDelete = (user: User) => console.log("Delete", user);

const columnHelper = createColumnHelper<any, User>();

const userColumns = columnHelper.columns([
    columnHelper.accessor("name", {header: "Name", minWidth: 160, defaultWidth: "1fr"} as any),
    columnHelper.accessor("role", {header: "Role", minWidth: 150, defaultWidth: "1fr"} as any),
    columnHelper.accessor("status", {header: "Status", minWidth: 120, defaultWidth: "1fr"} as any),
    columnHelper.accessor("email", {header: "Email", minWidth: 200, defaultWidth: "1fr"} as any),
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
                    <HeroUIIconButton
                        tooltip={"Edit"}
                        aria-label={`Edit ${user.name}`}
                        icon="fa6-solid:pen-to-square"
                        onPress={() => handleEdit(user)}
                    />
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

// Simulated "DB" — 57 rows
const ALL_USERS: User[] = Array.from({length: 57}, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    role: ["CEO", "CTO", "CMO", "Engineer"][i % 4],
    status: (["Active", "Inactive", "On Leave"] as const)[i % 3],
    email: `user${i + 1}@acme.com`,
}));

const initialPaginationOptions: PaginationOptions = {
    first: 0,
    offset: 0,
    currentPage: 0,
    totalElements: 0,
    countRows: 0,
    pageSize: 10,
    pages: 0,
};

/**
 * Simula una búsqueda server-side.
 * En una app real, reemplaza esto por tu llamada `api.get(...)`.
 */
const searchUsers = async (query: string): Promise<HeroUIComboBoxOption[]> => {
    await new Promise((r) => setTimeout(r, 300));

    return ALL_USERS
        .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
        .map((u) => ({id: String(u.id), label: u.name}));
};

function HeroUIDemo() {
    // --- Table state -------------------------------------------------------
    const [data, setData] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [paginationOptions, setPaginationOptions] =
        useState<PaginationOptions>(initialPaginationOptions);

    const fetchData = useCallback(async (params: FetchParams) => {
        setIsLoading(true);
        try {
            const {offset, pageSize, sorting} = params;

            let result = [...ALL_USERS];

            if (sorting.length > 0) {
                const {id, desc} = sorting[0];
                result.sort((a, b) => {
                    const va = String(a[id as keyof User]);
                    const vb = String(b[id as keyof User]);
                    return desc ? vb.localeCompare(va) : va.localeCompare(vb);
                });
            }

            const paged = result.slice(offset, offset + pageSize);

            await new Promise((r) => setTimeout(r, 600));

            setData(paged);
            setPaginationOptions({
                first: offset,
                offset,
                currentPage: params.currentPage,
                totalElements: result.length,
                countRows: paged.length,
                pageSize,
                pages: Math.ceil(result.length / pageSize),
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- ComboBox #1 (single) state ---------------------------------------
    const [options1, setOptions1] = useState<HeroUIComboBoxOption[]>([]);
    const [selected1, setSelected1] = useState("");
    const [inputValue1, setInputValue1] = useState("");
    const [loading1, setLoading1] = useState(false);

    const handleInputChange1 = async (query: string) => {
        setInputValue1(query);

        if (selected1 && options1.find((o) => o.id === selected1)?.label === query) {
            return;
        }

        if (query.length < 3) {
            setOptions1([]);
            return;
        }

        setLoading1(true);
        try {
            setOptions1(await searchUsers(query));
        } finally {
            setLoading1(false);
        }
    };

    const handleSelectionChange1 = (id: string) => {
        console.log(id);
        setSelected1(id);
        if (!id) {
            setInputValue1("");
            return;
        }
        const opt = options1.find((o) => o.id === id);
        setInputValue1(opt ? opt.label : "");
    };

    return (
        <div className="p-8">
            <HeroUIDemoThemeSwitch/>
            <br/>

            <HeroUIButton
                appearance="pagination"
                onClick={() => {
                    // @ts-ignore
                    setData([]);
                }}
            >
                Clean
            </HeroUIButton>

            <br/>
            <br/>

            {/* ComboBox #1 — single */}
            <div className="p-1">
                <HeroUIComboBox
                    ariaLabel="Search user (single)"
                    options={options1}
                    value={selected1}
                    onChange={(v) => handleSelectionChange1(v as string)}
                    inputValue={inputValue1}
                    onInputChange={handleInputChange1}
                    isLoading={loading1}
                    tooltip={"Combo Filter by User Name"}
                    placeholder="Type to search..."
                />

                <p>Selected id: {selected1 || "(none)"}</p>
                <p>Selected label: {options1.find((o) => o.id === selected1)?.label || "(none)"}</p>
            </div>

            <br/>

            <HeroUiTable
                columns={userColumns}
                isLoading={isLoading}
                data={data}
                paginationOptions={paginationOptions}
                fetchData={fetchData}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                rowHeaderColumnId="name"
                filtersConfig={{
                    start: <h2 className="text-lg font-semibold">Table + DEFAULT</h2>,
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
                enableSelection
                getRowId={(user) => user.id}
                onSelectionChange={(selectedUsers) => {
                    console.log("Filas seleccionadas:", selectedUsers);
                }}
                enableColumnResizing
                ariaLabel="Team members"
                rowHeaderColumnId="name"
                filtersConfig={{
                    start: <h2 className="text-lg font-semibold">Table + SELECT</h2>,
                    end: (
                        <HeroUIIconButton
                            icon="fa6-solid:circle-info"
                            tooltip="Custom ICON"
                            appearance="surface"
                        />
                    ),
                    enableFiltersBtn: true,
                    enableRefreshBtn: true,
                    enableFilterName: true,
                    enableFilterRole: true,
                }}
            />
        </div>
    );
}

export default HeroUIDemo;