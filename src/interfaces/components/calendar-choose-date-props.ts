import dayjs from 'dayjs';
import React from 'react';

export interface CalendarChooseDateProps {
  date: dayjs.Dayjs | null;
  setDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs | null>>;
}
