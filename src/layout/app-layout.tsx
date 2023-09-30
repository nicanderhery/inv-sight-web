import { Box } from '@mui/material';
import React from 'react';
import Appbar from './app-bar.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: LayoutProps) => {
  return (
    <Box>
      <Appbar />
      {children}
    </Box>
  );
};

export default AppLayout;
