import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { get } from 'firebase/database';
import React from 'react';
import TransactionsExportDialogProps from '../interfaces/components/transactions-export-dialog-props';
import Item from '../interfaces/entities/item';
import Store from '../interfaces/entities/store';
import Transaction from '../interfaces/entities/transaction';
import Pair from '../interfaces/types';
import { DBRefStore, DBRefTransactions } from '../utils/db-functions';
import { generateCsvTransactionReport, unixToDate } from '../utils/formatter';

const TransactionsExportDialog: React.FC<TransactionsExportDialogProps> = (props) => {
  const [store, setStore] = React.useState<Store>();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  const handleSaveToCsv = (transactions: Transaction[], withBalance?: boolean) => {
    const startDate = unixToDate(startDateUnix).date;
    const endDate = unixToDate(endDateUnix).date;
    const table = generateCsvTransactionReport(
      transactions,
      inventoryBefore,
      withBalance ? balanceBefore : undefined,
    );
    const csv = `Transaksi toko ${store?.name}\nDari tanggal ${startDate} sampai ${endDate}\n\n${table}`;
    const fileName = `${store?.name
      .replaceAll(' ', '-')
      .toLowerCase()}-transaksi-${startDate}-${endDate}-${new Date().getTime()}.csv`;

    // Download the CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const firstFilteredTransaction = React.useMemo(() => {
    // Get the first transaction that is filtered
    if (props.transactions.length > 0) {
      return props.transactions.slice(-1)[0];
    }
    return undefined;
  }, [props.transactions]);

  // Get all transactions before the first filtered transaction
  const transactionsBeforeFiltered = React.useMemo(() => {
    if (!firstFilteredTransaction) {
      return [];
    }
    return transactions.filter(
      (transaction) => transaction.createdAt < firstFilteredTransaction.createdAt,
    );
  }, [transactions, firstFilteredTransaction]);

  // Get the balance before the first filtered transaction
  const balanceBefore = React.useMemo(() => {
    // Calculate balance from transactions
    return transactionsBeforeFiltered.reduce(
      (accumulator, transaction) => accumulator + (transaction.debit ? 1 : -1) * transaction.price,
      0,
    );
  }, [transactionsBeforeFiltered]);

  // Get inventory before the first filtered transaction
  const inventoryBefore = React.useMemo(() => {
    const inventory = new Map<string, Pair<Item, number>>();

    // Get all items from transactions
    transactions.forEach((transaction) => {
      const data = transaction.data;
      if (!data) {
        return;
      }
      if (inventory.has(data.item.id)) {
        return;
      }
      inventory.set(data.item.id, {
        first: data.item,
        second: 0,
      });
    });

    transactionsBeforeFiltered.forEach((transaction) => {
      const data = transaction.data;
      if (!data) {
        return;
      }
      const stock = inventory.get(data.item.id);
      if (!stock) {
        return;
      }
      inventory.set(data.item.id, {
        ...stock,
        second: stock.second + (transaction.debit ? -1 : 1) * data.quantity,
      });
    });
    return inventory;
  }, [transactions, transactionsBeforeFiltered]);

  // Get the start and end date of the transactions
  const { startDateUnix, endDateUnix } = React.useMemo(() => {
    const startUnix =
      props.calendarRange.startDate?.toDate().getTime() ?? firstFilteredTransaction?.createdAt ?? 0;
    const endUnix = props.calendarRange.endDate?.toDate().getTime() ?? new Date().getTime();
    return { startDateUnix: startUnix, endDateUnix: endUnix };
  }, [
    props.calendarRange.startDate,
    props.calendarRange.endDate,
    firstFilteredTransaction?.createdAt,
  ]);

  React.useEffect(() => {
    if (props.visible) {
      // Fetch store from database
      get(DBRefStore(props.storeId))
        .then((snapshot) => {
          const store = snapshot.val() as Store;
          setStore(store);
        })
        .catch((error) => {
          console.error(error);
        });

      // Fetch transactions from database
      get(DBRefTransactions(props.storeId))
        .then((snapshot) => {
          const transactions: Transaction[] = [];
          snapshot.forEach((childSnapshot) => {
            const transaction = childSnapshot.val() as Transaction;
            transactions.push(transaction);
            return undefined;
          });
          setTransactions(transactions);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [props.storeId, props.visible]);

  return (
    <Dialog open={props.visible} onClose={() => props.onDismiss(false)}>
      <DialogTitle>Transaksi toko {store?.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {unixToDate(startDateUnix).date} - {unixToDate(endDateUnix).date}
        </Typography>
        <Typography variant="caption">Pilih jenis transaksi yang ingin diekspor</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleSaveToCsv(props.transactions.filter((t) => t.debit))}>
          Pendapatan
        </Button>
        <Button onClick={() => handleSaveToCsv(props.transactions, true)}>Semua</Button>
        <Button onClick={() => handleSaveToCsv(props.transactions.filter((t) => !t.debit))}>
          Pengeluaran
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionsExportDialog;
