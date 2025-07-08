import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const drawerWidth = 240;

const menuItems = [
  { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'الموظفين', icon: <PeopleIcon />, path: '/employees' },
  { text: 'المهام', icon: <AssignmentIcon />, path: '/missions' },
  { text: 'الإعدادات', icon: <SettingsIcon />, path: '/settings' }
];

const Sidebar = ({ open, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) return null; // Ne pas afficher la sidebar sur mobile

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // TODO: Implémenter la déconnexion
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          direction: 'rtl',
          ...(!open && {
            width: theme => theme.spacing(7),
            overflowX: 'hidden',
            transition: theme =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }),
        },
      }}
      open={open}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  ml: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  textAlign: 'right'
                }}
              />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                ml: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="تسجيل الخروج" 
              sx={{ 
                opacity: open ? 1 : 0,
                textAlign: 'right'
              }}
            />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 