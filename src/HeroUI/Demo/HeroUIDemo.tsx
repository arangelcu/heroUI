import {createColumnHelper} from "@tanstack/react-table";
import React, {useCallback, useState} from "react";
import {Card, Label, type TimeValue} from "@heroui/react";
import {HeroUIThemes} from "../HeroUIStyles/HeroUIThemes";
import {FetchParams, HeroUiTable, PaginationOptions,} from "../HeroUITable/HeroUITable/HeroUiTable";
import HeroUIIconButton from "../HeroUIIConButton/HeroUIIconButton";
import HeroUIButton from "../HeroUIButton/HeroUIButton";
import HeroUITimeField from "../HeroUITimeField/HeroUITimeField";
import HeroUIComboBox, {HeroUIComboBoxOption} from "../HeroUIComboBox/HeroUIComboBox";
import HeroUICheckbox from "../HeroUICheckbox/HeroUICheckbox";
import HeroUIDateField from "../HeroUIDateField/HeroUIDateField";
import HeroUIDatePicker from "../HeroUIDatePicker/HeroUIDatePicker";
import HeroUIDateRangePicker from "../HeroUIDateRangePicker/HeroUIDateRangePicker";
import HeroUINumberField from "../HeroUINumberField/HeroUINumberField";
import HeroUISelect from "../HeroUISelect/HeroUISelect";
import HeroUISwitch from "../HeroUISwitch/HeroUISwitch";
import HeroUITextArea from "../HeroUITextArea/HeroUITextArea";
import HeroUITextField from "../HeroUITextField/HeroUITextField";
import HeroUIToggleButton from "../HeroUIToggleButton/HeroUIToggleButton";
import HeroUIPhone from "../HeroUIPhone/HeroUIPhone";
import HeroUICard from "../HeroUICard/HeroUICard";
import {HeroUIAlertDialog} from "../HeroUIAlertDialog/HeroUIAlertDialog";
import {toastQueue} from "../HeroUIProvider/HeroUIProvider";

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
                        tone="info-soft"
                        aria-label={`View ${user.name}`}
                        icon="fa6-solid:eye"
                        onPress={() => handleView(user)}
                    />
                    <HeroUIIconButton
                        tone="brown-soft"
                        tooltip={"Edit"}
                        aria-label={`Edit ${user.name}`}
                        icon="fa6-solid:pen-to-square"
                        onPress={() => handleEdit(user)}
                    />
                    <HeroUIIconButton
                        tooltip={"Delete"}
                        aria-label={`Delete ${user.name}`}
                        icon="fa6-solid:trash-can"
                        tone="danger-soft"
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

/** Predefined role options (same as TableFilters). */
const ROLE_OPTIONS = [
    {id: "CEO", label: "CEO"},
    {id: "CTO", label: "CTO"},
    {id: "CMO", label: "CMO"},
    {id: "Engineer", label: "Engineer"},
];

/** Predefined status options (same as TableFilters). */
const STATUS_OPTIONS = [
    {id: "Active", label: "Active"},
    {id: "Inactive", label: "Inactive"},
    {id: "On Leave", label: "On Leave"},
];

