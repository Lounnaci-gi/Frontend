import React from 'react';
import { Box, CssBaseline, useMediaQuery, Toolbar } from '@mui/material';
// Removed styled as it's no longer needed here
// import { styled } from '@mui/material/styles';
// import Sidebar from './Sidebar'; // Removed Sidebar import
import Header from './Header'; // Header will become the Navbar
import Footer from './Footer';

// Removed the 'Main' styled component

const MainLayout = ({ children, toggleDarkMode, darkMode }) => {
  // We still keep isMobile for potential responsive adjustments in the Header/Navbar
  const isMobile = useMediaQuery('(max-width:600px)');

  // No need for handleDrawerToggle or open state as there's no sidebar to toggle

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', direction: 'rtl' }}>
      <CssBaseline />
      {/* Header component will now act as the Navbar */}
      <Header isMobile={isMobile} toggleDarkMode={toggleDarkMode} darkMode={darkMode} />

      {/* Add a Toolbar spacer to prevent content from being hidden by the fixed AppBar */}
      <Toolbar />

      {/* Main content container - Centered and no sidebar margin */}
      <Box 
        component="main" 
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: '16px', // Réduit le padding
          boxSizing: 'border-box',
          maxWidth: '1600px', // Augmenté de 1200px à 1600px
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
        {/* Footer is moved outside this Box to be full width */}
        {/* <Footer /> */}
      </Box>

      {/* Footer is now outside the centered main content to be full width */}
      <Footer />
    </Box>
  );
};

export default MainLayout; 