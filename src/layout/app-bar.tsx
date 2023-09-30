import { mdiLogin, mdiLogout } from '@mdi/js';
import Icon from '@mdi/react';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from 'firebase/auth';
import React from 'react';
import { useNavigate } from 'react-router';
import { auth } from '../firebase.ts';

const Appbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = React.useState<User | null>(null);

  const onLogin = () => {
    if (user) {
      signOut(auth).catch((error) => {
        console.error(error);
      });
      return;
    }

    const provider = new GoogleAuthProvider();

    // Check whether it is a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      signInWithRedirect(auth, provider).catch((error) => {
        console.error(error);
      });
      getRedirectResult(auth).catch((error) => {
        console.error(error);
      });
      return;
    }

    signInWithPopup(auth, provider).catch((error) => {
      console.error(error);
    });
  };

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Clear all listeners when no longer needed
    return () => unsubscribe();
  }, []);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          InvSight
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<Icon path={user ? mdiLogout : mdiLogin} size={1} />}
          color="inherit"
          onClick={onLogin}
        >
          {user ? 'Keluar' : 'Masuk'}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Appbar;
