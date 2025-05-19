// src/api/services/authService.js
import api from '../axios';

/**
 * Login as admin
 * @param {string} email - Admin email (will be sent as username to API)
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Login response with token and user data
 */
export const loginAdmin = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  try {
    // Let's try with form data
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    // Make request with form data in body
    const response = await api.post('/admin/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
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
    // If form data approach failed, try with JSON
    if (error.response && error.response.data.code === 412) {
      try {
        console.log("First attempt failed, trying JSON body approach");
        
        // Try with JSON body
        const jsonResponse = await api.post('/admin/login', {
          username: email,
          password: password
        });
        
        if (jsonResponse.data && jsonResponse.data.code === 200) {
          // Store auth token and user data
          if (jsonResponse.data.token) {
            localStorage.setItem('auth_token', jsonResponse.data.token);
          }
          if (jsonResponse.data.user) {
            localStorage.setItem('user', JSON.stringify(jsonResponse.data.user));
          }
          return jsonResponse.data;
        } else {
          throw new Error(jsonResponse.data.message || 'Login failed');
        }
      } catch (jsonError) {
        console.error('JSON login attempt error:', jsonError);
        
        // If JSON approach failed, try one more with x-www-form-urlencoded
        try {
          console.log("Second attempt failed, trying form urlencoded approach");
          
          // Create URLSearchParams
          const params = new URLSearchParams();
          params.append('username', email);
          params.append('password', password);
          
          const urlEncodedResponse = await api.post('/admin/login', params, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          
          if (urlEncodedResponse.data && urlEncodedResponse.data.code === 200) {
            // Store auth token and user data
            if (urlEncodedResponse.data.token) {
              localStorage.setItem('auth_token', urlEncodedResponse.data.token);
            }
            if (urlEncodedResponse.data.user) {
              localStorage.setItem('user', JSON.stringify(urlEncodedResponse.data.user));
            }
            return urlEncodedResponse.data;
          } else {
            throw new Error(urlEncodedResponse.data.message || 'Login failed');
          }
        } catch (urlEncodedError) {
          console.error('URLEncoded login attempt error:', urlEncodedError);
          throw urlEncodedError;
        }
      }
    }
    
    console.error('Login error:', error);
    // Provide more user-friendly error messages
    if (error.response) {
      const errorMsg = error.response.data?.message || 'Invalid credentials';
      throw new Error(errorMsg);
    } else if (error.request) {
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      throw error;
    }
  }
};

// The rest remains the same
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
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
  logout,
  isAuthenticated,
  getAuthUser,
  getToken,
  isAdmin
};