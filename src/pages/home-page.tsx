import { mdiStore } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, List, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import { User } from 'firebase/auth';
import { get, onValue } from 'firebase/database';
import React from 'react';
import { useNavigate } from 'react-router';
import MiddleFab from '../components/middle-fab';
import StoreAddModal from '../components/store-add-modal';
import { auth } from '../firebase';
import Store from '../interfaces/entities/store';
import { DBRefManagerStores, DBRefStore } from '../utils/db-functions';

const HomePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = React.useState<User | null>(null);
  const [stores, setStores] = React.useState<Store[]>([]);

  // Add store modal
  const [isAddStoreModalVisible, setIsAddStoreModalVisible] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      setStores([]);
    }

    // Fetch stores from database
    const unsubscribe = onValue(DBRefManagerStores(user?.uid ?? ''), (snapshot) => {
      const storeIds: string[] = [];
      snapshot.forEach((childSnapshot) => {
        const storeId = childSnapshot.key;
        storeIds.push(storeId);
      });

      setStores([]);
      storeIds.map((storeId) => {
        get(DBRefStore(storeId))
          .then((storeSnapshot) => {
            if (!storeSnapshot.exists()) {
              return;
            }
            const store: Store = storeSnapshot.val() as Store;
            setStores((prevStores) => [...prevStores, store]);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    });

    // Clear all listeners when no longer needed
    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Clear all listeners when no longer needed
    return () => unsubscribe();
  }, []);

  return (
    <Box
      sx={{
        padding: '2rem',
      }}
    >
      {user ? (
        <Box>
          <List>
            {stores.map((store) => {
              return (
                <ListItemButton
                  key={store.id}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    boxShadow: 1,
                  }}
                  onClick={() => navigate(`/store/${store.id}`)}
                >
                  <ListItemAvatar>
                    <Icon path={mdiStore} size={2} />
                  </ListItemAvatar>
                  <ListItemText primary={store.name} secondary="Ketuk untuk melihat toko" />
                </ListItemButton>
              );
            })}
          </List>

          <MiddleFab message="Tambahkan toko" onClick={() => setIsAddStoreModalVisible(true)} />

          <StoreAddModal visible={isAddStoreModalVisible} onDismiss={setIsAddStoreModalVisible} />
        </Box>
      ) : (
        <Box>
          <Typography variant="h4" align="center" gutterBottom>
            Selamat datang di InvSight
          </Typography>
          <Typography align="center" gutterBottom>
            Silakan masuk untuk melanjutkan
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
