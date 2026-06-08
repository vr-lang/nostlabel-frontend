import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-bg-dark-1 flex items-center justify-center select-none">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
          <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
            VERIFYING CREDENTIALS...
          </span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/director-login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
