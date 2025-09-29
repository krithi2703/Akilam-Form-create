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
  Box
} from '@mui/material';
import {
  Home as HomeIcon,
  TableChart as TableIcon,
  Create as CreateIcon,
  Settings as SettingsIcon,
  People as PeopleIcon // Import PeopleIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SideBar({ sidebarOpen, toggleSidebar, darkMode, userRole }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const allMenuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/home' },
    { text: 'Create Column', icon: <CreateIcon />, path: '/create-column' },
    { text: 'Column Table', icon: <TableIcon />, path: '/formtable' },
    { text: 'Master Table', icon: <TableIcon />, path: '/mastertable' },
    // { text: 'User List', icon: <PeopleIcon />, path: '/users' }, // New menu item
    // { text: 'Form Table', icon: <TableIcon />, path: '/create-column-table' },
  ];

  const menuItems = userRole === 2
    ? allMenuItems.filter(item => item.text === 'Home' || item.text === 'Form Table')
    : allMenuItems.filter(item => item.text !== 'Form Table'); // Exclude 'Form Table' for non-role 2 users, and include 'User List'

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) toggleSidebar();
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: { xs: 200, sm: 240 },
            backgroundColor: darkMode ? '#1e1e1e' : '#fff',
            color: darkMode ? '#fff' : 'inherit'
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
            width: 240,
            backgroundColor: darkMode ? '#1e1e1e' : '#fff',
            color: darkMode ? '#fff' : 'inherit',
            borderRight: darkMode ? '1px solid #333' : '1px solid #e0e0e0'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
