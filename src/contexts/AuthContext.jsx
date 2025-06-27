import React, { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';
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
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  
  const tokenCheckInterval = useRef(null);
  const warningShown = useRef(false);

  const getStoredUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  };

  const clearAuthData = useCallback(() => {
    api.clearAuth();
    localStorage.removeItem('user');
    setTokenExpiry(null);
    setShowExpiryWarning(false);
    warningShown.current = false;
    
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
      tokenCheckInterval.current = null;
    }
  }, []);

  const startTokenMonitoring = useCallback(() => {
    // Clear existing interval
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
    }

    tokenCheckInterval.current = setInterval(() => {
      const remainingTime = api.getTokenRemainingTime();
      setTokenExpiry(remainingTime);
      
      // Show warning when 10 minutes or less remaining
      if (remainingTime <= 10 && remainingTime > 0 && !warningShown.current) {
        setShowExpiryWarning(true);
        warningShown.current = true;
        console.log(`⚠️ Token expires in ${remainingTime} minutes`);
      }
      
      // Auto-logout when token expires
      if (remainingTime <= 0) {
        console.log('🔒 Token expired - auto logout');
        logout();
      }
    }, 60000); // Check every minute
  }, []);

  const stopTokenMonitoring = useCallback(() => {
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
      tokenCheckInterval.current = null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const hasToken = !!api.getToken();
        const userData = getStoredUser();
        const remainingTime = api.getTokenRemainingTime();
        
        console.log('Auth initialization:', { 
          hasToken, 
          hasUserData: !!userData,
          tokenRemainingMinutes: remainingTime
        });
        
        if (hasToken && userData && remainingTime > 0) {
          setUser(userData);
          setTokenExpiry(remainingTime);
          startTokenMonitoring();
          console.log('User authenticated:', userData.name || userData.username);
        } else {
          if (hasToken && !userData) {
            console.log('Token exists but no user data, clearing auth');
          } else if (!hasToken && userData) {
            console.log('User data exists but no valid token, clearing user data');
          } else if (remainingTime <= 0) {
            console.log('Token expired, clearing auth');
          }
          clearAuthData();
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

    // Listen for auth expiry events from API client
    const handleAuthExpired = () => {
      console.log('🔒 Auth expired event received');
      setUser(null);
      clearAuthData();
      setError('Your session has expired. Please login again.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    initializeAuth();

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      stopTokenMonitoring();
    };
  }, [clearAuthData, startTokenMonitoring, stopTokenMonitoring]);

  const login = async (username, password) => {
    if (!username?.trim() || !password?.trim()) {
      throw new Error('Username and password are required');
    }

    setIsLoading(true);
    setError(null);
    setShowExpiryWarning(false);
    warningShown.current = false;
    
    try {
      console.log('Starting login for:', username);
      const result = await authService.login(username.trim(), password);
      console.log('Login response:', { 
        code: result.code, 
        hasToken: !!result.token, 
        hasUser: !!(result.user || result.admin) 
      });
      
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
      
      // Start monitoring token expiry
      const remainingTime = api.getTokenRemainingTime();
      setTokenExpiry(remainingTime);
      startTokenMonitoring();
      
      console.log('Login successful for:', userData.name || userData.username);
      console.log('Token expires in:', remainingTime, 'minutes');
      
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
    } catch (error) {
      console.log('Logout API call failed (continuing with local cleanup):', error.message);
    }
    
    clearAuthData();
    setUser(null);
    setError(null);
    setIsLoading(false);
    
    if (navigate) {
      navigate('/login', { replace: true });
    }
  };

  const extendSession = useCallback(async () => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      // Make a simple API call to refresh the token
      // You might want to create a dedicated refresh endpoint
      const response = await api.get('/admin/ping'); // Adjust endpoint as needed
      
      if (response.data?.token) {
        api.setToken(response.data.token);
        const remainingTime = api.getTokenRemainingTime();
        setTokenExpiry(remainingTime);
        setShowExpiryWarning(false);
        warningShown.current = false;
        console.log('Session extended, token expires in:', remainingTime, 'minutes');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const dismissExpiryWarning = useCallback(() => {
    setShowExpiryWarning(false);
  }, []);

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

  // Get formatted time remaining
  const getFormattedTimeRemaining = () => {
    if (!tokenExpiry) return 'Unknown';
    
    const hours = Math.floor(tokenExpiry / 60);
    const minutes = tokenExpiry % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return {
    user,
    isLoading,
    error,
    tokenExpiry,
    showExpiryWarning,
    isAuthenticated: Boolean(user && api.getToken()),
    isAdmin: Boolean(user?.role === 'admin' || user?.role === 'superadmin'),
    isTokenExpiringSoon: api.isTokenExpiringSoon(),
    getFormattedTimeRemaining,
    login,
    logout,
    updateUser,
    extendSession,
    dismissExpiryWarning,
    clearError: () => setError(null),
    handleAuthError
  };
}

export default AuthProvider;