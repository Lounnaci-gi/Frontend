import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useScrollTrigger,
  Slide,
  Avatar,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/authService';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const navItems = [
  { text: 'لوحة التحكم', path: '/dashboard' },
  { text: 'الموظفين', path: '/employees' },
  { text: 'المهام', path: '/missions' },
  { text: 'الإعدادات', path: '/settings' },
];

const Header = ({ isMobile, toggleDarkMode, darkMode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar 
        position="fixed" 
        component="nav" 
        sx={{ 
          direction: 'rtl', 
          zIndex: (theme) => theme.zIndex.drawer + 2,
          height: '80px',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Toolbar sx={{ minHeight: '80px !important' }}>
          <Avatar
            src="/image.png"
            alt="الجزائرية للمياه"
            sx={{ 
              width: 50, 
              height: 50,
              cursor: 'pointer',
              marginRight: 'auto',
              marginLeft: 2
            }}
            onClick={() => navigate('/dashboard')}
          />

          {/* Bouton thème sombre/clair : soleil en mode sombre, lune stylisée en mode clair */}
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
              width: 44,
              height: 44,
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
                style={{ width: 28, height: 28 }}
                className="base64-theme-icon"
              />
            ) : (
              <BedtimeIcon fontSize="medium" />
            )}
          </IconButton>

          {!isMobile && (
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

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginRight: 2
          }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                cursor: 'pointer',
                textAlign: 'right',
              }}
              onClick={() => navigate('/dashboard')}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>الجزائرية للمياه</span>
              <span style={{ fontSize: '0.9rem', display: 'block' }}>نظام إدارة الموظفين</span>
            </Typography>
          </Box>

          {!isMobile && (
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
  );
};

export default Header; 