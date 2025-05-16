// src/api/axios.js
import axios from 'axios';

// Create axios instance with custom config
const instance = axios.create({
  // For XAMPP development environment vs production Leksy server
  baseURL: import.meta.env.MODE === 'production' 
    ? 'https://leksycosmetics.com' 
    : 'http://localhost', // Adjust this path to match your XAMPP project folder
  timeout: 15000,
  headers: {
    'Accept': 'application/json'
  }
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage if it exists
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // IMPORTANT: Do NOT force GET method for fetch operations
    // The API documentation indicates POST should be used
    
    // Log request details in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method,
        url: config.baseURL + config.url,
        data: config.data,
        params: config.params,
        headers: config.headers
      });
    }
    
    // Set Content-Type to application/json by default unless it's a multipart form
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Log responses in development mode
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
  
    // Extract token from response if available (for Leksy API token refresh)
    if (response.data && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response;
  },
  (error) => {
    // Log errors in development mode
    if (import.meta.env.DEV) {
      console.error('API Error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Request URL:', error.config?.url);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
    }
  
    // Handle common errors
    const { response } = error;
    
    if (response && response.status === 401) {
      // Unauthorized - logout user
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    
    // API specific error handling based on response code
    if (response && response.data && response.data.code) {
      console.error(`API Error Code: ${response.data.code}`, response.data.message || 'Unknown error');
    }
    
    // Handle other error cases
    if (response) {
      const statusMessages = {
        403: 'You do not have permission to perform this action',
        404: 'The requested resource was not found',
        500: 'Internal server error occurred'
      };
      
      if (statusMessages[response.status]) {
        console.error(statusMessages[response.status]);
      }
    } else {
      // Network error
      console.error('Network error - please check your connection');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to detect if we're in development environment
 * This is useful when you need to check outside of a component
 */
export const isDevelopment = () => {
  return import.meta.env.DEV === true;
};

/**
 * Add a request timeout
 * @param {number} ms - Timeout in milliseconds
 */
export const setTimeout = (ms) => {
  instance.defaults.timeout = ms;
};

/**
 * Set a default header for all requests
 * @param {string} name - Header name
 * @param {string} value - Header value
 */
export const setDefaultHeader = (name, value) => {
  instance.defaults.headers.common[name] = value;
};

// Add default export for the axios instance
export default instance;