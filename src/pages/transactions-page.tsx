import { mdiCashMinus, mdiCashPlus, mdiCashRegister, mdiTableLarge } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Chip, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { onValue } from 'firebase/database';
import React from 'react';
import { useParams } from 'react-router-dom';
import TransactionsExportDialog from '../components/transactions-export-dialog';
import Transaction from '../interfaces/entities/transaction';
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
    // Fetch transactions from database
    const unsubscribe = onValue(DBRefTransactions(storeId), (snapshot) => {
      const startDate = calendarRange.startDate?.toDate().getTime() ?? 0;
      const endDate =
        calendarRange.endDate
          ?.add(23, 'hour')
          .add(59, 'minute')
          .add(59, 'second')
          .toDate()
          .getTime() ?? new Date().setHours(23, 59, 59, 999);
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Chip
          variant="outlined"
          icon={<Icon path={mdiCashRegister} size={1} />}
          label={`Mutasi: ${numberToMoneyIndonesia(totalTransactions)}`}
          sx={{ borderRadius: '0.5rem' }}
        />
        <Box
          sx={{
            display: 'inherit',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <DatePicker
            sx={{ m: '1rem' }}
            label="Dari"
            value={calendarRange.startDate}
            maxDate={calendarRange.endDate}
            format="DD.MM.YYYY"
            onChange={(newDate) => {
              setCalendarRange({
                ...calendarRange,
                startDate: newDate,
              });
            }}
          />
          <DatePicker
            sx={{ m: '1rem' }}
            label="Sampai"
            value={calendarRange.endDate}
            minDate={calendarRange.startDate}
            format="DD.MM.YYYY"
            onChange={(newDate) => {
              setCalendarRange({
                ...calendarRange,
                endDate: newDate,
              });
            }}
          />
        </Box>
        <Chip
          variant="outlined"
          icon={<Icon path={mdiTableLarge} size={1} />}
          label="Download CSV"
          sx={{ borderRadius: '0.5rem' }}
          onClick={() => setIsExportDialogVisible(true)}
        />
      </Box>

      <List sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {transactions.map((transaction) => {
          const soldMessage = transaction.debit
            ? transaction.data
              ? `Terjual ${transaction.data.quantity}`
              : 'Pendapatan'
            : transaction.data
            ? `Dibeli ${transaction.data.quantity}`
            : 'Pengeluaran';

          return (
            <ListItem
              key={transaction.id}
              sx={{
                bgcolor: transaction.debit ? 'rgba(50, 200, 50, 0.3)' : 'rgba(200, 50, 50, 0.3)',
                my: '0.5rem',
                borderRadius: '0.5rem',
              }}
            >
              <ListItemAvatar>
                <Icon path={transaction.debit ? mdiCashPlus : mdiCashMinus} size={1.5} />
              </ListItemAvatar>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  width: 'inherit',
                }}
              >
                <Box
                  sx={{
                    display: 'inherit',
                    flexWrap: 'inherit',
                    alignItems: 'inherit',
                    flex: 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      sx={{ px: '1rem' }}
                      primary={`${unixToDate(transaction.createdAt).date}\n${
                        unixToDate(transaction.createdAt).time
                      }`}
                    />
                  </Box>

                  <Box sx={{ flex: 2 }}>
                    <ListItemText
                      sx={{ px: '1rem' }}
                      primary={numberToMoneyIndonesia(transaction.price)}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'inherit',
                    flexWrap: 'inherit',
                    alignItems: 'inherit',
                    flex: 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <ListItemText sx={{ px: '1rem' }} primary={soldMessage} />
                  </Box>
                  <Box sx={{ flex: 2 }}>
                    <ListItemText
                      sx={{ px: '1rem' }}
                      primary={`${transaction.data?.item.name ?? ''} ${
                        transaction.data?.item.weight ?? ''
                      } ${transaction.data?.item.model ?? ''}`}
                    />
                    <ListItemText sx={{ px: '1rem' }} primary={transaction.description} />
                  </Box>
                </Box>
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
