import React, { Suspense, lazy, useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import arLocale from 'date-fns/locale/ar-SA';
import { useSelector } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { AppErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/Toast';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import useAutoLogout from './hooks/useAutoLogout';

// Composants chargés paresseusement
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const Login = lazy(() => import('./components/auth/Login'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const Employees = lazy(() => import('./components/employees/Employees'));
const Missions = lazy(() => import('./components/missions/Missions'));
const Settings = lazy(() => import('./components/settings/Settings'));

// Configuration RTL pour Emotion
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Utiliser le hook de déconnexion automatique
  useAutoLogout(isAuthenticated ? 10 : null); // 10 minutes d'inactivité seulement si authentifié
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Composant de chargement
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <div>Chargement...</div>
  </div>
);

function App() {
  // Gestion du thème sombre
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    document.body.classList.toggle('dark-theme', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = useMemo(() => createTheme({
    direction: 'rtl',
    typography: {
      fontFamily: 'Cairo, sans-serif',
    },
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#181818' : '#fff',
        paper: darkMode ? '#232323' : '#fff',
      },
      text: {
        primary: darkMode ? '#f5f5f5' : '#222',
      },
    },
    components: {
      MuiTextField: {
        defaultProps: {
          dir: 'rtl',
        },
      },
    },
  }), [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      )
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <MainLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
              <Dashboard />
            </MainLayout>
          </Suspense>
        </ProtectedRoute>
      )
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <MainLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
              <Dashboard />
            </MainLayout>
          </Suspense>
        </ProtectedRoute>
      )
    },
    {
      path: "/employees",
      element: (
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <MainLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
              <Employees />
            </MainLayout>
          </Suspense>
        </ProtectedRoute>
      )
    },
    {
      path: "/missions",
      element: (
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <MainLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
              <Missions />
            </MainLayout>
          </Suspense>
        </ProtectedRoute>
      )
    },
    {
      path: "/settings",
      element: (
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <MainLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
              <Settings />
            </MainLayout>
          </Suspense>
        </ProtectedRoute>
      )
    }
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    },
    basename: process.env.PUBLIC_URL || '/',
    window: window
  });

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arLocale}>
              <CssBaseline />
              <RouterProvider router={router} />
              <Toast />
            </LocalizationProvider>
          </ThemeProvider>
        </CacheProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
