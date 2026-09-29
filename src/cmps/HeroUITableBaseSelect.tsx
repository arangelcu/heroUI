import React, { useState } from "react";
import { Checkbox, type Selection, Table } from "@heroui/react";

const users = [
    { email: "kate@acme.com", id: 1, name: "Kate Moore", role: "CEO", status: "Active" },
    { email: "john@acme.com", id: 2, name: "John Smith", role: "CTO", status: "Active" },
    { email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave" },
    { email: "michael@acme.com", id: 4, name: "Michael Brown", role: "CFO", status: "Active" },
];

export function HeroUITableBaseSelect() {
    // @ts-ignore
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

    return (
        <div className="flex flex-col gap-3">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content
                        aria-label="Table with selection"
                        className="min-w-[600px]"
                        selectedKeys={selectedKeys}
                        selectionMode="multiple"
                        onSelectionChange={setSelectedKeys}
                    >
                        <Table.Header className="bg-surface-secondary [&>tr]:border-b [&>tr]:border-border">
                            <Table.Column className="pe-0 px-4 py-3">
                                <Checkbox aria-label="Select all" slot="selection">
                                    <Checkbox.Content>
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                    </Checkbox.Content>
                                </Checkbox>
                            </Table.Column>
                            <Table.Column
                                id="name"
                                isRowHeader
                                className="px-4 py-3 text-left font-semibold text-default-foreground"
                            >
                                Name
                            </Table.Column>
                            <Table.Column
                                id="role"
                                className="px-4 py-3 text-left font-semibold text-default-foreground"
                            >
                                Role
                            </Table.Column>
                            <Table.Column
                                id="status"
                                className="px-4 py-3 text-left font-semibold text-default-foreground"
                            >
                                Status
                            </Table.Column>
                            <Table.Column
                                id="email"
                                className="px-4 py-3 text-left font-semibold text-default-foreground"
                            >
                                Email
                            </Table.Column>
                        </Table.Header>
                        <Table.Body>
                            {users.map((user) => (
                                <Table.Row
                                    key={user.id}
                                    id={user.id}
                                    className="border-b border-border hover:bg-surface-secondary-hover"
                                >
                                    <Table.Cell className="pe-0 px-4 py-3">
                                        <Checkbox
                                            aria-label={`Select ${user.name}`}
                                            slot="selection"
                                        >
                                            <Checkbox.Content>
                                                <Checkbox.Control>
                                                    <Checkbox.Indicator />
                                                </Checkbox.Control>
                                            </Checkbox.Content>
                                        </Checkbox>
                                    </Table.Cell>
                                    <Table.Cell className="px-4 py-3 text-muted">{user.name}</Table.Cell>
                                    <Table.Cell className="px-4 py-3 text-muted">{user.role}</Table.Cell>
                                    <Table.Cell className="px-4 py-3 text-muted">{user.status}</Table.Cell>
                                    <Table.Cell className="px-4 py-3 text-muted">{user.email}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>
            <p className="text-sm text-muted">
                Selected:{" "}
                <span className="font-medium">
                    {selectedKeys === "all"
                        ? "All"
                        : selectedKeys.size > 0
                            ? Array.from(selectedKeys).join(", ")
                            : "None"}
                </span>
            </p>
        </div>
    );
}