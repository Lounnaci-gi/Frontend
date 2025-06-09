import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from 'react-error-boundary';
import { store } from './store';
import App from './App';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// Ajout de la police Cairo
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Composant de fallback pour ErrorBoundary
const ErrorFallback = ({ error }) => {
  return (
    <div role="alert" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Une erreur est survenue :</h2>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
