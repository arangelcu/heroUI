import React from "react";
import {Table} from "@heroui/react";

export function HeroUITableBase() {
    return (
        <div className="flex flex-col gap-3">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content aria-label="Team members" className="min-w-[600px]">
                        <Table.Header className="bg-surface-secondary [&>tr]:border-b [&>tr]:border-border">
                            <Table.Column className="px-4 py-3 text-left font-semibold text-default-foreground">
                                Name
                            </Table.Column>
                            <Table.Column className="px-4 py-3 text-left font-semibold text-default-foreground">
                                Role
                            </Table.Column>
                            <Table.Column className="px-4 py-3 text-left font-semibold text-default-foreground">
                                Status
                            </Table.Column>
                            <Table.Column className="px-4 py-3 text-left font-semibold text-default-foreground">
                                Email
                            </Table.Column>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row className="border-b border-border hover:bg-surface-secondary-hover">
                                <Table.Cell className="px-4 py-3 text-muted">Kate Moore</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">CEO</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">Active</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">kate@acme.com</Table.Cell>
                            </Table.Row>
                            <Table.Row className="border-b border-border hover:bg-surface-secondary-hover">
                                <Table.Cell className="px-4 py-3 text-muted">John Smith</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">CTO</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">Active</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">john@acme.com</Table.Cell>
                            </Table.Row>
                            <Table.Row className="border-b border-border hover:bg-surface-secondary-hover">
                                <Table.Cell className="px-4 py-3 text-muted">John Smith 2</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">CTO</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">Active</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">john@acme.com</Table.Cell>
                            </Table.Row>
                            <Table.Row className="border-b border-border hover:bg-surface-secondary-hover">
                                <Table.Cell className="px-4 py-3 text-muted">John Smith 3</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">CTO</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">Active</Table.Cell>
                                <Table.Cell className="px-4 py-3 text-muted">john@acme.com</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>
        </div>
    );
}