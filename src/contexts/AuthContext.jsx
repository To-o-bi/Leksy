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
        // Debug current localStorage state
        debugAuthState();
        
        // Check if we have a valid token and user data
        if (authService.isAuthenticated()) {
          const userData = authService.getAuthUser();
          console.log('Found existing auth data:', userData);
          
          // Verify that token exists
          const token = localStorage.getItem('auth_token');
          if (!token) {
            console.error('User data exists but no token found');
            throw new Error('Auth token missing');
          }
          
          setUser(userData);
        } else {
          console.log('No valid auth data found');
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
        // Clear potentially corrupted auth data
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [debugAuthState]);
  
  // Login function
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Make sure both email and password are provided
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      console.log('AuthContext: Attempting login...');
      debugAuthState();
      
      // Use the authService to authenticate with the API
      const result = await authService.loginAdmin(email, password);
      
      console.log('AuthContext: Login response received:', result);
      
      // Verify token was saved properly
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('Login succeeded but no token was saved');
        throw new Error('Authentication error: No token saved');
      }
      
      // Get the user from localStorage after the authService has done its work
      const userData = authService.getAuthUser();
      
      // Set the user state from data in localStorage
      setUser(userData);
      
      // Debug localStorage state after login
      debugAuthState();
      
      console.log('AuthContext: User state updated from localStorage');
      
      return result;
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [debugAuthState]);
  
  // Logout function
  const logout = useCallback(() => {
    setIsLoading(true);
    
    try {
      console.log('AuthContext: Logging out...');
      authService.logout();
      setUser(null);
      console.log('AuthContext: User logged out successfully');
      debugAuthState();
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [debugAuthState]);
  
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
    // Add a method to check if the token is valid
    verifyToken: debugAuthState
  };
}

export default AuthProvider;