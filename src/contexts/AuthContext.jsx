import React, { useState, useEffect, useContext, createContext, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  
  const tokenCheckInterval = useRef(null);
  const warningShown = useRef(false);
  const redirectTimeoutRef = useRef(null);
  const isInitialized = useRef(false);

  // Check if current route requires authentication
  const isProtectedRoute = useCallback(() => {
    const protectedPaths = ['/admin', '/dashboard', '/profile'];
    return protectedPaths.some(path => location.pathname.startsWith(path));
  }, [location.pathname]);

  // Check if current route is a login page
  const isLoginPage = useCallback(() => {
    const loginPaths = ['/login', '/admin/login', '/signin', '/auth/login'];
    return loginPaths.includes(location.pathname);
  }, [location.pathname]);

  // Navigate to login with proper redirect handling
  const navigateToLogin = useCallback((reason = 'Authentication required') => {
    if (isLoginPage()) {
      console.log('Already on login page, skipping navigation');
      return;
    }

    console.log(`🔄 Redirecting to login: ${reason}`);
    
    // Clear any existing redirect timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    // Store current location for redirect after login (only for protected routes)
    const currentPath = location.pathname;
    const shouldSaveRedirect = isProtectedRoute() && currentPath !== '/' && currentPath !== '/admin/login';
    
    if (shouldSaveRedirect) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }

    // Add small delay to allow for cleanup
    redirectTimeoutRef.current = setTimeout(() => {
      try {
        navigate('/admin/login', { 
          replace: true,
          state: { 
            from: shouldSaveRedirect ? currentPath : null,
            reason 
          }
        });
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to hard redirect
        window.location.href = `/admin/login?reason=${encodeURIComponent(reason)}`;
      }
    }, 100);
  }, [navigate, location.pathname, isLoginPage, isProtectedRoute]);

  // Navigate to dashboard or saved redirect path after login
  const navigateAfterLogin = useCallback(() => {
    const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
    sessionStorage.removeItem('redirectAfterLogin');
    
    const targetPath = savedRedirect || '/admin/products'; // Default dashboard path
    
    console.log(`✅ Login successful, redirecting to: ${targetPath}`);
    
    try {
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error('Post-login navigation error:', error);
      navigate('/admin/products', { replace: true });
    }
  }, [navigate]);

  const getStoredUser = useCallback(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  }, []);

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

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
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
      
      // Show warning when 1 hour (60 minutes) or less remaining
      if (remainingTime <= 60 && remainingTime > 0 && !warningShown.current) {
        setShowExpiryWarning(true);
        warningShown.current = true;
        console.log(`⚠️ Token expires in ${remainingTime} minutes`);
      }
      
      // Auto-logout when token expires
      if (remainingTime <= 0) {
        console.log('🔒 Token expired - auto logout');
        logout('Token expired');
      }
    }, 60000); // Check every minute
  }, []); // Remove dependency on navigateToLogin to prevent recreation

  const stopTokenMonitoring = useCallback(() => {
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
      tokenCheckInterval.current = null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      try {
        const hasToken = !!api.getToken();
        const userData = getStoredUser();
        const remainingTime = api.getTokenRemainingTime();
        
        console.log('Auth initialization:', { 
          hasToken, 
          hasUserData: !!userData,
          tokenRemainingMinutes: remainingTime,
          currentPath: location.pathname
        });
        
        if (hasToken && userData && remainingTime > 0) {
          setUser(userData);
          setTokenExpiry(remainingTime);
          startTokenMonitoring();
          console.log('User authenticated:', userData.name || userData.username);
        } else {
          // Log specific issues
          if (hasToken && !userData) {
            console.log('Token exists but no user data, clearing auth');
          } else if (!hasToken && userData) {
            console.log('User data exists but no valid token, clearing user data');
          } else if (remainingTime <= 0) {
            console.log('Token expired, clearing auth');
          } else {
            console.log('No authentication data found');
          }
          
          clearAuthData();
          setUser(null);
          
          // Only redirect if on a protected route and not already redirecting
          if (isProtectedRoute() && !isLoginPage()) {
            navigateToLogin('Authentication required');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
        setUser(null);
        
        // Navigate to login if on a protected route
        if (isProtectedRoute() && !isLoginPage()) {
          navigateToLogin('Authentication error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [clearAuthData, startTokenMonitoring, getStoredUser, isProtectedRoute, isLoginPage, navigateToLogin, location.pathname]);

  // Listen for auth expiry events from API client
  useEffect(() => {
    const handleAuthExpired = (event) => {
      console.log('🔒 Auth expired event received:', event.detail?.reason || 'Unknown reason');
      setUser(null);
      clearAuthData();
      setError('Your session has expired. Please login again.');
      
      // Only navigate if not already on login page
      if (!isLoginPage()) {
        navigateToLogin(event.detail?.reason || 'Session expired');
      }
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      stopTokenMonitoring();
      
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [clearAuthData, isLoginPage, navigateToLogin, stopTokenMonitoring]);

  const login = useCallback(async (username, password) => {
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
      
      // Set refresh token if provided
      if (result.refreshToken) {
        api.setRefreshToken(result.refreshToken);
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Start monitoring token expiry
      const remainingTime = api.getTokenRemainingTime();
      setTokenExpiry(remainingTime);
      startTokenMonitoring();
      
      console.log('Login successful for:', userData.name || userData.username);
      console.log('Token expires in:', remainingTime, 'minutes');
      
      // Navigate to appropriate page after successful login
      navigateAfterLogin();
      
      return result;
      
    } catch (err) {
      console.error('Login error:', err.message);
      
      // Enhanced error handling
      let errorMessage = 'Login failed';
      
      if (err.message.includes('Network') || err.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message.includes('timeout') || err.message.includes('Timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message.includes('Invalid') || err.message.includes('Unauthorized')) {
        errorMessage = 'Invalid username or password.';
      } else if (err.message.includes('Too many')) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setUser(null);
      clearAuthData();
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthData, startTokenMonitoring, navigateAfterLogin]);

  const logout = useCallback(async (reason = 'User logout', shouldNavigate = true) => {
    console.log(`🚪 Logging out: ${reason}`);
    setIsLoading(true);
    
    try {
      // Call logout API (fire and forget)
      await authService.logout();
    } catch (error) {
      console.log('Logout API call failed (continuing with local cleanup):', error.message);
    }
    
    clearAuthData();
    setUser(null);
    setError(null);
    setIsLoading(false);
    
    if (shouldNavigate && !isLoginPage()) {
      navigateToLogin(reason);
    }
  }, [clearAuthData, navigateToLogin, isLoginPage]);

  const extendSession = useCallback(async () => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      
      // Try to get a new token through any API call that returns a token
      // This could be a dedicated refresh endpoint or any authenticated endpoint
      const response = await api.get('/admin/auth/verify'); // Adjust endpoint as needed
      
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
      
      // If session extension fails due to auth error, logout
      if (error?.status === 401 || error?.message?.includes('Authentication')) {
        logout('Session extension failed', true);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, logout]);

  const dismissExpiryWarning = useCallback(() => {
    setShowExpiryWarning(false);
    warningShown.current = false; // Reset warning flag
  }, []);

  const updateUser = useCallback((updates) => {
    if (!user) return;
    
    const newUserData = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
    console.log('User data updated:', updates);
  }, [user]);

  const handleAuthError = useCallback((error) => {
    if (error?.status === 401 || error?.message?.includes('Authentication')) {
      console.log('🚨 Authentication error detected, logging out');
      logout('Authentication failed', true);
      return true;
    }
    return false;
  }, [logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get formatted time remaining
  const getFormattedTimeRemaining = useCallback(() => {
    if (!tokenExpiry || tokenExpiry <= 0) return 'Expired';
    
    const hours = Math.floor(tokenExpiry / 60);
    const minutes = tokenExpiry % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [tokenExpiry]);

  // Memoize the computed values to avoid recalculation on every render
  const authValues = useMemo(() => {
    const hasValidToken = !!api.getToken();
    const isUserAuthenticated = Boolean(user && hasValidToken);
    const isUserAdmin = Boolean(user?.role === 'admin' || user?.role === 'superadmin');
    const isTokenSoonToExpire = hasValidToken ? api.isTokenExpiringSoon() : false;
    
    return {
      // State
      user,
      isLoading,
      error,
      tokenExpiry,
      showExpiryWarning,
      
      // Computed values
      isAuthenticated: isUserAuthenticated,
      isAdmin: isUserAdmin,
      isTokenExpiringSoon: isTokenSoonToExpire,
      isProtectedRoute: isProtectedRoute(),
      isLoginPage: isLoginPage(),
      
      // Functions
      getFormattedTimeRemaining,
      login,
      logout,
      updateUser,
      extendSession,
      dismissExpiryWarning,
      clearError,
      handleAuthError,
      navigateToLogin,
      navigateAfterLogin
    };
  }, [
    user, 
    isLoading, 
    error, 
    tokenExpiry, 
    showExpiryWarning, 
    isProtectedRoute,
    isLoginPage,
    getFormattedTimeRemaining,
    login,
    logout,
    updateUser,
    extendSession,
    dismissExpiryWarning,
    clearError,
    handleAuthError,
    navigateToLogin,
    navigateAfterLogin
  ]);

  return authValues;
}

export default AuthProvider;