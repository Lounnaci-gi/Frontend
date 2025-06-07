import React, { Suspense } from 'react';
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

// Composants chargés paresseusement
const MainLayout = React.lazy(() => import('./components/layout/MainLayout'));
const Login = React.lazy(() => import('./components/auth/Login'));
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
const Employees = React.lazy(() => import('./components/employees/Employees'));
const Missions = React.lazy(() => import('./components/missions/Missions'));
const Settings = React.lazy(() => import('./components/settings/Settings'));

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
            <MainLayout>
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
            <MainLayout>
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
            <MainLayout>
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
            <MainLayout>
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
            <MainLayout>
              <Settings />
            </MainLayout>
          </Suspense>
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
