import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer"
      sx={{
        p: 3,
        mt: 'auto', // Push the footer to the bottom
        bgcolor: '#f0f0f0',
        textAlign: 'center',
        borderTop: '1px solid #d0d0d0',
        direction: 'rtl', // Ensure RTL direction
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        © {new Date().getFullYear()} نظام إدارة الموظفين. جميع الحقوق محفوظة.
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Link href="#" color="text.secondary" underline="hover" variant="body2">
          سياسة الخصوصية
        </Link>
        <Link href="#" color="text.secondary" underline="hover" variant="body2">
          شروط الاستخدام
        </Link>
        <Link href="#" color="text.secondary" underline="hover" variant="body2">
          اتصل بنا
        </Link>
      </Box>
    </Box>
  );
};

export default Footer; 