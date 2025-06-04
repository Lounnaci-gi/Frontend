import React from 'react';
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

// Composants
import MainLayout from './components/layout/MainLayout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import Employees from './components/employees/Employees';
import Missions from './components/missions/Missions';
import Settings from './components/settings/Settings';

// Configuration RTL pour Emotion
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Création du thème avec support RTL
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Cairo, sans-serif',
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        dir: 'rtl',
      },
    },
  },
});

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Configuration du routeur avec les drapeaux de fonctionnalités futures
const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      )
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      )
    },
    {
      path: "/employees",
      element: (
        <ProtectedRoute>
          <MainLayout>
            <Employees />
          </MainLayout>
        </ProtectedRoute>
      )
    },
    {
      path: "/missions",
      element: (
        <ProtectedRoute>
          <MainLayout>
            <Missions />
          </MainLayout>
        </ProtectedRoute>
      )
    },
    {
      path: "/settings",
      element: (
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      )
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    },
    basename: process.env.PUBLIC_URL || '/',
    window: window
  }
);

// Envelopper le routeur avec un composant qui force les drapeaux de fonctionnalités futures
const RouterWithFutureFlags = () => {
  React.useEffect(() => {
    // Forcer l'activation des drapeaux de fonctionnalités futures
    if (window.__reactRouterFutureFlags) {
      window.__reactRouterFutureFlags.v7_startTransition = true;
      window.__reactRouterFutureFlags.v7_relativeSplatPath = true;
    }
  }, []);

  return <RouterProvider router={router} />;
};

function App() {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={arLocale}>
          <CssBaseline />
          <RouterWithFutureFlags />
        </LocalizationProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
