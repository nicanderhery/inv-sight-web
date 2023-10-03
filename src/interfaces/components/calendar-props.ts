import dayjs from 'dayjs';
import React from 'react';

interface CalendarProps {
  date: dayjs.Dayjs | null;
  setDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs | null>>;
}

export default CalendarProps;
