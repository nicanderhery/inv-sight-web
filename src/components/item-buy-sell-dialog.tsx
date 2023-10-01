import { mdiMinus, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { set } from 'firebase/database';
import React from 'react';
import { auth } from '../firebase';
import ItemBuySellDialogProps from '../interfaces/components/item-buy-sell-dialog-props';
import Transaction from '../interfaces/entities/transaction';
import { updateGlobalSnackbar } from '../state/global-snackbar';
import { DBRefTransaction } from '../utils/db-functions';
import { generateId } from '../utils/generator';
import CalendarChooseDate from './calendar-choose-date';

const ItemBuySellDialog: React.FC<ItemBuySellDialogProps> = (props) => {
  const user = auth.currentUser;

  const [preventDoubleSubmit, setPreventDoubleSubmit] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const [price, setPrice] = React.useState<number>(0);
  const [date, setDate] = React.useState<dayjs.Dayjs | null>(null);

  const handleItemBuySellSubmit = (sell: boolean) => {
    try {
      // Prevent double submit
      if (preventDoubleSubmit) {
        return;
      }
      setPreventDoubleSubmit(true);

      if (!props.stock) {
        return;
      }

      // Create transaction
      const transaction: Transaction = {
        id: generateId(),
        createdAt:
          date?.add(23, 'hour').add(59, 'minute').add(59, 'second').toDate().getTime() ??
          new Date().getTime(),
        data: {
          item: props.stock.first,
          quantity: quantity,
        },
        description: '',
        price: price,
        debit: sell,
        doneBy: user?.displayName ?? 'Unknown',
      };

      const itemMessage = `${props.stock.first.name} ${props.stock.first.weight} ${props.stock.first.model}`;

      // Add transaction to database
      set(DBRefTransaction(props.storeId, transaction.id), transaction).catch((error) => {
        console.error(error);
        updateGlobalSnackbar('error', `${itemMessage} gagal ${sell ? 'dijual' : 'dibeli'}`);
      });

      // Close modal
      props.onDismiss(false);
      updateGlobalSnackbar('success', `${itemMessage} ${sell ? 'dijual' : 'dibeli'}`);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setPreventDoubleSubmit(false);
      }, 100);
    }
  };

  React.useEffect(() => {
    // Clear all inputs when modal is closed
    if (!props.visible) {
      setTimeout(() => {
        setQuantity(1);
        setPrice(0);
        setDate(null);
      }, 100);
    }
  }, [props.visible]);

  return (
    <Dialog open={props.visible} onClose={() => props.onDismiss(false)}>
      <DialogTitle>
        {props.stock?.first.name} {props.stock?.first.weight} {props.stock?.first.model}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {props.sell ? 'Jumlah barang yang akan dijual' : 'Jumlah barang yang akan dibeli'}
        </Typography>
        <Box
          sx={{
            marginY: '1rem',
          }}
        >
          <IconButton onClick={() => setQuantity(quantity <= 1 ? 1 : quantity - 1)}>
            <Icon path={mdiMinus} size={1} />
          </IconButton>
          <Chip
            variant="outlined"
            sx={{ borderRadius: '0.5rem', marginX: '0.5rem' }}
            label={quantity}
          />
          <IconButton
            onClick={() => {
              // If it is a sell dialog, then we can't sell more than the quantity
              if (props.sell) {
                // If there is no stock, then we can't sell it
                if (!props.stock) {
                  return;
                }
                if (quantity >= props.stock.second) {
                  return;
                }
              }

              setQuantity(quantity + 1);
            }}
          >
            <Icon path={mdiPlus} size={1} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: '0.5rem' }}>
            Rp
          </Typography>
          <TextField
            label="Harga barang (opsional)"
            value={price.toString()}
            onChange={(event) => {
              const text = event.target.value;
              setPrice(text ? parseInt(text) : 0);
            }}
            fullWidth
            inputMode="numeric"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleItemBuySellSubmit(props.sell);
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <CalendarChooseDate date={date} setDate={setDate} />
        <Button disabled={preventDoubleSubmit} onClick={() => handleItemBuySellSubmit(props.sell)}>
          {props.sell ? 'Jual' : 'Beli'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemBuySellDialog;
