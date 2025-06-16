import React, { useState, useEffect, useContext, createContext } from 'react';
import { authService, api } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStoredUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  };

  const clearAuthData = () => {
    api.clearAuth();
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const hasToken = !!api.getToken();
        const userData = getStoredUser();
        
        console.log('Auth initialization:', { hasToken, hasUserData: !!userData });
        
        if (hasToken && userData) {
          setUser(userData);
          console.log('User authenticated:', userData.name || userData.username);
        } else {
          if (hasToken && !userData) {
            console.log('Token exists but no user data, clearing auth');
            clearAuthData();
          }
          if (!hasToken && userData) {
            console.log('User data exists but no token, clearing user data');
            localStorage.removeItem('user');
          }
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    if (!username?.trim() || !password?.trim()) {
      throw new Error('Username and password are required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting login for:', username);
      const result = await authService.login(username.trim(), password);
      console.log('Login response:', { code: result.code, hasToken: !!result.token, hasUser: !!(result.user || result.admin) });
      
      if (result.code !== 200) {
        throw new Error(result.message || 'Login failed');
      }
      
      if (!result.token) {
        throw new Error('Login failed - no authentication token received');
      }
      
      // Handle user data from different response formats
      const userData = result.user || result.admin;
      if (!userData) {
        throw new Error('Login failed - no user data received');
      }
      
      // Set token first, then user data
      api.setToken(result.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('Login successful for:', userData.name || userData.username);
      return result;
      
    } catch (err) {
      console.error('Login error:', err.message);
      const errorMessage = err.message.includes('Network') 
        ? 'Network error. Check your connection.'
        : err.message.includes('timeout')
        ? 'Request timed out. Try again.'
        : err.message || 'Login failed';
      
      setError(errorMessage);
      setUser(null);
      clearAuthData();
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (navigate) => {
    setIsLoading(true);
    
    try {
      await authService.logout();
    } catch {}
    
    clearAuthData();
    setUser(null);
    setError(null);
    setIsLoading(false);
    
    if (navigate) navigate('/login', { replace: true });
  };

  const updateUser = (updates) => {
    const newUserData = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const handleAuthError = (error) => {
    if (error?.status === 401 || error?.message?.includes('Authentication')) {
      logout();
      return true;
    }
    return false;
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: Boolean(user && api.getToken()),
    isAdmin: Boolean(user?.role === 'admin' || user?.role === 'superadmin'),
    login,
    logout,
    updateUser,
    clearError: () => setError(null),
    handleAuthError
  };
}

export default AuthProvider;