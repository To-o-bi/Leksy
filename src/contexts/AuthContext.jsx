import { useState, useEffect, useContext, createContext, useMemo } from 'react';
import authService from '../api/services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  const memoizedAuth = useMemo(() => auth, [
    auth.user, 
    auth.isLoading, 
    auth.error, 
    auth.isAuthenticated
  ]);
  
  return <AuthContext.Provider value={memoizedAuth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      setIsLoading(true);
      try {
        // Check if we have a valid token and user data
        if (authService.isAuthenticated()) {
          setUser(authService.getAuthUser());
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
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Make sure both email and password are provided
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Use the authService to authenticate with the API
      const result = await authService.loginAdmin(email, password);
      setUser(result.user);
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Computed properties
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };
}

export default AuthProvider;