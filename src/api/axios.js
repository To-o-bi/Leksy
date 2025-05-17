import axios from 'axios';

// Create a direct instance pointing to the real API
const instance = axios.create({
  baseURL: 'https://leksycosmetics.com/api',
  timeout: 30000, // 30 seconds timeout for slow connections
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
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
    
    // Only override Content-Type if it's not already set and not FormData
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Log request details in development
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    
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
    // Log responses
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
  
    // Extract token from response if available
    if (response.data && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
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
    } else if (error.request) {
      console.error('Error Request:', error.request);
    }
    
    // Handle common errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please check your connection and try again.';
    } else if (!error.response && error.message.includes('Network Error')) {
      error.message = 'Network error. Please check your connection and try again.';
    }
    
    return Promise.reject(error);
  }
);

export default instance;