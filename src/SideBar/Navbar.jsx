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
  Alert,
  useMediaQuery // Import useMediaQuery
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Menu as MenuIcon // Import MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NavBar({
  toggleDarkMode,
  darkMode,
  handleLogout,
  successMessage,
  setSuccessMessage,
  toggleSidebar // Add toggleSidebar prop
}) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Detect small screens
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
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2, display: { md: 'none' } }} // Show only on mobile
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" noWrap={isSmallScreen}>
          My Form Creation
        </Typography>

        {userName && (
          <Typography
            variant="body1"
            sx={{ fontWeight: 'bold', ml: isSmallScreen ? 1 : 15 }}
            noWrap={isSmallScreen}
          >
            Welcome, {userName}
          </Typography>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: isSmallScreen ? 1 : 2 }}>
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
