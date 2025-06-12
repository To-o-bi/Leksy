// src/api/services/authService.js - Fixed to match backend API
import api from './axios';

/**
 * Login as admin
 * @param {string} username - Admin username (not email as per API docs)
 * @param {string} password - Admin password  
 * @returns {Promise<Object>} Login response with token and admin data
 */
export const loginAdmin = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }
  
  try {
    console.log('authService: Attempting login with backend API format');
    
    // According to your API docs, backend expects form data with username/password
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    // Make request to the correct endpoint as per your API docs
    const response = await api.post('/admin/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('authService: Response received:', response.data);
    
    // Check for successful response according to your backend format
    if (response.data && response.data.code === 200) {
      // Store auth token 
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        console.log('authService: Token saved to localStorage');
      } else {
        throw new Error('No token received from server');
      }
      
      // Store admin data as user (your backend returns "admin" object)
      if (response.data.admin) {
        // Convert admin object to user format for frontend consistency
        const userData = {
          id: response.data.admin.username, // Use username as ID since no ID provided
          name: response.data.admin.name,
          email: response.data.admin.email,
          username: response.data.admin.username,
          role: response.data.admin.role
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('authService: Admin data saved as user data');
      } else {
        throw new Error('No admin data received from server');
      }
      
      return response.data;
    } else if (response.data && response.data.code === 401) {
      throw new Error('Invalid credentials');
    } else if (response.data && response.data.code === 412) {
      throw new Error('Username and password are required');
    } else {
      throw new Error(response.data?.message || 'Login failed');
    }
  } catch (error) {
    console.error('authService: Login error:', error);
    
    // Handle different error types based on your backend responses
    if (error.response && error.response.data) {
      const { code, message } = error.response.data;
      
      switch(code) {
        case 400:
          throw new Error('Username and password are required');
        case 401:
          throw new Error('Invalid credentials');
        case 412:
          throw new Error('Please provide both username and password');
        default:
          throw new Error(message || 'Login failed');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw error;
    }
  }
};

/**
 * Logout admin
 * @returns {Promise<Object>} Logout response
 */
export const logoutAdmin = async () => {
  try {
    console.log('authService: Attempting logout');
    
    // Call backend logout endpoint (requires token)
    const response = await api.post('/admin/logout');
    
    console.log('authService: Logout response:', response.data);
    
    // Clear local storage regardless of response
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    console.log('authService: Cleared localStorage');
    
    return response.data;
  } catch (error) {
    console.error('authService: Logout error:', error);
    // Still clear localStorage even if API call fails
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    throw error;
  }
};

export const logout = () => {
  // Synchronous logout for cases where we don't need API call
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  console.log('authService: Logged out - cleared localStorage');
};

export const isAuthenticated = () => {
  const hasToken = !!localStorage.getItem('auth_token');
  const hasUser = !!localStorage.getItem('user');
  console.log('authService: isAuthenticated check -', { hasToken, hasUser });
  return hasToken && hasUser;
};

export const getAuthUser = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

export const getToken = () => {
  return localStorage.getItem('auth_token');
};

export const isAdmin = () => {
  const user = getAuthUser();
  return user && (user.role === 'admin' || user.role === 'superadmin');
};

export default {
  loginAdmin,
  logoutAdmin,
  logout,
  isAuthenticated,
  getAuthUser,
  getToken,
  isAdmin
};