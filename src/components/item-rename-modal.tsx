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
  const [name, setName] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [model, setModel] = React.useState('');
  const [requiredError, setRequiredError] = React.useState(false);
  const [duplicateDialogVisible, setDuplicateDialogVisible] = React.useState(false);
  const [duplicateItem, setDuplicateItem] = React.useState<Item>();

  const weightRef = React.useRef<HTMLDivElement | null>(null);
  const modelRef = React.useRef<HTMLDivElement | null>(null);

  const enum Type {
    Name,
    Weight,
    Model,
  }

  const handleSubmit = (duplicateConfirmed?: boolean) => {
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

      if (!props.stock) {
        updateGlobalSnackbar('error', 'Barang tidak ditemukan');
        return;
      }

      // Check whether item is changed
      if (
        props.stock.first.name === name &&
        props.stock.first.weight === weight &&
        props.stock.first.model === model
      ) {
        updateGlobalSnackbar('error', 'Tidak ada perubahan');
        return;
      }

      // Check whether user has acknowledged to merge duplicate item
      if (!duplicateConfirmed) {
        const existingItem = props.items.find(
          (item) => item.name === name && item.weight === weight && item.model === model,
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
        name: name,
        weight: weight,
        model: model,
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

  const options = React.useMemo(() => {
    // Use array of sets to prevent duplicate suggestions
    const names = new Set<string>();
    const weights = new Set<string>();
    const models = new Set<string>();
    props.items.forEach((item) => {
      if (item.id === props.stock?.first.id) {
        return;
      }
      names.add(item.name);
      weights.add(item.weight);
      models.add(item.model);
    });
    return [names, weights, models];
  }, [props.items, props.stock]);

  React.useEffect(() => {
    // Clear all inputs when modal is closed
    setTimeout(() => {
      setName('');
      setWeight('');
      setModel('');
      setRequiredError(false);
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
              handleSubmit();
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
      </DialogContent>

      <DialogActions>
        <Button disabled={preventDoubleSubmit} onClick={() => handleSubmit()}>
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
              handleSubmit(true);
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
