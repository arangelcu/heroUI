import React, {useCallback} from "react";
import {AlertDialog, Button, useOverlayState} from "@heroui/react";

/**
 * HeroUI v3.2.6 AlertDialog wrapper
 *
 * Supported status types (controlled by AlertDialog.Icon status prop):
 * - default  → gray default
 * - accent   → blue accent
 * - success  → green success
 * - warning  → orange warning
 * - danger   → red danger
 */
export type AlertDialogType =
    | "default"
    | "accent"
    | "success"
    | "warning"
    | "danger";

interface HeroUIAlertDialogProps {
    /** Dialog type, controls icon and color */
    type?: AlertDialogType;
    /** Title */
    title: string;
    /** Description text */
    description?: string;
    /** Confirm button label */
    confirmText?: string;
    /** Cancel button label */
    cancelText?: string;
    /** Whether to show the cancel button (info type usually doesn't need it) */
    showCancel?: boolean;
    /** Callback after clicking confirm */
    onConfirm?: () => void;
    /** Callback after clicking cancel */
    onCancel?: () => void;
    /** Trigger button content */
    trigger: React.ReactNode;
    /** Custom className for the trigger button */
    triggerClassName?: string;
}

export function HeroUIAlertDialog({
                                      type = "default",
                                      title,
                                      description,
                                      confirmText = "确认",
                                      cancelText = "取消",
                                      showCancel = true,
                                      onConfirm,
                                      onCancel,
                                      trigger,
                                  }: HeroUIAlertDialogProps) {
    const state = useOverlayState();

    /** Confirm click: run callback first, then close dialog */
    const handleConfirm = useCallback(() => {
        onConfirm?.();
        state.close();
    }, [onConfirm, state]);

    /** Cancel click: run callback first, then close dialog */
    const handleCancel = useCallback(() => {
        onCancel?.();
        state.close();
    }, [onCancel, state]);

    return (
        <AlertDialog isOpen={state.isOpen} onOpenChange={state.setOpen}>
            {/* Trigger button */}
            {trigger}

            <AlertDialog.Backdrop>
                <AlertDialog.Container>
                    <AlertDialog.Dialog className="sm:max-w-[420px]">
                        <AlertDialog.CloseTrigger/>

                        <AlertDialog.Header>
                            {/* Status icon — status controls color and icon */}
                            <AlertDialog.Icon status={type}/>
                            <AlertDialog.Heading>{title}</AlertDialog.Heading>
                        </AlertDialog.Header>

                        {description && (
                            <AlertDialog.Body>
                                <p className="text-sm text-muted">{description}</p>
                            </AlertDialog.Body>
                        )}

                        <AlertDialog.Footer>
                            {showCancel && (
                                <Button
                                    variant="tertiary"
                                    onPress={handleCancel}
                                >
                                    {cancelText}
                                </Button>
                            )}
                            <Button
                                variant={type === "danger" ? "danger" : "primary"}
                                onPress={handleConfirm}
                            >
                                {confirmText}
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}