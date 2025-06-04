import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

const Settings = () => {
  return (
    <Box sx={{ 
      flexGrow: 1,
      p: { xs: 2, sm: 3 },
      maxWidth: '100%',
      overflow: 'hidden',
      marginLeft: { sm: '240px' },
      width: { sm: 'calc(100% - 240px)' },
      position: 'relative',
      zIndex: 1,
      bgcolor: 'background.default',
    }}>
      <Typography variant="h4" component="h1" gutterBottom>
        الإعدادات
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <List>
          <ListItem button>
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText
              primary="الأمان والصلاحيات"
              secondary="إدارة المستخدمين والصلاحيات"
            />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText
              primary="اللغة والمنطقة الزمنية"
              secondary="تخصيص اللغة والإعدادات المحلية"
            />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText
              primary="الإشعارات"
              secondary="إدارة تنبيهات المهام والإشعارات"
            />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemIcon>
              <StorageIcon />
            </ListItemIcon>
            <ListItemText
              primary="النسخ الاحتياطي والاستعادة"
              secondary="إدارة النسخ الاحتياطي للبيانات"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Settings; 