import dayjs from 'dayjs';
import React from 'react';

interface CalendarChooseDateProps {
  date: dayjs.Dayjs | null;
  setDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs | null>>;
}

export default CalendarChooseDateProps;
