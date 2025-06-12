// src/api/axios.js - Fixed to match backend API
import axios from 'axios';

// Create axios instance pointing to your backend API
const instance = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'https://leksycosmetics.com/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Accept': 'application/json',
  }
});

// List of public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/fetch-products',
  '/fetch-product',
  '/contact',
  '/initiate-checkout'
];

// List of admin endpoints that require authentication
const ADMIN_ENDPOINTS = [
  '/admin/add-product',
  '/admin/update-product', 
  '/admin/delete-product',
  '/admin/logout'
];

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Check if this is a public endpoint
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      config.url && config.url.includes(endpoint)
    );
    
    // Check if this is an admin endpoint (excluding login)
    const isAdminEndpoint = ADMIN_ENDPOINTS.some(endpoint =>
      config.url && config.url.includes(endpoint)
    );
    
    // Add auth token for admin endpoints (except login)
    const token = localStorage.getItem('auth_token');
    const isLoginEndpoint = config.url && config.url.includes('/admin/login');
    
    if (token && isAdminEndpoint && !isLoginEndpoint) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding token to admin request:', config.url);
    } else if (!token && isAdminEndpoint && !isLoginEndpoint) {
      console.warn('No auth token found for admin request:', config.url);
    }
    
    // Handle different content types
    if (config.data instanceof FormData) {
      // For FormData, let browser set the Content-Type with boundary
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Log request details in development
    if (import.meta.env.NODE_ENV !== 'production') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: config.baseURL + config.url,
        data: config.data instanceof FormData ? 'FormData' : config.data,
        headers: {
          ...config.headers,
          Authorization: config.headers.Authorization ? 'Bearer [HIDDEN]' : undefined
        }
      });
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
    // Log responses in development
    if (import.meta.env.NODE_ENV !== 'production') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
  
    // Handle token renewal from backend
    // Your backend may return a new token in responses to extend session
    if (response.data && response.data.token) {
      const currentToken = localStorage.getItem('auth_token');
      if (currentToken !== response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        console.log('Token updated from response');
      }
    }
    
    return response;
  },
  (error) => {
    // Log errors with detailed information
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle specific error codes from your backend
      switch (status) {
        case 401:
          console.warn('Unauthorized request - clearing auth data');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true';
          }
          break;
          
        case 403:
          console.warn('Forbidden request - user lacks permission');
          break;
          
        case 404:
          console.warn('Endpoint not found:', error.config?.url);
          break;
          
        case 412:
          // Precondition Failed - usually missing required parameters
          console.warn('Precondition failed - missing required parameters');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server error detected');
          break;
      }
      
      // Create a standardized error object
      const apiError = new Error(data?.message || `HTTP ${status} Error`);
      apiError.status = status;
      apiError.code = data?.code;
      apiError.data = data;
      
      return Promise.reject(apiError);
    } else if (error.request) {
      // Network error
      const networkError = new Error('Network error. Please check your connection and try again.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      const timeoutError = new Error('Request timed out. Please try again.');
      timeoutError.isTimeout = true;
      return Promise.reject(timeoutError);
    }
    
    return Promise.reject(error);
  }
);

// Helper method to handle FormData uploads
instance.postFormData = async (url, formData, config = {}) => {
  return instance.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      // Let browser set Content-Type for FormData
    },
  });
};

// Helper method for file uploads with progress
instance.uploadFile = async (url, formData, onUploadProgress) => {
  return instance.post(url, formData, {
    headers: {
      // Let browser set Content-Type for FormData
    },
    onUploadProgress: onUploadProgress
  });
};

// Helper method to check if user is authenticated
instance.isAuthenticated = () => {
  return !!localStorage.getItem('auth_token') && !!localStorage.getItem('user');
};

export default instance;