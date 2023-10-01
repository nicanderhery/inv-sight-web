import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { get, ref, set, update } from 'firebase/database';
import React from 'react';
import { auth, database } from '../firebase';
import { StoreAddModalProps } from '../interfaces/components/store-add-modal-props';
import { Store } from '../interfaces/entities/store';
import { updateGlobalSnackbar } from '../state/global-snackbar';
import { DBRefManagerStore, DBRefStore } from '../utils/db-functions';
import { generateRandomId } from '../utils/generator';

const StoreAddModal: React.FC<StoreAddModalProps> = (props) => {
  const user = auth.currentUser;

  const [preventDoubleSubmit, setPreventDoubleSubmit] = React.useState(false);
  const [storeInput, setStoreInput] = React.useState('');
  const [inputRequiredError, setInputRequiredError] = React.useState(false);

  const submitStore = async () => {
    try {
      // Prevent double submit
      if (preventDoubleSubmit) {
        return;
      }
      setPreventDoubleSubmit(true);

      if (!storeInput) {
        setInputRequiredError(true);
        return;
      }

      // Check whether user is signed in
      if (!user) {
        throw 'User is not signed in';
      }

      // Check whether it's a store code or store name
      const isStoreCode = storeInput.toLowerCase().startsWith('id-') && storeInput.length === 9;
      if (isStoreCode) {
        // Check whether user is already a manager of the store
        const managerSnapshot = await get(DBRefManagerStore(user.uid, storeInput));
        if (managerSnapshot.exists()) {
          throw `Anda sudah menjadi manager toko dengan kode ${storeInput}`;
        }

        const storeSnapshot = await get(DBRefStore(storeInput));
        if (!storeSnapshot.exists()) {
          throw `Toko dengan kode ${storeInput} tidak ditemukan`;
        }

        const store = storeSnapshot.val() as Store;
        await set(DBRefManagerStore(user.uid, storeInput), true);
        updateGlobalSnackbar('success', `Anda menjadi manager toko ${store.name}`);
      } else {
        // Create new store object
        const store: Store = {
          id: generateRandomId(6),
          createdAt: new Date().getTime(),
          name: storeInput,
          owner: user.uid,
        };

        const updates = {
          [DBRefStore(store.id).toString()]: store,
          [DBRefManagerStore(user.uid, store.id).toString()]: true,
        };
        await update(ref(database), updates);

        updateGlobalSnackbar('success', `Toko ${store.name} berhasil ditambahkan`);
      }

      // Close modal
      props.onDismiss(false);
      console.log('modal closed');
    } catch (error) {
      console.error(error);
      updateGlobalSnackbar('error', JSON.stringify(error));
    } finally {
      setTimeout(() => {
        setPreventDoubleSubmit(false);
      }, 100);
    }
  };

  const handleStoreInputSubmit = () => {
    submitStore().catch((error) => {
      console.error(error);
      updateGlobalSnackbar('error', JSON.stringify(error));
    });
  };

  React.useEffect(() => {
    // Clear all inputs when modal is closed
    setTimeout(() => {
      setStoreInput('');
      setInputRequiredError(false);
    }, 100);
  }, [props.visible]);

  return (
    <Dialog disableRestoreFocus open={props.visible} onClose={() => props.onDismiss(false)}>
      <DialogTitle>Tambahkan toko baru atau kode toko yang sudah ada</DialogTitle>
      <DialogContent>
        <TextField
          label="Nama toko atau kode toko"
          value={storeInput}
          onChange={(event) => setStoreInput(event.target.value)}
          onSubmit={handleStoreInputSubmit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleStoreInputSubmit();
            }
          }}
          fullWidth
          autoFocus
          error={inputRequiredError && !storeInput}
          helperText={inputRequiredError && !storeInput ? 'Teks tidak boleh kosong' : ''}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" disabled={preventDoubleSubmit} onClick={handleStoreInputSubmit}>
          Tambahkan toko
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoreAddModal;
