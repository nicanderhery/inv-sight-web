import { AlertColor } from '@mui/material';
import * as StatePool from 'state-pool';

let previousSnackbar: NodeJS.Timeout | null = null;

type GlobalSnackbar = {
  severity: AlertColor;
  message: string;
  open: boolean;
};

export const globalSnackbar = StatePool.createState<GlobalSnackbar>({
  severity: 'success',
  message: '',
  open: false,
});

export const updateGlobalSnackbar = (severity: AlertColor, message: string) => {
  if (previousSnackbar) {
    clearTimeout(previousSnackbar);
  }
  globalSnackbar.setValue({
    severity,
    message,
    open: true,
  });
  previousSnackbar = setTimeout(() => {
    globalSnackbar.setValue({
      severity,
      message,
      open: false,
    });
    previousSnackbar = null;
  }, 4000);
};
