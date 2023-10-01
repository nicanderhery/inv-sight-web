import {
  mdiBankTransfer,
  mdiContentCopy,
  mdiFileDocumentMultiple,
  mdiPlus,
  mdiWallet,
} from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Chip, Fab, List } from '@mui/material';
import { get, onValue } from 'firebase/database';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ItemAddModal from '../components/item-add-modal';
import ItemBuySellDialog from '../components/item-buy-sell-dialog';
import ItemCard from '../components/item-card';
import TransactionCustomAddDialog from '../components/transaction-custom-add-dialog';
import Item from '../interfaces/entities/item';
import Transaction from '../interfaces/entities/transaction';
import Pair from '../interfaces/types';
import { updateGlobalSnackbar } from '../state/global-snackbar';
import { DBRefStore, DBRefTransactions } from '../utils/db-functions';
import { numberToMoneyIndonesia } from '../utils/formatter';

const StorePage = () => {
  const storeId = useParams<{ storeId: string }>().storeId!;
  const navigate = useNavigate();

  const [transactions, setTransactions] = React.useState<Transaction[]>();

  // Custom transaction dialog
  const [isCustomTransactionDialogVisible, setIsCustomTransactionDialogVisible] =
    React.useState(false);

  // Add item modal
  const [isAddItemModalVisible, setIsAddItemModalVisible] = React.useState(false);

  // Buy or sell item dialog
  const [isBuySellDialogVisible, setIsBuySellDialogVisible] = React.useState(false);
  const [stock, setStock] = React.useState<Pair<Item, number>>();
  const [sell, setSell] = React.useState(false);

  const balance = React.useMemo(() => {
    // Calculate balance from transactions
    return (
      transactions?.reduce(
        (accumulator, transaction) =>
          accumulator + (transaction.debit ? 1 : -1) * transaction.price,
        0,
      ) ?? 0
    );
  }, [transactions]);

  const inventory = React.useMemo(() => {
    const newInventory = new Map<string, Pair<Item, number>>();
    transactions?.forEach((transaction) => {
      const data = transaction.data;
      if (!data) {
        return;
      }

      const itemId = data.item.id;
      const quantity = data.quantity;
      const currentQuantity = newInventory.get(itemId)?.second ?? 0;
      newInventory.set(itemId, {
        first: data.item,
        second: currentQuantity + (transaction.debit ? -1 : 1) * quantity,
      });
    });
    return newInventory;
  }, [transactions]);

  const items = React.useMemo(() => {
    return Array.from(inventory.values()).map((pair) => pair.first);
  }, [inventory]);

  React.useEffect(() => {
    // Check store from database
    get(DBRefStore(storeId))
      .then((snapshot) => {
        if (!snapshot.exists()) {
          navigate('/');
          updateGlobalSnackbar('error', 'Toko tidak ditemukan');
        }
      })
      .catch((error) => {
        console.error(error);
        navigate('/');
        updateGlobalSnackbar('error', JSON.stringify(error));
      });

    // Fetch transactions from database
    const unsubscribe = onValue(DBRefTransactions(storeId), (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach((childSnapshot) => {
        const transaction = childSnapshot.val() as Transaction;
        transactions.push(transaction);
      });
      setTransactions(transactions);
    });

    // Clear all listeners when no longer needed
    return () => {
      unsubscribe();
    };
  }, [storeId, navigate]);

  return (
    <Box>
      <Box sx={{ padding: '2rem' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Chip
            avatar={<Icon path={mdiContentCopy} size={1} />}
            label={`${storeId} - Salin kode toko`}
            sx={{
              alignSelf: 'center',
              marginBottom: '1rem',
            }}
            onClick={() => {
              navigator.clipboard.writeText(storeId).catch(() => {
                updateGlobalSnackbar('error', 'Gagal menyalin kode toko');
              });
              updateGlobalSnackbar('success', 'Kode toko disalin');
            }}
          />
          <Chip
            avatar={<Icon path={mdiWallet} size={1} />}
            label={`Saldo: ${numberToMoneyIndonesia(balance)}`}
            sx={{
              alignSelf: 'center',
              marginBottom: '1rem',
            }}
          />
          <Chip
            avatar={<Icon path={mdiBankTransfer} size={1} />}
            label="Tambahkan transaksi khusus"
            sx={{
              alignSelf: 'center',
              marginBottom: '1rem',
            }}
            onClick={() => setIsCustomTransactionDialogVisible(true)}
          />
          <Chip
            avatar={<Icon path={mdiFileDocumentMultiple} size={1} />}
            label="Lihat transaksi"
            sx={{
              alignSelf: 'center',
              marginBottom: '1rem',
            }}
            onClick={() => navigate(`/store/${storeId}/transactions`)}
          />
        </Box>
        <List
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
          }}
        >
          {Array.from(inventory.values()).map((stock) => {
            return (
              <ItemCard
                key={stock.first.id}
                stock={stock}
                setIsDialogVisible={setIsBuySellDialogVisible}
                setStock={setStock}
                setSell={setSell}
              />
            );
          })}
        </List>

        <Fab
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '4rem',
          }}
          variant="extended"
          color="primary"
          onClick={() => setIsAddItemModalVisible(true)}
        >
          <Icon path={mdiPlus} size={1} />
          Tambahkan barang
        </Fab>

        <TransactionCustomAddDialog
          visible={isCustomTransactionDialogVisible}
          onDismiss={() => setIsCustomTransactionDialogVisible(false)}
          storeId={storeId}
        />

        <ItemAddModal
          visible={isAddItemModalVisible}
          onDismiss={setIsAddItemModalVisible}
          storeId={storeId}
          items={items}
        />

        <ItemBuySellDialog
          visible={isBuySellDialogVisible}
          onDismiss={setIsBuySellDialogVisible}
          storeId={storeId}
          stock={stock}
          sell={sell}
        />
      </Box>
    </Box>
  );
};

export default StorePage;
