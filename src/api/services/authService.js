// src/api/services/authService.js - Fixed version
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
    console.log('authService: Attempting login with form data approach');
    
    // Try with form data
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    // Make request with form data in body
    const response = await api.post('/admin/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('authService: Response received:', response.data);
    
    if (response.data && response.data.code === 200) {
      // Store auth token and user data
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        console.log('authService: Token saved to localStorage');
      } else {
        console.warn('authService: No token in response');
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('authService: User data saved to localStorage');
      } else {
        console.warn('authService: No user data in response');
        // IMPORTANT: Create a default user object if none was provided
        // This ensures we have user data in localStorage
        const defaultUser = {
          email: email,
          role: 'admin', // Assuming admin role for now
          id: new Date().getTime(), // Generate a placeholder ID
          name: email.split('@')[0] // Use part of email as name
        };
        localStorage.setItem('user', JSON.stringify(defaultUser));
        console.log('authService: Created default user data');
        
        // Add user to response if it didn't exist
        response.data.user = defaultUser;
      }
      
      return response.data;
    } else {
      console.warn('authService: Unexpected response format:', response.data);
      throw new Error(response.data?.message || 'Login failed');
    }
  } catch (error) {
    // If form data approach failed, try with JSON
    if (error.response && error.response.data && error.response.data.code === 412) {
      try {
        console.log("authService: First attempt failed, trying JSON body approach");
        
        // Try with JSON body
        const jsonResponse = await api.post('/admin/login', {
          username: email,
          password: password
        });
        
        console.log('authService: JSON response received:', jsonResponse.data);
        
        if (jsonResponse.data && jsonResponse.data.code === 200) {
          // Store auth token and user data
          if (jsonResponse.data.token) {
            localStorage.setItem('auth_token', jsonResponse.data.token);
            console.log('authService: Token saved to localStorage');
          } else {
            console.warn('authService: No token in JSON response');
          }
          
          if (jsonResponse.data.user) {
            localStorage.setItem('user', JSON.stringify(jsonResponse.data.user));
            console.log('authService: User data saved to localStorage');
          } else {
            console.warn('authService: No user data in JSON response');
            // Create a default user object if none was provided
            const defaultUser = {
              email: email,
              role: 'admin',
              id: new Date().getTime(),
              name: email.split('@')[0]
            };
            localStorage.setItem('user', JSON.stringify(defaultUser));
            console.log('authService: Created default user data');
            
            // Add user to response if it didn't exist
            jsonResponse.data.user = defaultUser;
          }
          
          return jsonResponse.data;
        } else {
          console.warn('authService: Unexpected JSON response format:', jsonResponse.data);
          throw new Error(jsonResponse.data?.message || 'Login failed');
        }
      } catch (jsonError) {
        console.error('authService: JSON login attempt error:', jsonError);
        
        // If JSON approach failed, try one more with x-www-form-urlencoded
        try {
          console.log("authService: Second attempt failed, trying form urlencoded approach");
          
          // Create URLSearchParams
          const params = new URLSearchParams();
          params.append('username', email);
          params.append('password', password);
          
          const urlEncodedResponse = await api.post('/admin/login', params, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          
          console.log('authService: URLEncoded response received:', urlEncodedResponse.data);
          
          if (urlEncodedResponse.data && urlEncodedResponse.data.code === 200) {
            // Store auth token and user data
            if (urlEncodedResponse.data.token) {
              localStorage.setItem('auth_token', urlEncodedResponse.data.token);
              console.log('authService: Token saved to localStorage');
            } else {
              console.warn('authService: No token in URLEncoded response');
            }
            
            if (urlEncodedResponse.data.user) {
              localStorage.setItem('user', JSON.stringify(urlEncodedResponse.data.user));
              console.log('authService: User data saved to localStorage');
            } else {
              console.warn('authService: No user data in URLEncoded response');
              // Create a default user object if none was provided
              const defaultUser = {
                email: email,
                role: 'admin',
                id: new Date().getTime(),
                name: email.split('@')[0]
              };
              localStorage.setItem('user', JSON.stringify(defaultUser));
              console.log('authService: Created default user data');
              
              // Add user to response if it didn't exist
              urlEncodedResponse.data.user = defaultUser;
            }
            
            return urlEncodedResponse.data;
          } else {
            console.warn('authService: Unexpected URLEncoded response format:', urlEncodedResponse.data);
            throw new Error(urlEncodedResponse.data?.message || 'Login failed');
          }
        } catch (urlEncodedError) {
          console.error('authService: URLEncoded login attempt error:', urlEncodedError);
          throw urlEncodedError;
        }
      }
    }
    
    console.error('authService: Login error:', error);
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
  console.log('authService: Logged out - cleared localStorage');
};

export const isAuthenticated = () => {
  const hasToken = !!localStorage.getItem('auth_token');
  console.log('authService: isAuthenticated check -', hasToken);
  return hasToken;
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