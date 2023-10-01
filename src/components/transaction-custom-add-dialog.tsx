import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { set } from 'firebase/database';
import React from 'react';
import { auth } from '../firebase';
import TransactionCustomAddDialogProps from '../interfaces/components/transaction-custom-add-dialog-props';
import Transaction from '../interfaces/entities/transaction';
import { updateGlobalSnackbar } from '../state/global-snackbar';
import { DBRefTransaction } from '../utils/db-functions';
import { generateId } from '../utils/generator';
import CalendarChooseDate from './calendar-choose-date';

const TransactionCustomAddDialog: React.FC<TransactionCustomAddDialogProps> = (props) => {
  const user = auth.currentUser;

  const [preventDoubleSubmit, setPreventDoubleSubmit] = React.useState(false);
  const [transactionNameInput, setTransactionNameInput] = React.useState('');
  const [price, setPrice] = React.useState(0);
  const [inputRequiredError, setInputRequiredError] = React.useState(false);
  const [date, setDate] = React.useState<dayjs.Dayjs | null>(null);

  const transactionPriceInputRef = React.useRef<HTMLDivElement | null>(null);

  const handleTransactionInputSubmit = (debit: boolean) => {
    // Prevent double submit
    if (preventDoubleSubmit) {
      return;
    }
    setPreventDoubleSubmit(true);

    if (!transactionNameInput || !price) {
      setInputRequiredError(true);
      return;
    }

    // Create transaction
    const transaction: Transaction = {
      id: generateId(),
      createdAt:
        date?.add(23, 'hour').add(59, 'minute').add(59, 'second').toDate().getTime() ??
        new Date().getTime(),
      description: transactionNameInput,
      price: price,
      debit: debit,
      doneBy: user?.displayName ?? 'Unknown',
    };

    // Add transaction to database
    set(DBRefTransaction(props.storeId, transaction.id), transaction).catch((error) => {
      console.error(error);
      updateGlobalSnackbar('error', `Transaksi ${transaction.description} gagal ditambahkan`);
    });

    // Close modal
    props.onDismiss(false);
    updateGlobalSnackbar('success', `Transaksi ${transaction.description} ditambahkan`);
    setTimeout(() => {
      setPreventDoubleSubmit(false);
    }, 100);
  };

  React.useEffect(() => {
    // Clear all inputs when modal is closed
    setTimeout(() => {
      setTransactionNameInput('');
      setPrice(0);
      setInputRequiredError(false);
      setDate(null);
    }, 100);
  }, [props.visible]);

  return (
    <Dialog disableRestoreFocus open={props.visible} onClose={() => props.onDismiss(false)}>
      <DialogTitle>Transaksi khusus</DialogTitle>
      <DialogContent>
        <TextField
          label="Nama transaksi"
          value={transactionNameInput}
          onChange={(event) => setTransactionNameInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              transactionPriceInputRef.current?.focus();
            }
          }}
          fullWidth
          autoFocus
          error={inputRequiredError && !transactionNameInput}
          helperText={
            inputRequiredError && !transactionNameInput ? 'Nama transaksi tidak boleh kosong' : ''
          }
        />

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: '0.5rem' }}>
            Rp
          </Typography>
          <TextField
            label="Harga"
            value={price.toString()}
            onChange={(event) => {
              const text = event.target.value;
              setPrice(text ? parseInt(text) : 0);
            }}
            fullWidth
            inputMode="numeric"
            inputRef={transactionPriceInputRef}
            error={inputRequiredError && !transactionNameInput}
            helperText={inputRequiredError && !price ? 'Harga tidak boleh kosong' : ''}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <CalendarChooseDate date={date} setDate={setDate} />
        <Button disabled={preventDoubleSubmit} onClick={() => handleTransactionInputSubmit(true)}>
          Pendapatan
        </Button>
        <Button disabled={preventDoubleSubmit} onClick={() => handleTransactionInputSubmit(false)}>
          Pengeluaran
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionCustomAddDialog;
