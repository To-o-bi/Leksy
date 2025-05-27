import api from '../axios';

/**
 * Login as admin - accepts email/username and password
 * @param {string} emailOrUsername - Admin email or username
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Login response with user data and token
 */
export const loginAdmin = async (emailOrUsername, password) => {
  try {
    // Validate required fields
    if (!emailOrUsername || !password) {
      throw new Error('Username and password are required');
    }
    
    console.log('authService: Attempting admin login...');
    
    // The API expects username, so we'll use the email/username as username
    // In your case, the API documentation shows username "leksy" and email "admin@leksy.com.ng"
    // So we'll use whatever is provided as the username parameter
    const response = await api.postWithParams('/admin/login', {
      username: emailOrUsername,
      password: password
    });
    
    console.log('authService: Login response:', response.data);
    
    if (response.data && response.data.code === 200) {
      // Store user data and token in localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('authService: User data stored');
      }
      
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        // Update axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log('authService: Token stored and header updated');
      }
      
      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    console.error('authService: Login error:', error);
    
    // Check for specific error types
    if (error.response?.status === 401) {
      throw new Error('Invalid credentials');
    } else if (error.response?.status === 404) {
      throw new Error('Login endpoint not found');
    } else if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message ||
      'Unable to login. Please check your credentials and try again.'
    );
  }
};

/**
 * Login as admin - alternative method that accepts credentials object
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Admin username
 * @param {string} credentials.password - Admin password
 * @returns {Promise<Object>} Login response with user data and token
 */
export const login = async (credentials) => {
  return loginAdmin(credentials.username, credentials.password);
};

/**
 * Logout the current user
 */
export const logout = () => {
  console.log('authService: Logging out...');
  
  // Clear stored data
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  
  // Remove authorization header
  delete api.defaults.headers.common['Authorization'];
  
  console.log('authService: Logout complete');
  
  // Don't automatically redirect - let the component handle it
};

/**
 * Get the current logged in user (alias for getAuthUser)
 * @returns {Object|null} User object or null if not logged in
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Get the current logged in user (expected by AuthContext)
 * @returns {Object|null} User object or null if not logged in
 */
export const getAuthUser = () => {
  return getCurrentUser();
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get the current auth token
 * @returns {string|null} Auth token or null if not available
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export default {
  login,
  loginAdmin,
  logout,
  getCurrentUser,
  getAuthUser,
  isAuthenticated,
  getAuthToken
};