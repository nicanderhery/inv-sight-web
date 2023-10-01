import dayjs from 'dayjs';
import React from 'react';
import Transaction from '../entities/transaction';

interface TransactionsExportDialogProps {
  visible: boolean;
  onDismiss: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
  transactions: Transaction[];
  calendarRange: {
    startDate: dayjs.Dayjs | null;
    endDate: dayjs.Dayjs | null;
  };
}

export default TransactionsExportDialogProps;
