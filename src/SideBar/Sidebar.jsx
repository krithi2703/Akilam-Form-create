import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  useMediaQuery,
  Divider,
  Toolbar,
  Box,
  Typography,
  Chip,
  Avatar,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TableChart as TableIcon,
  Create as CreateIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Folder as FolderIcon,
  AdminPanelSettings as AdminIcon,
  Star as StarIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SideBar({ sidebarOpen, toggleSidebar, darkMode, userRole }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced menu items with categories
  const menuSections = [
    {
      title: "MAIN NAVIGATION",
      items: [
        {
          text: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/dashboard',
          badge: "New",
          badgeColor: "primary"
        },
        {
          text: 'Create Column',
          icon: <CreateIcon />,
          path: '/create-column',
          premium: userRole === 1
        },
        {
          text: 'Column Table',
          icon: <TableIcon />,
          path: '/formtable'
        },
        {
          text: 'Content Table',
          icon: <FolderIcon />,
          path: '/content-table'
        },
        {
          text: 'Master Table',
          icon: <AnalyticsIcon />,
          path: '/mastertable'
        },
      ]
    },
    {
      title: "ADMINISTRATION",
      items: [
        {
          text: 'User Management',
          icon: <PeopleIcon />,
          path: '/users',
          adminOnly: true
        },
        {
          text: 'System Settings',
          icon: <SettingsIcon />,
          path: '/settings',
          comingSoon: true
        },
      ]
    }
  ];

  // Filter menu items based on user role
  const getFilteredSections = () => {
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (item.adminOnly && userRole !== 1) return false;
        if (item.comingSoon && userRole !== 1) return false;
        return true;
      })
    })).filter(section => section.items.length > 0);
  };

  const filteredSections = getFilteredSections();

  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: darkMode 
        ? 'linear-gradient(195deg, #1A2035 0%, #0F1526 100%)'
        : 'linear-gradient(195deg, #FFFFFF 0%, #F8F9FA 100%)',
      color: darkMode ? '#FFFFFF' : '#344767',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: darkMode 
        ? '0 4px 20px rgba(0,0,0,0.3)'
        : '0 4px 20px rgba(0,0,0,0.08)',
    }}>


      <Toolbar sx={{ 
        minHeight: '0 !important',
        background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }} />
      
      {/* Menu Sections */}
      <Box sx={{ px: 2, py: 3, flex: 1 ,mt:10, overflowY: 'auto' }}>
        {filteredSections.map((section, index) => (
          <Box key={section.title} sx={{ mb: 4 }}>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                py: 1,
                color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                fontSize: '0.65rem',
                display: 'block',
                background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: 1
              }}
            >
              {section.title}
            </Typography>
            
            <List sx={{ py: 0, mt: 1 }}>
              {section.items.map((item) => (
                <ListItem 
                  key={item.text} 
                  disablePadding
                  sx={{ 
                    mb: 0.5,
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => {
                      if (!item.comingSoon) {
                        navigate(item.path);
                        if (isMobile) toggleSidebar();
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      py: 1.25,
                      px: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      '&.Mui-selected': {
                        backgroundColor: darkMode 
                          ? 'rgba(255, 255, 255, 0.12)' 
                          : 'rgba(25, 118, 210, 0.08)',
                        color: darkMode ? '#90caf9' : '#1976d2',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                        transform: 'translateY(-1px)',
                        '&:hover': {
                          backgroundColor: darkMode 
                            ? 'rgba(255, 255, 255, 0.15)' 
                            : 'rgba(25, 118, 210, 0.12)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: darkMode ? '#90caf9' : '#1976d2',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          height: '60%',
                          width: 3,
                          background: 'linear-gradient(180deg, #67B26F, #4CA2CD)',
                          borderRadius: '0 4px 4px 0'
                        }
                      },
                      '&:hover': {
                        backgroundColor: darkMode 
                          ? 'rgba(255, 255, 255, 0.06)' 
                          : 'rgba(0, 0, 0, 0.03)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      ...(item.comingSoon && {
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        '&:hover': {
                          transform: 'none',
                          boxShadow: 'none'
                        }
                      })
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: location.pathname === item.path 
                          ? (darkMode ? '#90caf9' : '#1976d2')
                          : (darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'),
                        minWidth: 36,
                        marginRight: 1.5,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', width: '100%' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: location.pathname === item.path ? 600 : 500,
                              fontSize: '0.875rem',
                              letterSpacing: '0.2px'
                            }}
                          >
                            {item.text}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {item.badge && (
                              <Chip
                                label={item.badge}
                                color={item.badgeColor}
                                size="small"
                                sx={{ 
                                  height: 18,
                                  fontSize: '0.55rem',
                                  fontWeight: 'bold',
                                  minWidth: 35
                                }}
                              />
                            )}
                            {item.premium && (
                              <StarIcon sx={{ 
                                fontSize: 16, 
                                color: '#FFD700',
                                filter: 'drop-shadow(0 0 2px rgba(255,215,0,0.5))'
                              }} />
                            )}
                            {item.comingSoon && (
                              <Chip
                                label="SOON"
                                size="small"
                                sx={{ 
                                  height: 16,
                                  fontSize: '0.5rem',
                                  background: 'linear-gradient(45deg, #666, #999)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  minWidth: 40
                                }}
                              />
                            )}
                            {location.pathname === item.path && (
                              <ChevronRightIcon sx={{ 
                                fontSize: 16, 
                                color: darkMode ? '#90caf9' : '#1976d2',
                                opacity: 0.8
                              }} />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {index < filteredSections.length - 1 && (
              <Divider sx={{ 
                my: 2, 
                borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                opacity: 0.5
              }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: 3, 
        background: darkMode 
          ? 'rgba(255, 255, 255, 0.02)'
          : 'rgba(0, 0, 0, 0.02)',
        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        textAlign: 'center'
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            fontWeight: 500,
            fontSize: '0.7rem'
          }}
        >
          v2.1.0 • Premium Edition
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { md: 280 }, 
        flexShrink: { md: 0 },
      }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ 
          keepMounted: true,
          BackdropProps: {
            sx: {
              backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)'
            }
          }
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            border: 'none',
            boxShadow: darkMode 
              ? '16px 0 32px rgba(0,0,0,0.4)'
              : '16px 0 32px rgba(0,0,0,0.15)',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            border: 'none',
            boxShadow: darkMode 
              ? '4px 0 20px rgba(0,0,0,0.2)'
              : '4px 0 20px rgba(0,0,0,0.08)',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}