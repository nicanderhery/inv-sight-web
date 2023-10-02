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
import CalendarChooseDate from './calendar-choose-date';

const ItemAddModal: React.FC<ItemAddModalProps> = (props) => {
  const user = auth.currentUser;

  const [preventDoubleSubmit, setPreventDoubleSubmit] = React.useState(false);
  const [itemNameInput, setItemNameInput] = React.useState('');
  const [itemWeightInput, setItemWeightInput] = React.useState('');
  const [itemModelInput, setItemModelInput] = React.useState('');
  const [price, setPrice] = React.useState<number>(0);
  const [quantity, setQuantity] = React.useState(1);
  const [inputRequiredError, setInputRequiredError] = React.useState(false);
  const [date, setDate] = React.useState<dayjs.Dayjs | null>(null);

  const itemWeightRef = React.useRef<HTMLDivElement | null>(null);
  const itemModelRef = React.useRef<HTMLDivElement | null>(null);
  const itemPriceRef = React.useRef<HTMLDivElement | null>(null);

  const enum ItemInputType {
    Name,
    Weight,
    Model,
  }

  const handleItemInputSubmit = () => {
    try {
      // Prevent double submit
      if (preventDoubleSubmit) {
        return;
      }
      setPreventDoubleSubmit(true);

      if (!itemNameInput || !itemWeightInput || !itemModelInput) {
        setInputRequiredError(true);
        return;
      }

      // Create item
      const item: Item = {
        id: generateId(),
        createdAt:
          date?.add(23, 'hour').add(59, 'minute').add(59, 'second').toDate().getTime() ??
          new Date().getTime(),
        name: itemNameInput,
        weight: itemWeightInput,
        model: itemModelInput,
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

  const itemSuggestions = React.useMemo(() => {
    // Use array of sets to prevent duplicate suggestions
    const nameSuggestions = new Set<string>();
    const weightSuggestions = new Set<string>();
    const modelSuggestions = new Set<string>();
    props.items.forEach((item) => {
      nameSuggestions.add(item.name);
      weightSuggestions.add(item.weight);
      modelSuggestions.add(item.model);
    });
    return [nameSuggestions, weightSuggestions, modelSuggestions];
  }, [props.items]);

  React.useEffect(() => {
    // Clear all inputs when modal is closed
    setTimeout(() => {
      setItemNameInput('');
      setItemWeightInput('');
      setItemModelInput('');
      setPrice(0);
      setQuantity(1);
      setInputRequiredError(false);
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
          options={Array.from(itemSuggestions[ItemInputType.Name])}
          onInputChange={(_event, value) => {
            setItemNameInput(value);
          }}
          value={itemNameInput}
          onChange={(_event, value) => setItemNameInput(value ?? '')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              itemWeightRef.current?.focus();
            }
          }}
          fullWidth
          autoFocus
          renderInput={(params) => (
            <TextField
              {...params}
              label="Nama barang"
              error={inputRequiredError && !itemNameInput}
              helperText={
                inputRequiredError && !itemNameInput ? 'Nama barang tidak boleh kosong' : ''
              }
            />
          )}
        />

        <Autocomplete
          sx={{ my: '1rem' }}
          freeSolo
          disablePortal
          options={Array.from(itemSuggestions[ItemInputType.Weight])}
          onInputChange={(_event, value) => {
            setItemWeightInput(value);
          }}
          value={itemWeightInput}
          onChange={(_event, value) => setItemWeightInput(value ?? '')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              itemModelRef.current?.focus();
            }
          }}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="Berat barang"
              inputRef={itemWeightRef}
              error={inputRequiredError && !itemWeightInput}
              helperText={
                inputRequiredError && !itemWeightInput ? 'Berat barang tidak boleh kosong' : ''
              }
            />
          )}
        />

        <Autocomplete
          sx={{ my: '1rem' }}
          freeSolo
          disablePortal
          options={Array.from(itemSuggestions[ItemInputType.Model])}
          onInputChange={(_event, value) => {
            setItemModelInput(value);
          }}
          value={itemModelInput}
          onChange={(_event, value) => setItemModelInput(value ?? '')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              itemPriceRef.current?.focus();
            }
          }}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label="Model barang"
              inputRef={itemModelRef}
              error={inputRequiredError && !itemModelInput}
              helperText={
                inputRequiredError && !itemModelInput ? 'Model barang tidak boleh kosong' : ''
              }
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
                handleItemInputSubmit();
              }
            }}
            fullWidth
            inputMode="numeric"
            inputRef={itemPriceRef}
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
        <CalendarChooseDate date={date} setDate={setDate} />
        <Button disabled={preventDoubleSubmit} onClick={handleItemInputSubmit}>
          Tambahkan barang
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemAddModal;