/**
 * Simula una búsqueda server-side.
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

    // --- New components demo state ----------------------------------------
    const [checked, setChecked] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [text, setText] = useState('');
    const [phone, setPhone] = useState('');
    const [timeValue, setTimeValue] = useState<TimeValue | null>(null);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [numberValue, setNumberValue] = useState<number | undefined>(undefined);
    const [textAreaValue, setTextAreaValue] = useState("");
    const [dateValue, setDateValue] = useState<Date | null>(null);
    const [datePickerValue, setDatePickerValue] = useState<Date | null>(null);
    const [dateRangeValue, setDateRangeValue] = useState<{ start: Date; end: Date } | null>(null);

    // --- Select demo state -------------------------------------------------
    /** Single-selection role filter (mirrors TableFilters role). */
    const [selectedRole, setSelectedRole] = useState<string>("");
    /** Multi-selection status filter (mirrors TableFilters status). */
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    // --- Sidebar state -----------------------------------------------------
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    return (
        <>
            <div
                className="p-2 transition-[padding-left] duration-200 ease-out"
            >
                <div className="w-9/10 mx-auto p-8 flex flex-col gap-[15px]">

                    {/* ---------- Card 1: Theme Buttons ---------- */}
                    <HeroUICard
                        title="Theme Buttons"
                        description="HeroUI default themes">
                        <div className="p-4">
                            <HeroUIThemes/>
                        </div>
                    </HeroUICard>

                    <HeroUICard
                        title="Buttons — Solid/Soft/White Tones"
                        description="Buttons with icon and all custom semantic tones."
                        toolbar={{
                            end: (<>
                                {/* --- Solid tones --- */}
                                <HeroUIIconButton icon="fa6-solid:circle-info" tooltip="Info" tone="info"/>
                                <HeroUIIconButton icon="fa6-solid:circle-check" tooltip="Success" tone="success"/>
                                <HeroUIIconButton icon="fa6-solid:triangle-exclamation" tooltip="Warning"
                                                  tone="warning"/>
                                <HeroUIIconButton icon="fa6-solid:circle-xmark" tooltip="Danger" tone="danger"/>
                                <HeroUIIconButton icon="fa6-solid:mug-hot" tooltip="Brown" tone="brown"/>
                                <HeroUIIconButton icon="fa6-solid:sun" tooltip="Yellow" tone="yellow"/>
                                <HeroUIIconButton icon="fa6-solid:circle" tooltip="Gray" tone="gray"/>

                                {/* --- Soft tones --- */}
                                <HeroUIIconButton icon="fa6-solid:circle-info" tooltip="Info soft" tone="info-soft"/>
                                <HeroUIIconButton icon="fa6-solid:circle-check" tooltip="Success soft"
                                                  tone="success-soft"/>
                                <HeroUIIconButton icon="fa6-solid:triangle-exclamation" tooltip="Warning soft"
                                                  tone="warning-soft"/>
                                <HeroUIIconButton icon="fa6-solid:circle-xmark" tooltip="Danger soft"
                                                  tone="danger-soft"/>
                                <HeroUIIconButton icon="fa6-solid:mug-hot" tooltip="Brown soft" tone="brown-soft"/>
                                <HeroUIIconButton icon="fa6-solid:sun" tooltip="Yellow soft" tone="yellow-soft"/>
                                <HeroUIIconButton icon="fa6-solid:circle" tooltip="Gray soft" tone="gray-soft"/>

                                {/* --- White + color tones --- */}
                                <HeroUIIconButton icon="fa6-solid:circle-info" tooltip="White Info" tone="white-info"/>
                                <HeroUIIconButton icon="fa6-solid:circle-check" tooltip="White Success"
                                                  tone="white-success"/>
                                <HeroUIIconButton icon="fa6-solid:triangle-exclamation" tooltip="White Warning"
                                                  tone="white-warning"/>
                                <HeroUIIconButton icon="fa6-solid:circle-xmark" tooltip="White Danger"
                                                  tone="white-danger"/>
                                <HeroUIIconButton icon="fa6-solid:mug-hot" tooltip="White Brown" tone="white-brown"/>
                                <HeroUIIconButton icon="fa6-solid:sun" tooltip="White Yellow" tone="white-yellow"/>
                                <HeroUIIconButton icon="fa6-solid:circle" tooltip="White Gray" tone="white-gray"/>

                                {/* --- White + theme --- */}
                                <HeroUIIconButton icon="fa6-solid:moon" tooltip="White" tone="white"/>
                                <HeroUIIconButton icon="fa6-solid:heart" tooltip="White + Primary"
                                                  tone="white-primary"/>
                                <HeroUIIconButton icon="fa6-solid:palette" tooltip="White + Secondary"
                                                  tone="white-secondary"/>
                                <HeroUIIconButton icon="fa6-solid:palette" tooltip="White + Tertiary"
                                                  tone="white-tertiary"/>
                                <HeroUIIconButton icon="fa6-solid:palette" tooltip="Secondary soft"
                                                  tone="white-secondary-soft"/>
                                <HeroUIIconButton icon="fa6-solid:palette" tooltip="Tertiary soft"
                                                  tone="white-tertiary-soft"/>
                            </>)
                        }}
                    >
                        <div className="p-4 flex flex-col gap-4">

                            {/* --- Solid tones --- */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-semibold text-muted w-16">Solid</span>
                                <HeroUIButton icon="fa6-solid:circle-info" tone="info"
                                              tooltip="Solid info button">Info</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:circle-check" tone="success"
                                              tooltip="Solid success button">Success</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:triangle-exclamation" tone="warning"
                                              tooltip="Solid warning button">Warning</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:circle-xmark" tone="danger"
                                              tooltip="Solid danger button">Danger</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:mug-hot" tone="brown"
                                              tooltip="Solid brown button">Brown</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:sun" tone="yellow"
                                              tooltip="Solid yellow button">Yellow</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:circle" tone="gray"
                                              tooltip="Solid gray button">Gray</HeroUIButton>
                            </div>

                            {/* --- Soft tones --- */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-semibold text-muted w-16">Soft</span>
                                <HeroUIButton icon="fa6-solid:circle-info" tone="info-soft" tooltip="Soft info button">Info
                                    soft</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:circle-check" tone="success-soft"
                                              tooltip="Soft success button">Success soft</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:triangle-exclamation" tone="warning-soft"
                                              tooltip="Soft warning button">Warning soft</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:circle-xmark" tone="danger-soft"
                                              tooltip="Soft danger button">Danger soft</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:mug-hot" tone="brown-soft" tooltip="Soft brown button">Brown
                                    soft</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:sun" tone="yellow-soft" tooltip="Soft yellow button">Yellow
                                    soft</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:circle" tone="gray-soft" tooltip="Soft gray button">Gray
                                    soft</HeroUIButton>
                            </div>

                            {/* --- White + color tones --- */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-semibold text-muted w-16">White</span>
                                <HeroUIButton icon="fa6-solid:circle-info" tone="white-info"
                                              tooltip="White info button">White Info</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:circle-check" tone="white-success"
                                              tooltip="White success button">White Success</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:triangle-exclamation" tone="white-warning"
                                              tooltip="White warning button">White Warning</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:circle-xmark" tone="white-danger"
                                              tooltip="White danger button">White Danger</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:mug-hot" tone="white-brown" tooltip="White brown button">White
                                    Brown</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:sun" tone="white-yellow" tooltip="White yellow button">White
                                    Yellow</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:circle" tone="white-gray" tooltip="White gray button">White
                                    Gray</HeroUIButton>
                            </div>

                            {/* --- White + theme --- */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-semibold text-muted w-16">Theme</span>
                                <HeroUIButton icon="fa6-solid:moon" tone="white"
                                              tooltip="White button">White</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:heart" tone="white-primary"
                                              tooltip="White with primary color">White + Primary</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:palette" tone="white-secondary"
                                              tooltip="White with secondary color">White + Secondary</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:palette" tone="white-tertiary"
                                              tooltip="White with tertiary color">White + Tertiary</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:palette" tone="white-secondary-soft"
                                              tooltip="Secondary soft tone">White + Secondary Soft</HeroUIButton>
                                <HeroUIButton icon="fa6-solid:palette" tone="white-tertiary-soft"
                                              tooltip="Tertiary soft tone">White + Tertiary Soft</HeroUIButton>
                            </div>

                        </div>
                    </HeroUICard>

                    {/* ---------- Card 3: Form Fields ---------- */}
                    <Card className="rounded-[5px]">
                        <Card.Header>
                            <Card.Title>Form Fields</Card.Title>
                            <Card.Description>
                                All HeroUI input components with validation, tooltips, and required states.
                            </Card.Description>
                        </Card.Header>

                        <Card.Content>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">

                                <div>
                                    <HeroUITextField
                                        label="Text"
                                        tooltip="Text"
                                        placeholder="Enter text"
                                        type={"text"}
                                        isRequired
                                        requiredMessage="Text is required"
                                        isInvalid={false}
                                        invalidMessage="Something went wrong"
                                        value={text}
                                        onChange={(v) => {
                                            setText(v as any);
                                        }}
                                    />
                                </div>

                                <div>
                                    <HeroUITextField
                                        label="Email"
                                        tooltip="Email"
                                        placeholder="Enter your email"
                                        type={"email"}
                                        isRequired
                                        requiredMessage="Email is required"
                                        value={email}
                                        onChange={(v) => setEmail(v as any)}
                                    />
                                </div>

                                <div>
                                    <HeroUITextField
                                        label="Number"
                                        tooltip="Number"
                                        placeholder="Enter number"
                                        type={"number"}
                                        isRequired
                                        requiredMessage="Number is required"
                                        value={number}
                                        onChange={(v) => setNumber(v as any)}
                                    />
                                </div>

                                <div>
                                    <HeroUINumberField
                                        ariaLabel="Quantity"
                                        label="Quantity"
                                        value={numberValue}
                                        isRequired
                                        requiredMessage="Please enter a quantity"
                                        onChange={setNumberValue}
                                        minValue={1}
                                        maxValue={100}
                                        tooltip="Pick a number"
                                    />
                                    <p className="text-xs mt-1">Value: {numberValue}</p>
                                </div>

                                <div>
                                    <Label> Toggle Buttons</Label>
                                    <div className="flex items-center gap-3">
                                        <HeroUIToggleButton
                                            isIconOnly
                                            ariaLabel="Like"
                                            icon="fa6-solid:calendar-check"
                                            isSelected={liked}
                                            onChange={setLiked}
                                            tooltip="Like this item"
                                        />

                                        <HeroUIToggleButton
                                            isIconOnly
                                            ariaLabel="Bookmark"
                                            icon="fa6-solid:bookmark"
                                            variant="ghost"
                                            isSelected={bookmarked}
                                            onChange={setBookmarked}
                                            tooltip="Bookmark this item"
                                        />

                                        <HeroUIToggleButton
                                            ariaLabel="Like with text"
                                            iconConfig={{
                                                off: "fa6-solid:calendar-xmark",
                                                on: "fa6-solid:calendar-check",
                                            }}
                                            isSelected={liked}
                                            onChange={setLiked}
                                            tooltip="Toggle like"
                                        >
                                            {liked ? "Liked" : "Like"}
                                        </HeroUIToggleButton>
                                    </div>
                                    <p className="text-xs mt-1">
                                        Liked: {String(liked)} · Bookmarked: {String(bookmarked)}
                                    </p>
                                </div>

                                <div>
                                    <HeroUIDateField
                                        ariaLabel="Birth date"
                                        label="Birth date"
                                        value={dateValue as any}
                                        isRequired
                                        requiredMessage="Please select a date"
                                        onChange={(v) => setDateValue(v as any)}
                                        tooltip="Select a date"
                                    />
                                    <p className="text-xs mt-1">Date: {dateValue ? String(dateValue) : "(none)"}</p>
                                </div>

                                <div>
                                    <HeroUIDatePicker
                                        ariaLabel="Appointment date"
                                        label="Appointment"
                                        value={datePickerValue as any}
                                        isRequired
                                        requiredMessage="Please pick a date"
                                        onChange={(v) => setDatePickerValue(v as any)}
                                        tooltip="Pick an appointment date"
                                    />
                                    <p className="text-xs mt-1">Picked: {datePickerValue ? String(datePickerValue) : "(none)"}</p>
                                </div>

                                <div>
                                    <HeroUIDateRangePicker
                                        ariaLabel="Vacation range"
                                        label="Vacation range"
                                        isRequired
                                        requiredMessage="Please pick a date"
                                        value={dateRangeValue as any}
                                        onChange={(v) => setDateRangeValue(v as any)}
                                        tooltip="Pick a date range"
                                    />
                                    <p className="text-xs mt-1">
                                        Range: {dateRangeValue ? `${dateRangeValue.start} → ${dateRangeValue.end}` : "(none)"}
                                    </p>
                                </div>

                                <div>
                                    <HeroUITimeField
                                        ariaLabel="Appointment time"
                                        label="Appointment time"
                                        value={timeValue}
                                        onChange={setTimeValue}
                                        isRequired
                                        requiredMessage="Please select a time"
                                        tooltip="Select the appointment time"
                                    />
                                </div>

                                <div>
                                    <Label> Switch</Label>
                                    <br/>
                                    <HeroUISwitch
                                        ariaLabel="Enable notifications"
                                        isSelected={enabled}
                                        onChange={setEnabled}
                                        size="md"
                                        tooltip="Toggle notifications"
                                    />
                                    <p className="text-xs mt-1">Enabled: {String(enabled)}</p>
                                </div>

                                <div>
                                    <HeroUIComboBox
                                        ariaLabel="Search user (single)"
                                        options={options1}
                                        value={selected1}
                                        label={"Combo example"}
                                        onChange={(v) => handleSelectionChange1(v as string)}
                                        inputValue={inputValue1}
                                        onInputChange={handleInputChange1}
                                        isLoading={loading1}
                                        tooltip={"Combo Filter by User Name"}
                                        placeholder="Type to search..."
                                        isRequired
                                        requiredMessage="Please select a user"
                                    />

                                    <p className="text-xs mt-1">Selected id: {selected1 || "(none)"}</p>
                                    <p className="text-xs">Selected
                                        label: {options1.find((o) => o.id === selected1)?.label || "(none)"}</p>
                                </div>

                                <div>
                                    <HeroUISelect
                                        ariaLabel="Filter by role"
                                        label="Select Simple"
                                        options={ROLE_OPTIONS}
                                        value={selectedRole}
                                        placeholder="Select a role"
                                        showClearButton
                                        onChange={(key) => setSelectedRole((key as string) || "")}
                                        isRequired
                                        requiredMessage="Please select a item"
                                        tooltip={{
                                            text: "Filter by role",
                                            placement: "top",
                                            showArrow: true,
                                            delay: 200,
                                        }}
                                    />
                                    <p className="text-xs mt-1">Role: {selectedRole || "(none)"}</p>
                                </div>

                                <div>
                                    <HeroUISelect
                                        ariaLabel="Filter by status"
                                        label="Select Multiple"
                                        selectionMode="multiple"
                                        options={STATUS_OPTIONS}
                                        value={selectedStatuses}
                                        placeholder="Select statuses"
                                        onChange={(keys) => setSelectedStatuses(keys as string[])}
                                        isRequired
                                        requiredMessage="Please select a item"
                                        tooltip="Filter by status"
                                    />
                                    <p className="text-xs mt-1">
                                        Statuses: {selectedStatuses.length > 0 ? selectedStatuses.join(", ") : "(none)"}
                                    </p>
                                </div>

                                <div>
                                    <HeroUIPhone
                                        label="Contact phone"
                                        isRequired
                                        requiredMessage="Please enter your phone"
                                        invalidPhoneMessage="That's not a valid phone number"
                                        value={phone}
                                        tooltip={"Phone number"}
                                        onChange={setPhone}
                                    />
                                </div>

                                <div>
                                    <HeroUICheckbox
                                        ariaLabel="Accept terms"
                                        isSelected={checked}
                                        onChange={setChecked}
                                        tooltip="Accept terms and conditions"
                                    >
                                        Accept terms
                                    </HeroUICheckbox>
                                    <p className="text-xs mt-1">Checked: {String(checked)}</p>
                                </div>

                                <div>
                                    <HeroUITextArea
                                        ariaLabel="Comments"
                                        value={textAreaValue}
                                        onChange={setTextAreaValue}
                                        placeholder="Write your comments..."
                                        isRequired
                                        requiredMessage="Please write your comments"
                                        tooltip="Add your comments here"
                                    />
                                    <p className="text-xs mt-1">Chars: {textAreaValue.length}</p>
                                </div>

                                {/* ---------- AlertDialog trigger buttons ---------- */}
                                <div className="w-[195px] grid grid-cols-2">
                                    {/* Info type — only confirm, no cancel */}
                                    <HeroUIAlertDialog
                                        type="accent"
                                        title="New version available"
                                        description="A new version of HeroUI is available. Please update to the latest version for the best experience."
                                        confirmText="Got it"
                                        showCancel={false}
                                        onConfirm={() => console.log("Info acknowledged")}
                                        trigger={
                                            <>
                                                <HeroUIButton
                                                    tone="info"
                                                    icon={'fa6-solid:circle-info'}
                                                    tooltip="Info Alert">
                                                    Alert
                                                </HeroUIButton>
                                            </>
                                        }
                                    />

                                    {/* Confirm type — has confirm and cancel */}
                                    <HeroUIAlertDialog
                                        type="warning"
                                        title="Discard unsaved changes?"
                                        description="You have unsaved changes that will be permanently lost. Are you sure you want to discard them?"
                                        confirmText="Discard"
                                        cancelText="Keep editing"
                                        onConfirm={() => console.log("Confirmed: discard")}
                                        onCancel={() => console.log("Cancelled")}
                                        trigger={
                                            <>
                                                <HeroUIButton
                                                    icon={'fa6-solid:triangle-exclamation'}
                                                    tone="warning"
                                                    tooltip="Confirm Alert">
                                                    Alert
                                                </HeroUIButton>
                                            </>
                                        }
                                    />

                                    {/* Danger type */}
                                    <HeroUIAlertDialog
                                        type="danger"
                                        title="Delete this item?"
                                        description="This action cannot be undone. The item will be permanently removed."
                                        confirmText="Delete"
                                        cancelText="Cancel"
                                        onConfirm={() => console.log("Confirmed: delete")}
                                        onCancel={() => console.log("Cancelled")}
                                        trigger={
                                            <>
                                                <HeroUIButton
                                                    icon={'fa6-solid:circle-xmark'}
                                                    tone="danger"
                                                    tooltip="Danger Alert">
                                                    Alert
                                                </HeroUIButton>
                                            </>
                                        }
                                    />
                                </div>

                                {/* ---------- Toast trigger buttons ---------- */}
                                <div className="w-[195px] grid grid-cols-2">

                                    <HeroUIButton
                                        tone="info"
                                        icon={'fa6-solid:circle-info'}
                                        onPress={() =>
                                            toastQueue.add({
                                                title: "Information",
                                                description: "Please review before continuing.",
                                                variant: "default",
                                            })
                                        }
                                    >
                                        Toast
                                    </HeroUIButton>

                                    <HeroUIButton
                                        tone="success"
                                        icon="fa6-solid:circle-check"
                                        onPress={() =>
                                            toastQueue.add({
                                                title: "Success",
                                                description: "Your changes have been saved.",
                                                variant: "success",
                                            })
                                        }
                                    >
                                        Toast
                                    </HeroUIButton>

                                    <HeroUIButton
                                        tone="warning"
                                        icon="fa6-solid:triangle-exclamation"
                                        onPress={() =>
                                            toastQueue.add({
                                                title: "Warning",
                                                description: "Please review before continuing.",
                                                variant: "warning",
                                            })
                                        }
                                    >
                                        Toast
                                    </HeroUIButton>

                                    <HeroUIButton
                                        tone="danger"
                                        icon="fa6-solid:circle-xmark"
                                        onPress={() =>
                                            toastQueue.add({
                                                title: "Error",
                                                description: "Something went wrong.",
                                                variant: "danger",
                                            })
                                        }
                                    >
                                        Toast
                                    </HeroUIButton>
                                </div>
                            </div>
                        </Card.Content>

                        <Card.Footer>
                            <p className="text-xs text-muted">
                                All fields are controlled and validated in real time.
                            </p>
                        </Card.Footer>
                    </Card>

                    {/* ---------- Card 4: Table + DEFAULT ---------- */}
                    <HeroUICard
                        title="Table + DEFAULT"
                        description="Server-side pagination, sorting, and filters."
                    >
                        <div className="p-4">
                            <HeroUiTable
                                columns={userColumns}
                                isLoading={isLoading}
                                data={data}
                                paginationOptions={paginationOptions}
                                fetchData={fetchData}
                                pageSizeOptions={[5, 10, 25, 50, 100]}
                                rowHeaderColumnId="name"
                                filtersConfig={{
                                    start: <h2 className="text-lg font-semibold"></h2>,
                                    enableFiltersBtn: true,
                                    enableRefreshBtn: true,
                                    enableFilterName: true,
                                    enableFilterRole: true,
                                    enableFilterStatus: true,
                                    namePlaceholder: "Buscar por nombre...",
                                }}
                            />
                        </div>
                    </HeroUICard>

                    {/* ---------- Card 5: Table + SELECT ---------- */}
                    <HeroUICard
                        title="Table + SELECT"
                        description=" Row selection, column resizing, and custom actions."
                    >
                        <div className="p-4">
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
                                    start: <h2 className="text-lg font-semibold"></h2>,
                                    end: (
                                        <>
                                            <HeroUIIconButton
                                                tone={'white-info'}
                                                icon="fa6-solid:circle-info"
                                                tooltip="Custom ICON"
                                            />
                                        </>

                                    ),
                                    enableFiltersBtn: true,
                                    enableRefreshBtn: true,
                                    enableFilterName: true,
                                    enableFilterRole: true,
                                }}
                            />
                        </div>
                    </HeroUICard>

                    {/* ---------- Card 5: Table + SELECT ---------- */}
                    <HeroUICard
                        title="Table Simple"
                        description="Simple Table."
                    >
                        <div className="p-4">
                            <HeroUiTable
                                columns={userColumns}
                                isLoading={isLoading}
                                data={data}
                                paginationOptions={paginationOptions}
                                fetchData={fetchData}
                                pageSizeOptions={[5, 10, 25, 50, 100]}
                                enableSelection
                                getRowId={(user) => user.id}
                                ariaLabel="Team members"
                                rowHeaderColumnId="name"
                                filtersConfig={{
                                    startIcon: "fa6-solid:users",
                                    start: <h2 className="flex text-sm font-semibold text-surface-tertiary">My User
                                        Table</h2>,
                                    enableRefreshBtn: true,
                                }}
                            />
                        </div>
                    </HeroUICard>
                </div>
            </div>
        </>
    );
}

export default HeroUIDemo;