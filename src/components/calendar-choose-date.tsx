import { mdiCalendar, mdiCalendarCheck } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Dialog, IconButton } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import React from 'react';
import CalendarChooseDateProps from '../interfaces/components/calendar-choose-date-props';

const CalendarChooseDate: React.FC<CalendarChooseDateProps> = (props) => {
  const maxDate = new Date(Date.now() - 864e5); // Yesterday

  const [open, setOpen] = React.useState(false);

  return (
    <Box>
      <IconButton onClick={() => setOpen(true)}>
        <Icon path={props.date ? mdiCalendarCheck : mdiCalendar} size={1} />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DateCalendar
          value={props.date}
          onChange={(date) => {
            props.setDate(date);
            setOpen(false);
          }}
          defaultValue={dayjs(maxDate)}
          maxDate={dayjs(maxDate)}
        />
      </Dialog>
    </Box>
  );
};

export default CalendarChooseDate;
