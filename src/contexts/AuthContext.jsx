import React, { useState, useEffect, useContext, createContext, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api/services';
import api from '../api/axios';

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
  
  const isInitialized = useRef(false);

  // Check if current route requires authentication
  const isProtectedRoute = useCallback(() => {
    const protectedPaths = ['/admin'];
    return protectedPaths.some(path => location.pathname.startsWith(path)) && 
           !location.pathname.includes('/login');
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
    
    // Store current location for redirect after login (only for protected routes)
    const currentPath = location.pathname;
    const shouldSaveRedirect = isProtectedRoute() && currentPath !== '/' && currentPath !== '/admin/login';
    
    if (shouldSaveRedirect) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }

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
  }, []);

  // SIMPLIFIED: Initialize auth state without client-side expiry checks
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      try {
        const hasToken = !!api.getToken();
        const userData = getStoredUser();
        
        console.log('Auth initialization:', { 
          hasToken, 
          hasUserData: !!userData,
          currentPath: location.pathname
        });
        
        // SIMPLE CHECK: If we have both token and user data, assume valid
        // Let the server tell us if the token is expired via 401 responses
        if (hasToken && userData) {
          setUser(userData);
          console.log('User authenticated:', userData.name || userData.username);
        } else {
          // Log specific issues
          if (hasToken && !userData) {
            console.log('Token exists but no user data, clearing auth');
          } else if (!hasToken && userData) {
            console.log('User data exists but no token, clearing user data');
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
  }, [clearAuthData, getStoredUser, isProtectedRoute, isLoginPage, navigateToLogin, location.pathname]);

  const login = useCallback(async (username, password) => {
    if (!username?.trim() || !password?.trim()) {
      throw new Error('Username and password are required');
    }

    setIsLoading(true);
    setError(null);
    
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
      
      console.log('Login successful for:', userData.name || userData.username);
      
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
  }, [clearAuthData, navigateAfterLogin]);

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

  // SIMPLIFIED: Memoize values without complex token expiry checks
  const authValues = useMemo(() => {
    const hasToken = !!api.getToken();
    const isUserAuthenticated = Boolean(user && hasToken);
    const isUserAdmin = Boolean(user?.role === 'admin' || user?.role === 'superadmin');
    
    return {
      // State
      user,
      isLoading,
      error,
      
      // Computed values
      isAuthenticated: isUserAuthenticated,
      isAdmin: isUserAdmin,
      isProtectedRoute: isProtectedRoute(),
      isLoginPage: isLoginPage(),
      
      // Functions
      login,
      logout,
      updateUser,
      clearError,
      handleAuthError,
      navigateToLogin,
      navigateAfterLogin
    };
  }, [
    user, 
    isLoading, 
    error, 
    isProtectedRoute,
    isLoginPage,
    login,
    logout,
    updateUser,
    clearError,
    handleAuthError,
    navigateToLogin,
    navigateAfterLogin
  ]);

  return authValues;
}

export default AuthProvider;