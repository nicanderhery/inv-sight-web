import { PaletteMode } from '@mui/material';

const customTheme = (mode: PaletteMode) => ({
  palette: {
    mode: mode,
    ...(mode === 'light'
      ? {
          background: {
            default: '#f6f8fc',
            paper: '#FFFFFF',
          },
        }
      : {
          background: {
            default: '#181c1f',
            paper: '#374955',
          },
        }),
  },
});

export default customTheme;
