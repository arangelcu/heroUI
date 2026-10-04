import {ToastQueue} from "@heroui/react";

/**
 * Cola global de toasts, creada una sola vez.
 *
 * Vive en su propio modulo porque el plugin de Fast Refresh no puede refrescar
 * un archivo que exporta un componente y ademas una constante.
 */
export const toastQueue = new ToastQueue({
    maxVisibleToasts: 3,
});
