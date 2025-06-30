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
    this.isRefreshing = false;
    this.failedQueue = [];
    this.refreshPromise = null;
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        const isAdminRoute = this.isAdminRoute(config.url);
        
        if (isAdminRoute && token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Adding auth header for admin route:', config.url);
        }
        
        return config;
      },
      (error) => Promise.reject(this.formatError(error))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Update token if provided
        if (response.data?.token) {
          console.log('Updating token from API response');
          this.setToken(response.data.token);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 errors with proper queue management
        if (error.response?.status === 401 && !this.isLoginRoute(originalRequest.url)) {
          return this.handleTokenExpiration(originalRequest, error);
        }

        // Retry logic for network errors
        if (this.shouldRetry(error) && originalRequest && !originalRequest._retry) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          if (originalRequest._retryCount <= (API_CONFIG.MAX_RETRIES || 3)) {
            originalRequest._retry = true;
            await this.delay((API_CONFIG.RETRY_DELAY || 1000) * originalRequest._retryCount);
            return this.client(originalRequest);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  async handleTokenExpiration(originalRequest, error) {
    // Prevent infinite loops
    if (originalRequest._retry) {
      this.clearAuth();
      this.redirectToLogin('Token refresh failed');
      return Promise.reject(this.formatError(error));
    }

    // If already refreshing, queue the request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    // Start refresh process
    originalRequest._retry = true;
    this.isRefreshing = true;

    try {
      console.log('Token expired, attempting refresh...');
      const newToken = await this.refreshToken();
      
      if (newToken) {
        // Process queued requests
        this.processQueue(null, newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return this.client(originalRequest);
      } else {
        throw new Error('No token received from refresh');
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      this.processQueue(refreshError, null);
      this.clearAuth();
      this.redirectToLogin('Session expired');
      return Promise.reject(this.formatError(refreshError));
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
        resolve(this.client(config));
      }
    });
    
    this.failedQueue = [];
  }

  async refreshToken() {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.attemptTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  async attemptTokenRefresh() {
    try {
      // Check if refresh token exists
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Create a clean axios instance for refresh to avoid interceptors
      const refreshClient = axios.create({
        baseURL: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
      });

      const response = await refreshClient.post('/auth/refresh', {
        refreshToken: refreshToken
      });

      if (response.data?.token) {
        this.setToken(response.data.token);
        
        // Update refresh token if provided (token rotation)
        if (response.data.refreshToken) {
          this.setRefreshToken(response.data.refreshToken);
        }
        
        return response.data.token;
      }
      
      throw new Error('Invalid refresh response - no token received');
    } catch (error) {
      console.error('Refresh token request failed:', error);
      
      // If refresh token is invalid, clear everything
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.clearAuth();
      }
      
      throw error;
    }
  }

  redirectToLogin(reason = 'Authentication required') {
    if (typeof window === 'undefined') return;
    
    console.log(`🔄 Redirecting to login: ${reason}`);
    
    // Emit event for components to handle
    window.dispatchEvent(new CustomEvent('auth:expired', { 
      detail: { reason } 
    }));
    
    // Simple redirect without complex routing logic
    setTimeout(() => {
      const currentPath = window.location.pathname;
      if (!this.isLoginRoute(currentPath)) {
        // Store current path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = `/admin/login?reason=${encodeURIComponent(reason)}`;
      }
    }, 100);
  }

  // Helper methods
  isAdminRoute(url) {
    if (!url) return false;
    return url.includes('/admin/') && !this.isLoginRoute(url);
  }

  isLoginRoute(url) {
    if (!url) return false;
    const loginPatterns = ['/admin/login', '/login', '/auth/login', '/signin'];
    return loginPatterns.some(pattern => url.includes(pattern));
  }

  shouldRetry(error) {
    // Don't retry on auth errors or client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false;
    }
    
    return !error.response || 
           error.code === 'ECONNABORTED' || 
           error.code === 'NETWORK_ERROR' ||
           error.code === 'ENOTFOUND' ||
           error.code === 'ECONNRESET' ||
           (error.response?.status >= 500 && error.response?.status <= 599);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatError(error) {
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') return new Error('Request timeout - please try again');
      if (error.code === 'NETWORK_ERROR') return new Error('Network error - check your connection');
      if (error.code === 'ENOTFOUND') return new Error('Server not found - check your connection');
      return new Error('Network connection failed');
    }

    // Handle HTTP errors with API response
    const status = error.response.status;
    const data = error.response.data;
    
    // Try to get error message from response
    if (data?.message) return new Error(data.message);
    if (data?.error) return new Error(data.error);
    if (typeof data === 'string') return new Error(data);
    
    // Default HTTP status messages
    switch (status) {
      case 400:
        return new Error('Bad request - please check your input');
      case 401:
        return new Error('Authentication required');
      case 403:
        return new Error('Access denied - insufficient permissions');
      case 404:
        return new Error('Resource not found');
      case 422:
        return new Error('Validation failed - please check your input');
      case 429:
        return new Error('Too many requests - please wait and try again');
      case 500:
        return new Error('Server error - please try again later');
      case 502:
        return new Error('Bad gateway - server is temporarily unavailable');
      case 503:
        return new Error('Service unavailable - please try again later');
      default:
        return new Error(`HTTP ${status}: ${error.response.statusText || 'An error occurred'}`);
    }
  }

  async request(config) {
    const key = this.getRequestKey(config);
    
    // Only deduplicate GET requests to avoid issues with mutations
    if (config.method?.toLowerCase() === 'get' && this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = this.client(config).finally(() => {
      this.requestQueue.delete(key);
    });

    if (config.method?.toLowerCase() === 'get') {
      this.requestQueue.set(key, promise);
    }
    
    return promise;
  }

  getRequestKey(config) {
    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url || '';
    const params = JSON.stringify(config.params || {});
    return `${method}-${url}-${params}`;
  }

  getToken() {
    if (typeof window === 'undefined') return null;
    
    try {
      const tokenData = this.getTokenWithExpiry();
      if (!tokenData || this.isTokenExpired(tokenData)) {
        return null;
      }
      
      return tokenData.token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  getRefreshToken() {
    if (typeof window === 'undefined') return null;
    
    try {
      // Check localStorage first (more reliable than cookies for JS access)
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('refresh_token');
        if (token) return token;
      }
      
      // Fallback to cookie (though HttpOnly cookies can't be read by JS)
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/refreshToken=([^;]+)/);
        if (match) return decodeURIComponent(match[1]);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  setRefreshToken(refreshToken) {
    if (typeof window === 'undefined') return;
    
    try {
      // Store in localStorage (primary storage)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      // Store in cookie (fallback, but can't be HttpOnly when set by JS)
      if (typeof document !== 'undefined') {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30); // 30 days
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; expires=${expires.toUTCString()}; SameSite=Strict${secure}`;
      }
      
      console.log('Refresh token stored');
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }
  }

  getTokenWithExpiry() {
    if (typeof window === 'undefined') return null;
    
    try {
      // Try localStorage first
      if (typeof localStorage !== 'undefined') {
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
      }
      
      // Fallback to cookie
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/auth=([^;]+)/);
        if (match) {
          try {
            const decoded = atob(match[1]);
            try {
              return JSON.parse(decoded);
            } catch {
              // Legacy token format
              return {
                token: decoded,
                expiresAt: Date.now() + (23 * 60 * 60 * 1000)
              };
            }
          } catch (error) {
            console.error('Error decoding cookie token:', error);
            // Clear corrupted cookie
            document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        }
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
    
    // 2 minute buffer before actual expiry
    const bufferTime = 2 * 60 * 1000;
    return Date.now() >= (tokenData.expiresAt - bufferTime);
  }

  setToken(token, expiryHours = 24) {
    if (typeof window === 'undefined') return;
    
    const tokenData = {
      token: token,
      expiresAt: Date.now() + (expiryHours * 60 * 60 * 1000),
      createdAt: Date.now()
    };
    
    try {
      // Store in localStorage (primary storage)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token_data', JSON.stringify(tokenData));
      }
      
      // Store in cookie (fallback)
      if (typeof document !== 'undefined') {
        const encoded = btoa(JSON.stringify(tokenData));
        const expires = new Date(tokenData.expiresAt).toUTCString();
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `auth=${encoded}; path=/; expires=${expires}; SameSite=Strict${secure}`;
      }
      
      console.log('Token stored with expiry:', new Date(tokenData.expiresAt).toLocaleString());
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  clearAuth() {
    if (typeof window === 'undefined') return;
    
    try {
      // Clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token_data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
      
      // Clear cookies
      if (typeof document !== 'undefined') {
        document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      console.log('Auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
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

  // Public API methods
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request({ method: 'get', url: fullUrl });
  }

  async post(url, data, config = {}) {
    return this.request({ method: 'post', url, data, ...config });
  }

  async put(url, data, config = {}) {
    return this.request({ method: 'put', url, data, ...config });
  }

  async patch(url, data, config = {}) {
    return this.request({ method: 'patch', url, data, ...config });
  }

  async delete(url, config = {}) {
    return this.request({ method: 'delete', url, ...config });
  }

  async postFormData(url, formData) {
    return this.request({ 
      method: 'post', 
      url, 
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async putFormData(url, formData) {
    return this.request({ 
      method: 'put', 
      url, 
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}

const api = new ApiClient();
export default api;