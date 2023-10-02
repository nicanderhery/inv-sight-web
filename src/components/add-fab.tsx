import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Fab } from '@mui/material';
import React from 'react';
import AddFabProps from '../interfaces/components/add-fab-props.ts';

const AddFab: React.FC<AddFabProps> = (props) => {
  return (
    <Fab
      sx={{
        position: 'fixed',
        right: '2rem',
        bottom: '2rem',
      }}
      color="primary"
      onClick={props.onClick}
    >
      <Icon path={mdiPlus} size={1} />
    </Fab>
  );
};

export default AddFab;
