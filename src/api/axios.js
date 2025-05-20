import axios from 'axios';

// Create a direct instance pointing to the real API
const instance = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'https://leksycosmetics.com/api',
  timeout: 30000, // 30 seconds timeout for slow connections
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// List of public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/fetch-products',
  '/fetch-product',
  '/contact'
];

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Check if this is a public endpoint
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      config.url && config.url.includes(endpoint)
    );
    
    // Check if this is an admin endpoint
    const isAdminEndpoint = config.url && config.url.includes('/admin/');
    
    // Add auth token from localStorage if it exists and endpoint requires it
    const token = localStorage.getItem('auth_token');
    
    if (token && !isPublicEndpoint) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    } else if (!token && isAdminEndpoint) {
      console.warn('No auth token found for admin request:', config.url);
      // This will trigger a 401 unauthorized response, which will be caught by the response interceptor
    }
    
    // Only override Content-Type if it's not already set and not FormData
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Log request details in development
    if (import.meta.env.NODE_ENV !== 'production') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
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
  
    // Extract token from response if available and update it
    if (response.data && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      console.log('Token updated from response');
    }
    
    return response;
  },
  (error) => {
    // Log errors with detailed information
    console.error('API Error:', error.message);
    
    if (error.response) {
      console.error('Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        console.warn('Unauthorized request - clearing auth data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden - no permission
      if (error.response.status === 403) {
        console.warn('Forbidden request - user lacks permission');
        // You might want to redirect to a permission denied page
        // or display a notification
      }
      
      // Handle 500 Server errors
      if (error.response.status >= 500) {
        console.error('Server error detected');
        // You might want to show a server error notification
      }
    } else if (error.request) {
      console.error('Error Request:', error.request);
    }
    
    // Handle common errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please check your connection and try again.';
    } else if (!error.response && error.message.includes('Network Error')) {
      error.message = 'Network error. Please check your connection and try again.';
    }
    
    // Add a user-friendly message property if not already present
    if (!error.userMessage) {
      if (error.response && error.response.data && error.response.data.message) {
        error.userMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        error.userMessage = 'Request timed out. Please try again later.';
      } else if (!error.response) {
        error.userMessage = 'Network error. Please check your connection.';
      } else {
        error.userMessage = 'An unexpected error occurred. Please try again.';
      }
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
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Helper method for API calls that need to renew token
instance.withTokenRenewal = async (apiCall) => {
  try {
    return await apiCall();
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Try to refresh token or re-authenticate
      console.log('Token expired - attempting renewal');
      
      // For now, just redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
    }
    throw error;
  }
};

export default instance;