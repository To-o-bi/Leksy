// src/contexts/AuthContext.js - Fixed to match backend API
import { useState, useEffect, useContext, createContext, useMemo, useCallback } from 'react';
import authService from '../api/services/authService';

// Create auth context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  
  // Memoize auth value to prevent unnecessary re-renders
  const memoizedAuth = useMemo(() => auth, [
    auth.user, 
    auth.isLoading, 
    auth.error, 
    auth.isAuthenticated,
    auth.isAdmin
  ]);
  
  return <AuthContext.Provider value={memoizedAuth}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Main auth logic
function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Debug function to check localStorage state
  const debugAuthState = useCallback(() => {
    console.log('Current auth state:', {
      token: localStorage.getItem('auth_token') ? 'EXISTS' : 'NOT FOUND',
      user: localStorage.getItem('user') ? 'EXISTS' : 'NOT FOUND',
      parsed: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    });
  }, []);
  
  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        debugAuthState();
        
        // Check if we have valid authentication data
        if (authService.isAuthenticated()) {
          const userData = authService.getAuthUser();
          console.log('Found existing auth data:', userData);
          
          setUser(userData);
        } else {
          console.log('No valid auth data found');
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
        // Clear potentially corrupted auth data
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [debugAuthState]);
  
  // Login function - updated to work with backend API
  const login = useCallback(async (usernameOrEmail, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!usernameOrEmail || !password) {
        throw new Error('Username and password are required');
      }
      
      console.log('AuthContext: Attempting login...');
      debugAuthState();
      
      // Use the authService to authenticate with the backend API
      // Backend expects 'username' parameter, so we'll use usernameOrEmail as username
      const result = await authService.loginAdmin(usernameOrEmail, password);
      
      console.log('AuthContext: Login response received:', result);
      
      // Verify authentication was successful
      if (!authService.isAuthenticated()) {
        throw new Error('Authentication failed: No valid session created');
      }
      
      // Get the user data that was saved to localStorage
      const userData = authService.getAuthUser();
      if (!userData) {
        throw new Error('Authentication failed: No user data available');
      }
      
      // Set the user state
      setUser(userData);
      
      debugAuthState();
      console.log('AuthContext: User state updated successfully');
      
      return result;
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      setError(err.message || 'Login failed');
      setUser(null);
      // Clear any partial auth data
      authService.logout();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [debugAuthState]);
  
  // Logout function - updated to call backend logout and redirect to login
  const logout = useCallback(async (navigate) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Logging out...');
      
      // Try to call backend logout API first
      try {
        await authService.logoutAdmin();
        console.log('AuthContext: Backend logout successful');
      } catch (err) {
        console.warn('AuthContext: Backend logout failed, continuing with local logout:', err);
        // Continue with local logout even if backend call fails
      }
      
      // Always clear local state regardless of backend response
      authService.logout();
      setUser(null);
      setError(null);
      
      console.log('AuthContext: User logged out successfully');
      debugAuthState();
      
      // Redirect to login page if navigate function is provided
      if (navigate) {
        console.log('AuthContext: Redirecting to login page');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
      // Force local logout even if there's an error
      authService.logout();
      setUser(null);
      
      // Still redirect to login even on error
      if (navigate) {
        navigate('/login', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  }, [debugAuthState]);
  
  // Check token validity - useful for debugging
  const verifyAuth = useCallback(() => {
    const isValid = authService.isAuthenticated();
    const userData = authService.getAuthUser();
    
    console.log('Auth verification:', {
      isValid,
      hasUser: !!userData,
      user: userData
    });
    
    if (!isValid && user) {
      console.log('Auth state invalid, clearing user');
      setUser(null);
    } else if (isValid && !user && userData) {
      console.log('Auth valid but no user state, restoring user');
      setUser(userData);
    }
    
    return isValid;
  }, [user]);
  
  // For debugging: log user state changes
  useEffect(() => {
    console.log('Auth user state changed:', { 
      isAuthenticated: Boolean(user), 
      user 
    });
  }, [user]);
  
  // Computed properties
  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user?.role === 'admin' || user?.role === 'superadmin');
  
  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    verifyAuth,
    // Add method to manually refresh auth state
    refreshAuth: debugAuthState
  };
}

export default AuthProvider;