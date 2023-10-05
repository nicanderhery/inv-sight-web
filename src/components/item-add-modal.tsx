import { mdiMinus, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Autocomplete,
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
import ItemAddModalProps from '../interfaces/components/item-add-modal-props';
import Item from '../interfaces/entities/item';
import Transaction from '../interfaces/entities/transaction';
import { updateGlobalSnackbar } from '../state/global-snackbar';
import { DBRefTransaction } from '../utils/db-functions';
import { generateId } from '../utils/generator';
import Calendar from './calendar.tsx';

const ItemAddModal: React.FC<ItemAddModalProps> = (props) => {
  const user = auth.currentUser;

  const [preventDoubleSubmit, setPreventDoubleSubmit] = React.useState(false);
  const [name, setName] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [model, setModel] = React.useState('');
  const [price, setPrice] = React.useState<number>(0);
  const [quantity, setQuantity] = React.useState(1);
  const [requiredError, setRequiredError] = React.useState(false);
  const [date, setDate] = React.useState<dayjs.Dayjs | null>(null);

  const weightRef = React.useRef<HTMLDivElement | null>(null);
  const modelRef = React.useRef<HTMLDivElement | null>(null);
  const priceRef = React.useRef<HTMLDivElement | null>(null);

  const enum Type {
    Name,
    Weight,
    Model,
  }

  const handleSubmit = () => {
    try {
      // Prevent double submit
      if (preventDoubleSubmit) {
        return;
      }
      setPreventDoubleSubmit(true);

      if (!name || !weight || !model) {
        setRequiredError(true);
        return;
      }

      // Check whether item already exists
      if (
        props.items.some(
          (item) => item.name === name && item.weight === weight && item.model === model,
        )
      ) {
        updateGlobalSnackbar('error', 'Barang sudah ada');
        return;
      }

      // Create item
      const item: Item = {
        id: generateId(),
        createdAt:
          date?.add(23, 'hour').add(59, 'minute').add(59, 'second').toDate().getTime() ??
          new Date().getTime(),
        name: name,
        weight: weight,
        model: model,
      };

      // Create transaction
      const transaction: Transaction = {
        id: generateId(),
        createdAt:
          date?.add(23, 'hour').add(59, 'minute').add(59, 'second').toDate().getTime() ??
          new Date().getTime(),
        data: {
          item: item,
          quantity: quantity,
        },
        description: 'Pembelian barang baru',
        price: price,
        debit: false,
        doneBy: user?.displayName ?? 'Unknown',
      };

      const itemMessage = `${item.name} ${item.weight} ${item.model}`;

      // Add transaction to database
      set(DBRefTransaction(props.storeId, transaction.id), transaction).catch((error) => {
        console.error(error);
        updateGlobalSnackbar('error', `${itemMessage} gagal ditambahkan`);
      });

      // Close modal
      props.onDismiss(false);
      updateGlobalSnackbar('success', `${itemMessage} ditambahkan`);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setPreventDoubleSubmit(false);
      }, 100);
    }
  };

  const options = React.useMemo(() => {
    // Use array of sets to prevent duplicate suggestions
    const names = new Set<string>();
    const weights = new Set<string>();
    const models = new Set<string>();
    props.items.forEach((item) => {
      names.add(item.name);
      weights.add(item.weight);
      models.add(item.model);
    });
    return [names, weights, models];
  }, [props.items]);

  React.useEffect(() => {
    // Clear all inputs when modal is closed
    setTimeout(() => {
      setName('');
      setWeight('');
      setModel('');
      setPrice(0);
      setQuantity(1);
      setRequiredError(false);
      setDate(null);
    }, 100);
  }, [props.visible]);

  return (
    <Dialog disableRestoreFocus open={props.visible} onClose={() => props.onDismiss(false)}>
      <DialogTitle>Tambahkan barang baru</DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ my: '0.5rem' }}
          freeSolo
          disablePortal
          options={Array.from(options[Type.Name])}
          onInputChange={(_event, value) => {
            setName(value);
          }}
          value={name}
          onChange={(_event, value) => setName(value ?? '')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              weightRef.current?.focus();
            }
          }}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              label="Nama barang"
              error={requiredError && !name}
              helperText={requiredError && !name ? 'Nama barang tidak boleh kosong' : ''}
            />
          )}
        />

        <Autocomplete
          sx={{ my: '1rem' }}
          freeSolo
          disablePortal
          options={Array.from(options[Type.Weight])}
          onInputChange={(_event, value) => {
            setWeight(value);
          }}
          value={weight}
          onChange={(_event, value) => setWeight(value ?? '')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              modelRef.current?.focus();
            }
          }}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="Berat barang"
              inputRef={weightRef}
              error={requiredError && !weight}
              helperText={requiredError && !weight ? 'Berat barang tidak boleh kosong' : ''}
            />
          )}
        />

        <Autocomplete
          sx={{ my: '1rem' }}
          freeSolo
          disablePortal
          options={Array.from(options[Type.Model])}
          onInputChange={(_event, value) => {
            setModel(value);
          }}
          value={model}
          onChange={(_event, value) => setModel(value ?? '')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              priceRef.current?.focus();
            }
          }}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="Model barang"
              inputRef={modelRef}
              error={requiredError && !model}
              helperText={requiredError && !model ? 'Model barang tidak boleh kosong' : ''}
            />
          )}
        />

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
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSubmit();
              }
            }}
            fullWidth
            inputMode="numeric"
            inputRef={priceRef}
          />
        </Box>

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
          <IconButton onClick={() => setQuantity(quantity + 1)}>
            <Icon path={mdiPlus} size={1} />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Calendar date={date} setDate={setDate} />
        <Button disabled={preventDoubleSubmit} onClick={handleSubmit}>
          Tambahkan barang
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemAddModal;
