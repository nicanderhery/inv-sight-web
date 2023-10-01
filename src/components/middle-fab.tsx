import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Fab } from '@mui/material';
import React from 'react';
import MiddleFabProps from '../interfaces/components/middle-fab-props';

const MiddleFab: React.FC<MiddleFabProps> = (props) => {
  return (
    <Fab
      sx={{
        position: 'fixed',
        left: '4rem',
        right: '4rem',
        bottom: '2rem',
      }}
      variant="extended"
      color="primary"
      onClick={props.onClick}
    >
      <Icon path={mdiPlus} size={1} />
      {props.message}
    </Fab>
  );
};

export default MiddleFab;
