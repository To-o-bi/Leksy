// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as productService from '../api/services/productService';

// Create authentication context
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
  const [token, setToken] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get token from localStorage
        const savedToken = localStorage.getItem('auth_token');
        
        // Get user data from localStorage
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Error restoring authentication state:', err);
        // Clear potentially corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the login API
      const response = await productService.loginAdmin(username, password);
      
      if (response && response.user) {
        setUser(response.user);
        setToken(response.token);
        
        // Store authentication data in localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Login failed:', err);
      
      // Extract error message from response if available
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Login failed. Please check your credentials and try again.';
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear authentication state
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Update state
    setUser(null);
    setToken(null);
  };

  const clearError = () => {
    setError(null);
  };

  const isAdmin = () => {
    return user && (user.role === 'admin' || user.role === 'superadmin');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Get current auth token
  const getToken = () => {
    return token;
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
        clearError,
        isAuthenticated,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;