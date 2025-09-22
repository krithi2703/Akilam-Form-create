// SideBar/NavBar.jsx
import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  useTheme,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Navbar({
  toggleDarkMode,
  darkMode,
  handleLogout,
  successMessage,
  setSuccessMessage
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedName = sessionStorage.getItem('userName') || localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  const handleLogoutClick = () => {
    // clear everything
    localStorage.clear();

    if (typeof handleLogout === "function") {
      handleLogout();
    }

    // redirect to login/register and replace history
    navigate("/", { replace: true });
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div">
          My Form Creation
        </Typography>

        {userName && (
          <Typography
            variant="body1"
            sx={{ fontWeight: 'bold', ml: 15 }}
          >
            Welcome, {userName}
          </Typography>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightIcon /> : <DarkIcon />}
          </IconButton>
          <Button color="inherit" onClick={handleLogoutClick}>
            Logout
          </Button>
        </Box>
      </Toolbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}