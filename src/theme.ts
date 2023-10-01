import { PaletteMode } from '@mui/material';

const customTheme = (mode: PaletteMode) => ({
  palette: {
    mode: mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1976d2',
          },
          background: {
            default: '#f6f8fc',
            container: '#ffffff',
          },
        }
      : {
          primary: {
            main: '#1976d2',
          },
        }),
  },
});

export default customTheme;
