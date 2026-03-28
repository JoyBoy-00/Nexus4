import { useCallback } from 'react';
import { X } from 'lucide-react';
import { SnackbarKey, useSnackbar } from 'notistack';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export const useAppToast = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const isError = variant === 'error';

      enqueueSnackbar(message, {
        variant,
        autoHideDuration: isError ? undefined : 4000,
        persist: isError,
        action: isError
          ? (snackbarId: SnackbarKey) => (
              <button
                aria-label="Dismiss notification"
                className="p-1 hover:opacity-70 transition-opacity"
                onClick={() => closeSnackbar(snackbarId)}
              >
                <X size={16} className="text-white" />
              </button>
            )
          : undefined,
      });
    },
    [closeSnackbar, enqueueSnackbar]
  );

  return { toast };
};
