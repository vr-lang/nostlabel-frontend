import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
  profileImage?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  customerLogin: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  setSession: (token: string, user: UserProfile) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check active session
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('nostlabel_admin_token');
      const savedProfile = localStorage.getItem('nostlabel_admin_profile');

      if (savedToken && savedProfile) {
        setToken(savedToken);
        setUser(JSON.parse(savedProfile));

        // Asynchronously check with server to ensure token is still valid
        try {
          const profile = await authService.getCurrentUser();
          if (profile) {
            setUser(profile);
            localStorage.setItem('nostlabel_admin_profile', JSON.stringify(profile));
          } else {
            // Token invalid on server
            handleSignOut();
          }
        } catch {
          // Keep local if server can't be reached but token hasn't failed refresh
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to token expiry events from Axios response interceptors
    const handleLogoutEvent = () => {
      handleSignOut();
    };

    window.addEventListener('nostlabel_admin_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('nostlabel_admin_logout', handleLogoutEvent);
    };
  }, []);

  const handleSignOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nostlabel_admin_token');
    localStorage.removeItem('nostlabel_admin_profile');
  };

  const login = async (email: string, password?: string) => {
    try {
      const res = await authService.directorLogin({ email, password });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user as UserProfile);
        return { success: true };
      }
      return { success: false, message: res.message || 'Invalid server response structure' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login attempt failed' };
    }
  };

  const customerLogin = async (email: string, password?: string) => {
    try {
      const res = await authService.customerLogin({ email, password });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user as UserProfile);
        return { success: true };
      }
      return { success: false, message: res.message || 'Invalid server response structure' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login attempt failed' };
    }
  };

  const setSession = (newToken: string, profile: UserProfile) => {
    setToken(newToken);
    setUser(profile);
    localStorage.setItem('nostlabel_admin_token', newToken);
    localStorage.setItem('nostlabel_admin_profile', JSON.stringify(profile));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      handleSignOut();
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = !!token && user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        customerLogin,
        setSession,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
