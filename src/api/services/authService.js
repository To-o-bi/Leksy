// src/api/services/authService.js
import api from '../axios';

/**
 * Login as admin
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Login response with token and user data
 */
export const loginAdmin = async (username, password) => {
  try {
    const url = `/admin/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const response = await api.post(url);
    
    if (response.data && response.data.code === 200) {
      // Store auth token and user data
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user - clear token and user data
 */
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Get authenticated user data
 * @returns {Object|null} User data or null if not authenticated
 */
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

/**
 * Get authentication token
 * @returns {string|null} Authentication token or null
 */
export const getToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Check if user has admin role
 * @returns {boolean} True if user is admin
 */
export const isAdmin = () => {
  const user = getAuthUser();
  return user && (user.role === 'admin' || user.role === 'superadmin');
};

export default {
  loginAdmin,
  logout,
  isAuthenticated,
  getAuthUser,
  getToken,
  isAdmin
};