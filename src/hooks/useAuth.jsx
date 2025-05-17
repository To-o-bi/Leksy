import { useState, useEffect, useContext, createContext, useMemo } from 'react';

// Create an authentication context
const AuthContext = createContext();

// Admin user object
const ADMIN_USER = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

// Provider component that wraps your app and makes auth object available
export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  // Memoize the auth value to prevent unnecessary re-renders
  const memoizedAuth = useMemo(() => auth, [
    auth.user, 
    auth.isLoading, 
    auth.error, 
    auth.isAuthenticated
  ]);
  
  return <AuthContext.Provider value={memoizedAuth}>{children}</AuthContext.Provider>;
}

// Hook for child components to get the auth object
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      setIsLoading(true);
      try {
        // Check for stored user in localStorage
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
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
      // For demo, we're just simulating an API call and using the predefined admin user
      // In a real app, you would validate credentials against your API
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // Store user in localStorage and state
      localStorage.setItem('authUser', JSON.stringify(ADMIN_USER));
      setUser(ADMIN_USER);
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
      // For demo, we're just simulating an API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Remove user from localStorage and state
      localStorage.removeItem('authUser');
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
  const isAdmin = user?.role === 'admin';
  
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

// Change the default export to be the AuthProvider component
export default AuthProvider;