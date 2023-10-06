import { Alert, Box, Snackbar } from '@mui/material';
import React from 'react';
import { globalSnackbar } from '../state/global-snackbar.ts';
import Appbar from './app-bar.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: LayoutProps) => {
  const [snackbar] = globalSnackbar.useState();

  return (
    <Box>
      <Appbar />
      {children}
      <Snackbar open={snackbar.open} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AppLayout;
