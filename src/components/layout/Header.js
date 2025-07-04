import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useScrollTrigger,
  Slide,
  Avatar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/authService';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const navItems = [
  { text: 'لوحة التحكم', path: '/dashboard', icon: <DashboardIcon /> },
  { text: 'الموظفين', path: '/employees', icon: <PeopleIcon /> },
  { text: 'المهام', path: '/missions', icon: <AssignmentIcon /> },
  { text: 'الإعدادات', path: '/settings', icon: <SettingsIcon /> },
];

const Header = ({ isMobile, toggleDarkMode, darkMode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const trigger = useScrollTrigger();

  const drawer = (
    <Box sx={{ width: 250, direction: 'rtl' }}>
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <Avatar
          src="/image.png"
          alt="الجزائرية للمياه"
          sx={{ width: 60, height: 60, margin: '0 auto 10px' }}
        />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          الجزائرية للمياه
        </Typography>
        <Typography variant="body2" color="text.secondary">
          نظام إدارة الموظفين
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigation(item.path)}
            sx={{ 
              '&:hover': { backgroundColor: 'primary.light', color: 'white' },
              direction: 'rtl'
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ 
            '&:hover': { backgroundColor: 'error.light', color: 'white' },
            direction: 'rtl'
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="تسجيل الخروج" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar 
          position="fixed" 
          component="nav" 
          sx={{ 
            direction: 'rtl', 
            zIndex: (theme) => theme.zIndex.drawer + 2,
            height: { xs: '70px', md: '80px' },
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Toolbar sx={{ minHeight: { xs: '70px !important', md: '80px !important' } }}>
            {/* Menu hamburger pour mobile */}
            {isMobileView && (
              <IconButton
                color="inherit"
                aria-label="ouvrir le menu"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Avatar
              src="/image.png"
              alt="الجزائرية للمياه"
              className="logo"
              sx={{ 
                width: { xs: 32, md: 40 }, 
                height: { xs: 32, md: 40 },
                cursor: 'pointer',
                marginRight: 'auto',
                marginLeft: 2,
                transition: 'filter 0.3s, box-shadow 0.3s',
                '&:hover': {
                  filter: 'brightness(1.2)',
                  boxShadow: '0 0 10px 2px rgba(0,0,0,0.15)',
                }
              }}
              onClick={() => navigate('/dashboard')}
            />

            {/* Bouton thème sombre/clair */}
            <IconButton
              sx={{
                color: darkMode ? '#FFD600' : '#1976d2',
                backgroundColor: darkMode ? '#333' : '#fff',
                border: '2px solid',
                borderColor: darkMode ? '#FFD600' : '#1976d2',
                marginLeft: 1,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: darkMode ? '#444' : '#e3e3e3',
                  boxShadow: '0 0 8px 2px #1976d2',
                  '& img.base64-theme-icon': {
                    filter: 'brightness(0) invert(1)',
                  },
                },
                width: { xs: 40, md: 44 },
                height: { xs: 40, md: 44 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0
              }}
              onClick={toggleDarkMode}
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? (
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAAAXNSR0IArs4c6QAAAXpJREFUSEvl1DFIVlEYxvGfKA0ONhkG6mQg6BAZCIWLg5KTi+DaEDg4hkMOYUi4CEGDILgILk4iNRiKIuogbba4iKApaJMiIhh0jxzh4+v6ffcWLnrgwj2H9/zPe573eU+FWxwVt8h2f+Bb6MJhFjnzyvIJwzj7X/g3fMRKCVAdvqIXe8VxpTJ/gXrMxk0P0Yyf2I9rYf4SU2kJZJXlPd7hB5qwhn6clpInC3wMjRjACSrxFj3oxO+bDigHr8YBHuO8CLKKUYTapI5ieBXmkqw28SH5f4rP6EjZPRJvMh5vMYTBKN1VeFrmz5OgX9jFI6zjSQp8Imo/gxo8i/PL69hysoS4ULxJTBcc0Bot2BYTySRLWlBwx0L8jhLvP8DrxJJv8OVf3RKK2ILFCHwVfR48Hop4jNoo2UZen3+PzRG0vWkEeZbRjp08HdqQ0tJ9SeHmcVEACl0aWv+v9yZLQQsT2kZ3dFLZtysvPDy3S6W6svDEvPCy2d4N+B9ZFEAYAdlmHgAAAABJRU5ErkJggg=="
                  alt="Icône thème"
                  style={{ width: 24, height: 24 }}
                  className="base64-theme-icon"
                />
              ) : (
                <BedtimeIcon fontSize="small" />
              )}
            </IconButton>

            {/* Navigation desktop */}
            {!isMobileView && (
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                position: 'absolute',
                right: '50%',
                transform: 'translateX(50%)',
                flexDirection: 'row-reverse'
              }}>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    sx={{ 
                      color: '#fff',
                      fontSize: '1rem',
                      padding: '8px 16px'
                    }}
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {/* Titre et sous-titre */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-end',
              marginRight: 2,
              flexGrow: 1
            }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  cursor: 'pointer',
                  textAlign: 'right',
                  fontSize: { xs: '1rem', md: '1.2rem' }
                }}
                onClick={() => navigate('/dashboard')}
              >
                <span style={{ fontSize: 'inherit', fontWeight: 'bold' }}>الجزائرية للمياه</span>
                <span style={{ fontSize: { xs: '0.8rem', md: '0.9rem' }, display: 'block' }}>نظام إدارة الموظفين</span>
              </Typography>
            </Box>

            {/* Bouton déconnexion desktop */}
            {!isMobileView && (
              <Button
                key="logout"
                sx={{ 
                  color: '#fff',
                  marginRight: 2,
                  fontSize: '1rem',
                  padding: '8px 16px'
                }}
                onClick={handleLogout}
              >
                تسجيل الخروج
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Slide>

      {/* Drawer mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            direction: 'rtl'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 