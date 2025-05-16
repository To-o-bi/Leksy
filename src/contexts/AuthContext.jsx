import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        setUser(authService.getAuthUser());
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.loginAdmin(username, password);
      setUser(response.user);
      return response;
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const clearError = () => {
    setError(null);
  };

  const isAdmin = () => {
    return user && (user.role === 'admin' || user.role === 'superadmin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAdmin,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;