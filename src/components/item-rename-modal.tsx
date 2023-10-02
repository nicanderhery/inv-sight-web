import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { set } from 'firebase/database';
import React from 'react';
import ItemRenameModalProps from '../interfaces/components/item-rename-modal-props';
import Item from '../interfaces/entities/item';
import { updateGlobalSnackbar } from '../state/global-snackbar';
import { DBRefTransaction } from '../utils/db-functions';
import { generateId } from '../utils/generator';

const ItemRenameModal: React.FC<ItemRenameModalProps> = (props) => {
  const [preventDoubleSubmit, setPreventDoubleSubmit] = React.useState(false);
  const [itemNameInput, setItemNameInput] = React.useState('');
  const [itemWeightInput, setItemWeightInput] = React.useState('');
  const [itemModelInput, setItemModelInput] = React.useState('');
  const [inputRequiredError, setInputRequiredError] = React.useState(false);
  const [duplicateDialogVisible, setDuplicateDialogVisible] = React.useState(false);
  const [duplicateItem, setDuplicateItem] = React.useState<Item>();

  const itemWeightRef = React.useRef<HTMLDivElement | null>(null);
  const itemModelRef = React.useRef<HTMLDivElement | null>(null);

  const enum ItemInputType {
    Name,
    Weight,
    Model,
  }

  const handleItemRenameSubmit = (duplicateConfirmed?: boolean) => {
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

      if (!props.stock) {
        updateGlobalSnackbar('error', 'Barang tidak ditemukan');
        return;
      }

      // Check whether item is changed
      if (
        props.stock.first.name === itemNameInput &&
        props.stock.first.weight === itemWeightInput &&
        props.stock.first.model === itemModelInput
      ) {
        updateGlobalSnackbar('error', 'Tidak ada perubahan');
        return;
      }

      // Check whether user has acknowledged to merge duplicate item
      if (!duplicateConfirmed) {
        const existingItem = props.items.find(
          (item) =>
            item.name === itemNameInput &&
            item.weight === itemWeightInput &&
            item.model === itemModelInput,
        );
        if (existingItem) {
          setDuplicateDialogVisible(true);
          setDuplicateItem(existingItem);
          return;
        }
      }

      // Create item
      const item = duplicateItem ?? {
        ...props.stock.first,
        id: generateId(),
        name: itemNameInput,
        weight: itemWeightInput,
        model: itemModelInput,
      };

      // Update all transactions with the same item
      const transactions = props.transactions.filter(
        (transaction) => transaction.data?.item.id === props.stock!.first.id,
      );
      transactions.forEach((transaction) => {
        transaction.data!.item = item;
        set(DBRefTransaction(props.storeId, transaction.id), transaction).catch((error) => {
          console.error(error);
          updateGlobalSnackbar('error', `Transaksi ${transaction.id} gagal diubah`);
        });
      });

      // Close modal
      props.onDismiss(false);
      updateGlobalSnackbar('success', 'Barang berhasil diubah');
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
      if (item.id === props.stock?.first.id) {
        return;
      }
      nameSuggestions.add(item.name);
      weightSuggestions.add(item.weight);
      modelSuggestions.add(item.model);
    });
    return [nameSuggestions, weightSuggestions, modelSuggestions];
  }, [props.items, props.stock]);

  React.useEffect(() => {
    // Clear all inputs when modal is closed
    setTimeout(() => {
      setItemNameInput('');
      setItemWeightInput('');
      setItemModelInput('');
      setInputRequiredError(false);
      setDuplicateDialogVisible(false);
      setDuplicateItem(undefined);
    }, 100);
  }, [props.visible]);

  return (
    <Dialog disableRestoreFocus open={props.visible} onClose={() => props.onDismiss(false)}>
      <DialogTitle>
        Ubah barang {props.stock?.first.name} {props.stock?.first.weight} {props.stock?.first.model}
      </DialogTitle>

      <DialogContent>
        <Autocomplete
          sx={{ my: '0.5rem' }}
          freeSolo
          disablePortal
          options={Array.from(itemSuggestions[ItemInputType.Name])}
          onInputChange={(_event, value) => {
            setItemNameInput(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Nama barang"
              value={itemNameInput}
              onChange={(event) => setItemNameInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  itemWeightRef.current?.focus();
                }
              }}
              fullWidth
              autoFocus
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
          renderInput={(params) => (
            <TextField
              {...params}
              label="Berat barang"
              value={itemWeightInput}
              onChange={(event) => setItemWeightInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  itemModelRef.current?.focus();
                }
              }}
              fullWidth
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
          renderInput={(params) => (
            <TextField
              {...params}
              label="Model barang"
              value={itemModelInput}
              onChange={(event) => setItemModelInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleItemRenameSubmit();
                }
              }}
              fullWidth
              inputRef={itemModelRef}
              error={inputRequiredError && !itemModelInput}
              helperText={
                inputRequiredError && !itemModelInput ? 'Model barang tidak boleh kosong' : ''
              }
            />
          )}
        />
      </DialogContent>

      <DialogActions>
        <Button disabled={preventDoubleSubmit} onClick={() => handleItemRenameSubmit()}>
          Ubah barang
        </Button>
      </DialogActions>

      <Dialog open={duplicateDialogVisible} onClose={() => setDuplicateDialogVisible(false)}>
        <DialogTitle>
          {duplicateItem?.name} {duplicateItem?.weight} {duplicateItem?.model}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">Barang sudah ada</Typography>
          <Typography variant="body1">Yakin ingin menggabungkan stok barang?</Typography>
          <Typography variant="body1" color={'error.main'}>
            Barang yang sudah digabung tidak dapat dipisah kembali!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogVisible(false)}>Tidak</Button>
          <Button
            onClick={() => {
              setDuplicateDialogVisible(false);
              handleItemRenameSubmit(true);
            }}
          >
            Ya
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ItemRenameModal;
