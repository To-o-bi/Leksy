// Enhanced API Client with better token management
import axios from 'axios';
import { API_CONFIG } from './config.js';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Accept': 'application/json' }
    });
    
    this.requestQueue = new Map();
    this.tokenRefreshPromise = null;
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        const isAdminRoute = config.url?.includes('/admin/') && !config.url?.includes('/admin/login');
        
        if (isAdminRoute && token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Adding auth header for admin route:', config.url);
        }
        
        return config;
      },
      (error) => Promise.reject(this.formatError(error))
    );

    this.client.interceptors.response.use(
      (response) => {
        // Always update token if provided in response
        if (response.data?.token) {
          console.log('Updating token from API response');
          this.setToken(response.data.token);
        }
        return response;
      },
      async (error) => {
        const { config, response } = error;
        
        // Handle 401 errors (token expired/invalid)
        if (response?.status === 401) {
          console.log('401 error detected - token expired or invalid');
          
          // Don't retry login requests
          if (config.url?.includes('/admin/login')) {
            return Promise.reject(this.formatError(error));
          }
          
          // Clear auth and redirect to login
          this.clearAuth();
          this.handleAuthExpired();
          return Promise.reject(this.formatError(error));
        }

        // Retry logic for network errors
        if (this.shouldRetry(error) && config && !config._retry) {
          config._retryCount = (config._retryCount || 0) + 1;
          
          if (config._retryCount <= API_CONFIG.MAX_RETRIES) {
            config._retry = true;
            await this.delay(API_CONFIG.RETRY_DELAY * config._retryCount);
            return this.client(config);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  handleAuthExpired() {
    console.log('Authentication expired - clearing session');
    
    // Emit custom event for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:expired'));
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        // Small delay to allow components to handle the event
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
  }

  shouldRetry(error) {
    return !error.response || 
           error.code === 'ECONNABORTED' || 
           (error.response.status >= 500 && error.response.status <= 599);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatError(error) {
    if (error.response?.data?.message) return new Error(error.response.data.message);
    if (error.code === 'ECONNABORTED') return new Error('Request timeout');
    if (!error.response) return new Error('Network error');
    return new Error('An error occurred');
  }

  async request(config) {
    const key = this.getRequestKey(config);
    
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = this.client(config).finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  getRequestKey(config) {
    return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
  }

  getToken() {
    try {
      // Check if token is expired before returning
      const tokenData = this.getTokenWithExpiry();
      if (!tokenData || this.isTokenExpired(tokenData)) {
        console.log('Token is expired or missing');
        this.clearAuth();
        return null;
      }
      
      return tokenData.token;
    } catch (error) {
      console.error('Error getting token:', error);
      this.clearAuth();
      return null;
    }
  }

  getTokenWithExpiry() {
    try {
      // Try cookie first
      const match = document.cookie.match(/auth=([^;]+)/);
      if (match) {
        try {
          const decoded = atob(match[1]);
          return JSON.parse(decoded);
        } catch {
          // If it's not JSON, treat as legacy token
          return {
            token: atob(match[1]),
            expiresAt: Date.now() + (23 * 60 * 60 * 1000) // 23 hours default
          };
        }
      }
      
      // Fallback to localStorage
      const tokenData = localStorage.getItem('auth_token_data');
      if (tokenData) {
        return JSON.parse(tokenData);
      }
      
      // Legacy fallback
      const legacyToken = localStorage.getItem('auth_token');
      if (legacyToken) {
        return {
          token: legacyToken,
          expiresAt: Date.now() + (23 * 60 * 60 * 1000) // 23 hours default
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing token data:', error);
      return null;
    }
  }

  isTokenExpired(tokenData) {
    if (!tokenData || !tokenData.expiresAt) {
      return true;
    }
    
    // Add 5 minute buffer before actual expiry
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    return Date.now() >= (tokenData.expiresAt - bufferTime);
  }

  setToken(token, expiryHours = 24) {
    const tokenData = {
      token: token,
      expiresAt: Date.now() + (expiryHours * 60 * 60 * 1000),
      createdAt: Date.now()
    };
    
    // Store in cookie (encoded)
    const encoded = btoa(JSON.stringify(tokenData));
    const expires = new Date(tokenData.expiresAt).toUTCString();
    document.cookie = `auth=${encoded}; path=/; expires=${expires}; SameSite=Strict; Secure`;
    
    // Store in localStorage as backup
    localStorage.setItem('auth_token_data', JSON.stringify(tokenData));
    
    console.log('Token stored with expiry:', new Date(tokenData.expiresAt).toLocaleString());
  }

  clearAuth() {
    // Clear cookie
    document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token_data');
    localStorage.removeItem('auth_token'); // Legacy cleanup
    
    console.log('Auth data cleared');
  }

  // Check if current token is about to expire
  isTokenExpiringSoon(minutesThreshold = 10) {
    const tokenData = this.getTokenWithExpiry();
    if (!tokenData || !tokenData.expiresAt) {
      return true;
    }
    
    const thresholdTime = minutesThreshold * 60 * 1000;
    return Date.now() >= (tokenData.expiresAt - thresholdTime);
  }

  // Get remaining token time in minutes
  getTokenRemainingTime() {
    const tokenData = this.getTokenWithExpiry();
    if (!tokenData || !tokenData.expiresAt) {
      return 0;
    }
    
    const remaining = tokenData.expiresAt - Date.now();
    return Math.max(0, Math.floor(remaining / (60 * 1000))); // in minutes
  }

  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request({ method: 'get', url: fullUrl });
  }

  async post(url, data, config = {}) {
    return this.request({ method: 'post', url, data, ...config });
  }

  async postFormData(url, formData) {
    return this.request({ 
      method: 'post', 
      url, 
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}

const api = new ApiClient();
export default api;