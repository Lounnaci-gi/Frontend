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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/authService';

const navItems = [
  { text: 'لوحة التحكم', path: '/dashboard' },
  { text: 'الموظفين', path: '/employees' },
  { text: 'المهام', path: '/missions' },
  { text: 'الإعدادات', path: '/settings' },
];

const Header = ({ isMobile }) => {
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