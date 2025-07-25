import React, { useState, useEffect, useContext, createContext, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api/services.js'; // Adjust path as needed

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
  const [authChangeCounter, setAuthChangeCounter] = useState(0); // Force re-renders

  // Route checks
  const isProtectedRoute = useCallback(() => {
    return location.pathname.startsWith('/admin') && !location.pathname.includes('/login');
  }, [location.pathname]);

  const isLoginPage = useCallback(() => {
    const loginPaths = ['/login', '/admin/login'];
    return loginPaths.includes(location.pathname);
  }, [location.pathname]);

  // Navigation helpers
  const navigateToLogin = useCallback((reason = 'Authentication required') => {
    if (isLoginPage()) return;

    const currentPath = location.pathname;
    if (isProtectedRoute() && currentPath !== '/') {
      // Store redirect path in memory instead of sessionStorage
      window.pendingRedirect = currentPath;
    }

    navigate('/admin/login', { 
      replace: true,
      state: { reason }
    });
  }, [navigate, location.pathname, isLoginPage, isProtectedRoute]);

  const navigateAfterLogin = useCallback(() => {
    const savedRedirect = window.pendingRedirect;
    window.pendingRedirect = null;
    
    const targetPath = savedRedirect || '/admin/products';
    navigate(targetPath, { replace: true });
  }, [navigate]);

  // Listen for auth errors from API client
  useEffect(() => {
    const handleAuthError = (event) => {
      const { reason } = event.detail;
      setUser(null);
      setError(reason);
      setAuthChangeCounter(prev => prev + 1);
      
      if (isProtectedRoute() && !isLoginPage()) {
        navigateToLogin(reason);
      }
    };

    window.addEventListener('authError', handleAuthError);
    return () => window.removeEventListener('authError', handleAuthError);
  }, [isProtectedRoute, isLoginPage, navigateToLogin]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const userData = authService.getAuthUser();
        const isAuthenticated = authService.isAuthenticated();
        
        if (isAuthenticated && userData) {
          setUser(userData);
          setAuthChangeCounter(prev => prev + 1);
        } else {
          authService.clearAuth();
          setUser(null);
          
          if (isProtectedRoute() && !isLoginPage()) {
            navigateToLogin('Authentication required');
          }
        }
      } catch (error) {
        authService.clearAuth();
        setUser(null);
        
        if (isProtectedRoute() && !isLoginPage()) {
          navigateToLogin('Authentication error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isProtectedRoute, isLoginPage, navigateToLogin]);

  const login = useCallback(async (username, password) => {
    if (!username?.trim() || !password?.trim()) {
      throw new Error('Username and password are required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(username.trim(), password);
      
      if (result.code !== 200 || !result.token) {
        throw new Error(result.message || 'Login failed');
      }
      
      const userData = result.user || result.admin;
      if (!userData) {
        throw new Error('No user data received');
      }
      
      setUser(userData);
      setAuthChangeCounter(prev => prev + 1);
      navigateAfterLogin();
      
      return result;
      
    } catch (err) {
      let errorMessage = 'Login failed';
      
      if (err.message.includes('Network') || err.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message.includes('Invalid') || err.message.includes('Unauthorized')) {
        errorMessage = 'Invalid username or password.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setUser(null);
      setAuthChangeCounter(prev => prev + 1);
      authService.clearAuth();
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigateAfterLogin]);

  const logout = useCallback(async (reason = 'User logout', shouldNavigate = true) => {
    setIsLoading(true);
    
    try {
      await authService.logout();
    } catch (error) {
      // Silent error handling for production
    }
    
    setUser(null);
    setError(null);
    setAuthChangeCounter(prev => prev + 1);
    setIsLoading(false);
    
    if (shouldNavigate && !isLoginPage()) {
      navigateToLogin(reason);
    }
  }, [navigateToLogin, isLoginPage]);

  const updateUser = useCallback((updates) => {
    if (!user) return;
    
    const updatedUser = authService.updateUser(updates);
    if (updatedUser) {
      setUser(updatedUser);
      setAuthChangeCounter(prev => prev + 1);
    }
  }, [user]);

  const handleAuthError = useCallback((error) => {
    if (error?.status === 401 || error?.message?.includes('Authentication')) {
      logout('Authentication failed', true);
      return true;
    }
    return false;
  }, [logout]);

  const clearError = useCallback(() => setError(null), []);

  // Memoized auth values
  const authValues = useMemo(() => {
    // Get real-time authentication status
    const hasToken = !!authService.getToken();
    const currentUser = user || authService.getAuthUser();
    const isUserAuthenticated = hasToken && !!currentUser;
    
    return {
      // State
      user: currentUser,
      isLoading,
      error,
      
      // Computed values
      isAuthenticated: isUserAuthenticated,
      isAdmin: Boolean(currentUser?.role === 'admin' || currentUser?.role === 'superadmin'),
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
    authChangeCounter, // This ensures re-renders when auth state changes
    isProtectedRoute,
    isLoginPage,
    login,
    logout,
    updateUser,
    clearError,
    handleAuthError,
    navigateToLogin,
    navigateAfterLogin,
    location.pathname // Add pathname to dependencies to force re-evaluation
  ]);

  return authValues;
}

export default AuthProvider;