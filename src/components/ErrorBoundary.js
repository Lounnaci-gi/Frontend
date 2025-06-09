import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert" style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      margin: '20px'
    }}>
      <h2 style={{ color: '#e74c3c' }}>Une erreur est survenue</h2>
      <pre style={{ 
        color: '#c0392b',
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '4px',
        overflow: 'auto'
      }}>
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Réessayer
      </button>
    </div>
  );
};

export const AppErrorBoundary = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Réinitialiser l'état de l'application ici si nécessaire
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}; 