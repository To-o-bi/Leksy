import axios from 'axios';

// Create a direct instance pointing to the real API
const instance = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'https://leksycosmetics.com/api',
  timeout: 30000, // 30 seconds timeout for slow connections
  headers: {
    'Accept': 'application/json',
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
    }
    
    // For FormData, let the browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Log request details in development
    if (import.meta.env.NODE_ENV !== 'production') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        params: config.params,
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
      const oldToken = localStorage.getItem('auth_token');
      localStorage.setItem('auth_token', response.data.token);
      console.log('Token updated from response');
      
      // Update the default header for future requests
      instance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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
      }
      
      // Handle 500 Server errors
      if (error.response.status >= 500) {
        console.error('Server error detected');
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

// Helper method to handle FormData uploads with query parameters
instance.postFormDataWithParams = async (url, params = {}, files = {}, config = {}) => {
  // Create FormData for files only
  const formData = new FormData();
  
  // Add files to FormData
  Object.entries(files).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(file => {
        formData.append(key, file);
      });
    } else {
      formData.append(key, value);
    }
  });
  
  // Build query string from params
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return instance.post(fullUrl, formData, {
    ...config,
    headers: {
      ...config.headers,
      // Let browser set Content-Type with boundary for multipart/form-data
    },
  });
};

// Helper method for regular POST with query parameters
instance.postWithParams = async (url, params = {}, config = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return instance.post(fullUrl, null, config);
};

export default instance;