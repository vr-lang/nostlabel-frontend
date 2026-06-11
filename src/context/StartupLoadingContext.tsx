import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/authService';

interface StartupLoadingContextProps {
  isAppLoading: boolean;
  error: string | null;
  retry: () => Promise<void>;
  statusMessage: string;
}

const StartupLoadingContext = createContext<StartupLoadingContextProps | null>(null);

export const useStartupLoading = () => {
  const context = useContext(StartupLoadingContext);
  if (!context) {
    throw new Error('useStartupLoading must be used within a StartupLoadingProvider');
  }
  return context;
};

export const StartupLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('INITIALIZING SECURE LINK...');

  const loadData = useCallback(async () => {
    setIsAppLoading(true);
    setError(null);
    setStatusMessage('WAKING UP BACKEND SERVICES...');
    
    try {
      // 1. Handshake with lightweight health check first
      setStatusMessage('ESTABLISHING SECURE HANDSHAKE...');
      await apiClient.get('/health');
      
      // 2. Load critical startup datasets in parallel
      setStatusMessage('DOWNLOADING COLLECTION BLUEPRINT...');
      await Promise.all([
        apiClient.get('/products?limit=100'),
        apiClient.get('/categories')
      ]);
      
      // Complete!
      setStatusMessage('SYNCHRONIZATION COMPLETE');
      setIsAppLoading(false);
    } catch (err: any) {
      console.error('Startup Loading Handshake Failed:', err);
      const errMsg = err.response?.data?.message || err.message || 'API connectivity handshake failed. Database server is offline.';
      setError(errMsg);
      setIsAppLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <StartupLoadingContext.Provider value={{ isAppLoading, error, retry: loadData, statusMessage }}>
      {children}
    </StartupLoadingContext.Provider>
  );
};
