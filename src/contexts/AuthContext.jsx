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
    const hasToken = !!api.getToken();
    const userData = getStoredUser();
    
    if (hasToken && userData) {
      setUser(userData);
    } else {
      if (hasToken && !userData) clearAuthData();
      if (!hasToken && userData) localStorage.removeItem('user');
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    if (!username?.trim() || !password?.trim()) {
      throw new Error('Username and password are required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Starting login process...');
      const result = await authService.login(username.trim(), password);
      console.log('🔐 Full login result:', result);
      console.log('🔐 Result structure:', {
        code: result.code,
        hasToken: !!result.token,
        hasUser: !!result.user,
        hasAdmin: !!result.admin,
        userKeys: result.user ? Object.keys(result.user) : 'no user',
        adminKeys: result.admin ? Object.keys(result.admin) : 'no admin'
      });
      
      if (result.code !== 200) {
        throw new Error(result.message || 'Login failed - invalid response code');
      }
      
      if (!result.token) {
        throw new Error('Login failed - no token received');
      }
      
      // Check for user data in different possible locations
      let userData = null;
      if (result.user) {
        userData = result.user;
      } else if (result.admin) {
        userData = result.admin; // Sometimes backend returns 'admin' instead of 'user'
      } else {
        throw new Error('Login failed - no user data received');
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ Login successful, user set:', userData.name || userData.username);
      return result;
      
    } catch (err) {
      console.log('❌ Login error:', err.message);
      let errorMessage = 'Login failed';
      if (err.message.includes('Network')) errorMessage = 'Network error. Check your connection.';
      else if (err.message.includes('timeout')) errorMessage = 'Request timed out. Try again.';
      else if (err.message) errorMessage = err.message;
      
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

  const clearError = () => setError(null);

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
    clearError,
    handleAuthError,
    userRole: user?.role,
    userName: user?.name,
    userEmail: user?.email
  };
}

export default AuthProvider;