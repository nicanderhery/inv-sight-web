import { mdiLogin, mdiLogout } from '@mdi/js';
import Icon from '@mdi/react';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { GoogleAuthProvider, User, signInWithPopup, signOut } from 'firebase/auth';
import React from 'react';
import { auth } from '../firebase.ts';

const Appbar = () => {
  const [user, setUser] = React.useState<User | null>(null);

  const onLogin = () => {
    if (user) {
      signOut(auth).catch((error) => {
        console.error(error);
      });
      return;
    }

    const provider = new GoogleAuthProvider();
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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          InvSight
        </Typography>
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
