import { mdiCashMinus, mdiCashPlus, mdiCashRegister, mdiTableLarge } from '@mdi/js';
import Icon from '@mdi/react';
import { Avatar, Box, Chip, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { onValue } from 'firebase/database';
import React from 'react';
import { useParams } from 'react-router-dom';
import TransactionsExportDialog from '../components/transactions-export-dialog';
import Transaction from '../interfaces/entities/transaction';
import { updateGlobalSnackbar } from '../state/global-snackbar';
import { DBRefTransactions } from '../utils/db-functions';
import { numberToMoneyIndonesia, unixToDate } from '../utils/formatter';

const TransactionsPage = () => {
  const storeId = useParams<{ storeId: string }>().storeId!;

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [calendarRange, setCalendarRange] = React.useState<{
    startDate: dayjs.Dayjs | null;
    endDate: dayjs.Dayjs | null;
  }>({ startDate: null, endDate: null });

  const [isExportDialogVisible, setIsExportDialogVisible] = React.useState(false);

  const totalTransactions = React.useMemo(() => {
    return transactions.reduce(
      (accumulator, transaction) => accumulator + (transaction.debit ? 1 : -1) * transaction.price,
      0,
    );
  }, [transactions]);

  React.useEffect(() => {
    const startDate = calendarRange.startDate?.toDate().getTime() ?? 0;
    const endDate =
      calendarRange.endDate
        ?.add(23, 'hour')
        .add(59, 'minute')
        .add(59, 'second')
        .toDate()
        .getTime() ?? new Date().getTime();

    // Fetch transactions from database
    const unsubscribe = onValue(DBRefTransactions(storeId), (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach((childSnapshot) => {
        const transaction = childSnapshot.val() as Transaction;
        transactions.push(transaction);
      });
      setTransactions(
        transactions
          .sort((a, b) => b.createdAt - a.createdAt)
          .filter((transaction) => {
            return transaction.createdAt >= startDate && transaction.createdAt <= endDate;
          }),
      );
    });

    // Clear all listeners when no longer needed
    return () => unsubscribe();
  }, [storeId, calendarRange]);

  return (
    <Box sx={{ padding: '2rem' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip
          avatar={
            <Avatar>
              <Icon path={mdiCashRegister} size={1} />
            </Avatar>
          }
          label={`Mutasi: ${numberToMoneyIndonesia(totalTransactions)}`}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <DatePicker
            sx={{ mx: '1rem' }}
            label="Dari"
            value={calendarRange.startDate}
            onChange={(newDate) => {
              setCalendarRange({
                ...calendarRange,
                startDate: newDate,
              });
            }}
          />
          <DatePicker
            sx={{ mx: '1rem' }}
            label="Sampai"
            value={calendarRange.endDate}
            onChange={(newDate) => {
              if (newDate && calendarRange.startDate && newDate.isBefore(calendarRange.startDate)) {
                updateGlobalSnackbar('error', 'Tanggal tidak valid');
                return;
              }
              setCalendarRange({
                ...calendarRange,
                endDate: newDate,
              });
            }}
          />
        </Box>
        <Chip
          avatar={
            <Avatar>
              <Icon path={mdiTableLarge} size={1} />
            </Avatar>
          }
          label="Download CSV"
          onClick={() => setIsExportDialogVisible(true)}
        />
      </Box>

      <List sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {transactions.map((transaction) => {
          return (
            <ListItem
              key={transaction.id}
              sx={{
                bgcolor: transaction.debit ? 'rgba(50, 200, 50, 0.3)' : 'rgba(200, 50, 50, 0.3)',
                my: '0.5rem',
                borderRadius: '1rem',
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <Icon path={transaction.debit ? mdiCashPlus : mdiCashMinus} size={1} />
                </Avatar>
              </ListItemAvatar>
              <Box
                sx={{
                  display: 'flex',
                  width: 'inherit',
                  alignItems: 'center',
                }}
              >
                <ListItemText
                  sx={{ width: '25%', px: '1rem' }}
                  primary={`${unixToDate(transaction.createdAt).date}\n${
                    unixToDate(transaction.createdAt).time
                  }`}
                />
                <ListItemText
                  sx={{ width: '25%', px: '1rem' }}
                  primary={`${transaction.debit ? 'Dijual' : 'Dibeli'} ${
                    transaction.data?.quantity ?? 0
                  }`}
                />
                <ListItemText
                  sx={{ width: '25%', px: '1rem' }}
                  primary={`${transaction.description} ${transaction.data?.item.name ?? ''} ${
                    transaction.data?.item.weight ?? ''
                  } ${transaction.data?.item.model ?? ''}`}
                />
                <ListItemText
                  sx={{ width: '25%', px: '1rem' }}
                  primary={numberToMoneyIndonesia(transaction.price)}
                />
              </Box>
            </ListItem>
          );
        })}
      </List>

      <TransactionsExportDialog
        visible={isExportDialogVisible}
        onDismiss={setIsExportDialogVisible}
        storeId={storeId}
        transactions={transactions}
        calendarRange={calendarRange}
      />
    </Box>
  );
};

export default TransactionsPage;
