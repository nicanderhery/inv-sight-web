import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes.tsx';
import AppLayout from './layout/app-layout.tsx';
import customTheme from './theme.ts';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () => createTheme(customTheme(prefersDarkMode ? 'dark' : 'light')),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppLayout>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AppRoutes />
          </LocalizationProvider>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
