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
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Divider,
  Badge,
  Fade
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  Dashboard,
  Notifications,
  Rocket,
  Star,
  Palette,
  Gradient
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';

// Custom animations
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function NavBar({
  toggleDarkMode,
  darkMode,
  handleLogout,
  successMessage,
  setSuccessMessage,
  toggleSidebar
}) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [userInitial, setUserInitial] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const storedName = sessionStorage.getItem('userName') || localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
      setUserInitial(storedName.charAt(0).toUpperCase());
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    localStorage.clear();
    sessionStorage.clear();

    if (typeof handleLogout === "function") {
      handleLogout();
    }

    navigate("/", { replace: true });
  };

  const handleDashboardClick = () => {
    handleMenuClose();
    navigate("/dashboard");
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/profile");
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        background: darkMode 
          ? `linear-gradient(135deg, 
             ${isScrolled ? '#0d47a1' : '#1a237e'} 0%, 
             ${isScrolled ? '#1976d2' : '#283593'} 50%, 
             #3949ab 100%)`
          : `linear-gradient(135deg, 
             ${isScrolled ? '#1565c0' : '#1976d2'} 0%, 
             ${isScrolled ? '#1976d2' : '#2196f3'} 50%, 
             #42a5f5 100%)`,
        boxShadow: isScrolled 
          ? '0 8px 32px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(33,150,243,0.2)',
        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}`,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'transparent',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, 
            transparent 30%, 
            rgba(255,255,255,0.1) 50%, 
            transparent 70%)`,
          animation: `${shimmerAnimation} 3s infinite linear`,
          opacity: 0.6
        }
      }}
    >
      <Toolbar sx={{ 
        minHeight: { xs: 68, sm: 76 },
        position: 'relative',
        zIndex: 1
      }}>
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            left: '10%',
            animation: `${floatAnimation} 6s ease-in-out infinite`,
            opacity: 0.7
          }}
        >
          <Star sx={{ fontSize: 16, color: '#ffffff' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: '20%',
            animation: `${floatAnimation} 4s ease-in-out infinite 1s`,
            opacity: 0.5
          }}
        >
          <Rocket sx={{ fontSize: 12, color: '#ffffff' }} />
        </Box>

        {/* Hamburger Menu for Mobile */}
        <Fade in timeout={800}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
              p: 1.5,
              color: '#ffffff',
              '&:hover': {
                background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.3))',
                transform: 'scale(1.1) rotate(90deg)',
                boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                color: '#ffffff'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Fade>

        {/* Logo/Brand Name */}
        <Fade in timeout={1000}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              animation: `${pulseAnimation} 3s infinite`,
              '&:hover': {
                animation: 'none',
                transform: 'scale(1.05)'
              },
              transition: 'transform 0.3s ease'
            }}
            onClick={() => navigate('/dashboard')}
          >
            <Rocket 
              sx={{ 
                mr: 1, 
                fontSize: { xs: 28, sm: 32 },
                animation: `${floatAnimation} 3s ease-in-out infinite`,
                color: '#ffffff'
              }} 
            />
            <Typography 
              variant="h6" 
              component="div" 
              noWrap
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                background: 'linear-gradient(45deg, #ffffff 0%, #e3f2fd 50%, #ffffff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                letterSpacing: { xs: 0, sm: 1 },
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: 0,
                  width: '100%',
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
                  transform: 'scaleX(0)',
                  transition: 'transform 0.3s ease'
                },
                '&:hover::after': {
                  transform: 'scaleX(1)'
                }
              }}
            >
              FormCraft
            </Typography>
          </Box>
        </Fade>

        {/* Welcome Message */}
        {userName && (
          <Fade in timeout={1200}>
            <Typography
              variant="body1"
              sx={{ 
                fontWeight: '700', 
                ml: { xs: 1, sm: 3, md: 5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                display: { xs: 'none', sm: 'block' },
                color: '#ffffff',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                position: 'relative',
                padding: '6px 16px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)'
              }}
              noWrap
            >
              👋 Welcome, {userName}
            </Typography>
          </Fade>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Action Buttons */}
        <Fade in timeout={1400}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1.5, md: 2 } 
          }}>
            {/* Notifications */}

            {/* Theme Toggle */}
            <IconButton 
              color="inherit" 
              onClick={toggleDarkMode}
              sx={{
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 3,
                p: 1.2,
                animation: `${pulseAnimation} 4s infinite`,
                color: '#ffffff',
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.3))',
                  transform: 'scale(1.2) rotate(180deg)',
                  boxShadow: '0 8px 25px rgba(255,255,255,0.4)',
                  animation: 'none',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: '#ffffff'
                }
              }}
            >
              {darkMode ? <LightIcon /> : <DarkIcon />}
            </IconButton>

            {/* User Profile Menu */}
            <Chip
              avatar={
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.3)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    color: '#ffffff'
                  }}
                >
                  {userInitial}
                </Avatar>
              }
              label={isMediumScreen ? '' : userName}
              onClick={handleMenuOpen}
              variant="outlined"
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.25))',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                height: 42,
                px: 1,
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.25), rgba(255,255,255,0.35))',
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  color: '#ffffff'
                },
                '& .MuiChip-label': {
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  color: '#ffffff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }
              }}
            />

            {/* Logout Button */}
            <Button 
              color="inherit" 
              onClick={handleLogoutClick}
              startIcon={<ExitToApp sx={{ color: '#ffffff' }} />}
              sx={{
                fontWeight: 700,
                borderRadius: 4,
                px: 3,
                py: 1.2,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.15), rgba(255,255,255,0.25))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                textTransform: 'none',
                fontSize: '0.9rem',
                letterSpacing: 0.5,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(255,87,87,0.4), rgba(255,138,138,0.3))',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 30px rgba(255,0,0,0.3)',
                  borderColor: 'rgba(255,255,255,0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: '#ffffff'
                }
              }}
            >
              {isSmallScreen ? '' : 'Logout'}
            </Button>
          </Box>
        </Fade>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 2,
              minWidth: 240,
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'visible',
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(30,30,35,0.98), rgba(40,40,45,0.95))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(250,250,255,0.95))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -8,
                right: 20,
                width: 16,
                height: 16,
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(30,30,35,0.98), rgba(40,40,45,0.95))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(250,250,255,0.95))',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderTop: '1px solid rgba(255,255,255,0.2)',
                borderLeft: '1px solid rgba(255,255,255,0.2)'
              }
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem 
            onClick={handleProfileClick}
            sx={{ 
              py: 2,
              borderRadius: 2,
              mx: 1,
              mt: 1,
              color: darkMode ? '#ffffff' : 'text.primary',
              '&:hover': {
                background: darkMode 
                  ? 'linear-gradient(45deg, rgba(33,150,243,0.2), rgba(33,150,243,0.3))'
                  : 'linear-gradient(45deg, rgba(33,150,243,0.1), rgba(33,150,243,0.2))',
                transform: 'translateX(5px)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <AccountCircle sx={{ 
              mr: 2, 
              color: darkMode ? '#90caf9' : 'primary.main', 
              fontSize: 24 
            }} />
            <Typography fontWeight="600" color={darkMode ? '#ffffff' : 'text.primary'}>
              My Profile
            </Typography>
          </MenuItem>
          
          <MenuItem 
            onClick={handleDashboardClick}
            sx={{ 
              py: 2,
              borderRadius: 2,
              mx: 1,
              color: darkMode ? '#ffffff' : 'text.primary',
              '&:hover': {
                background: darkMode 
                  ? 'linear-gradient(45deg, rgba(33,150,243,0.2), rgba(33,150,243,0.3))'
                  : 'linear-gradient(45deg, rgba(33,150,243,0.1), rgba(33,150,243,0.2))',
                transform: 'translateX(5px)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <Dashboard sx={{ 
              mr: 2, 
              color: darkMode ? '#90caf9' : 'primary.main', 
              fontSize: 24 
            }} />
            <Typography fontWeight="600" color={darkMode ? '#ffffff' : 'text.primary'}>
              Dashboard
            </Typography>
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem 
            onClick={handleLogoutClick}
            sx={{ 
              py: 2,
              borderRadius: 2,
              mx: 1,
              mb: 1,
              color: 'error.main',
              '&:hover': {
                background: 'linear-gradient(45deg, rgba(244,67,54,0.15), rgba(244,67,54,0.25))',
                color: 'error.dark',
                transform: 'translateX(5px)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ExitToApp sx={{ mr: 2, fontSize: 24 }} />
            <Typography fontWeight="600">Sign Out</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Success Message Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          mt: 9,
          '& .MuiSnackbar-root': {
            top: '90px !important'
          }
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ 
            minWidth: 300,
            borderRadius: 4,
            boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, rgba(76,175,80,0.95), rgba(56,142,60,0.9))',
            backdropFilter: 'blur(20px)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.3)',
            '& .MuiAlert-message': {
              fontSize: '1rem',
              py: 1,
              color: '#ffffff'
            },
            '& .MuiAlert-icon': {
              color: '#ffffff'
            }
          }}
        >
          🎉 {successMessage}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}