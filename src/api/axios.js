import axios from 'axios';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://leksycosmetics.com/api',
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });
    
    // In-memory storage for browser compatibility
    this.tokenStore = null;
    this.userStore = null;
    
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - add token to headers
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle auth errors
    this.client.interceptors.response.use(
      (response) => {
        // Handle API-level 401 errors
        if (response.data?.code === 401) {
          this.handleAuthError('Session expired');
          const error = new Error(response.data.message || 'Unauthorized');
          error.response = { status: 401, data: response.data };
          throw error;
        }
        return response;
      },
      (error) => {
        // Handle HTTP 401 errors
        if (error.response?.status === 401) {
          this.handleAuthError('Authentication failed');
        }
        return Promise.reject(error);
      }
    );
  }

  handleAuthError(reason) {
    this.clearAuth();
    
    // Emit custom event for auth providers to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authError', { detail: { reason } }));
    }
  }

  // Token management using secure cookies + in-memory backup
  getToken() {
    // Try in-memory first (fastest)
    if (this.tokenStore) {
      return this.tokenStore;
    }

    // Fallback to secure cookie
    if (typeof document === 'undefined') return null;
    
    try {
      const match = document.cookie.match(/auth_token=([^;]+)/);
      const token = match ? atob(match[1]) : null;
      
      // Store in memory for future requests
      if (token) {
        this.tokenStore = token;
      }
      
      return token;
    } catch (error) {
      return null;
    }
  }

  setToken(token) {
    if (!token) return;
    
    // Store in memory immediately
    this.tokenStore = token;
    
    // Store in secure cookie for persistence
    if (typeof document !== 'undefined') {
      try {
        const encoded = btoa(token);
        // Use Secure flag only on HTTPS
        const isHttps = window.location.protocol === 'https:';
        const secureFlag = isHttps ? '; Secure' : '';
        const cookieString = `auth_token=${encoded}; path=/; max-age=31536000; SameSite=Strict${secureFlag}`;
        document.cookie = cookieString;
        
        // Verify the cookie was set
        const verification = document.cookie.match(/auth_token=([^;]+)/);
      } catch (error) {
        // Silent error handling for production
      }
    }
    
    // Update axios default headers immediately
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // User data management
  getUser() {
    // Try in-memory first
    if (this.userStore) {
      return this.userStore;
    }

    // Fallback to secure cookie
    if (typeof document === 'undefined') return null;
    
    try {
      const match = document.cookie.match(/user_data=([^;]+)/);
      if (match) {
        const user = JSON.parse(atob(match[1]));
        this.userStore = user; // Cache in memory
        return user;
      }
    } catch (error) {
      // Silent error handling for production
    }
    return null;
  }

  setUser(userData) {
    if (!userData) return;
    
    // Store in memory immediately
    this.userStore = userData;
    
    // Store in secure cookie for persistence
    if (typeof document !== 'undefined') {
      try {
        const encoded = btoa(JSON.stringify(userData));
        // Use Secure flag only on HTTPS
        const isHttps = window.location.protocol === 'https:';
        const secureFlag = isHttps ? '; Secure' : '';
        const cookieString = `user_data=${encoded}; path=/; max-age=31536000; SameSite=Strict${secureFlag}`;
        document.cookie = cookieString;
        
        // Verify the cookie was set
        const verification = document.cookie.match(/user_data=([^;]+)/);
      } catch (error) {
        // Silent error handling for production
      }
    }
  }

  clearAuth() {
    // Clear in-memory storage
    this.tokenStore = null;
    this.userStore = null;
    
    // Clear cookies
    if (typeof document !== 'undefined') {
      const isHttps = window.location.protocol === 'https:';
      const secureFlag = isHttps ? '; Secure' : '';
      
      document.cookie = `auth_token=; path=/; max-age=0; SameSite=Strict${secureFlag}`;
      document.cookie = `user_data=; path=/; max-age=0; SameSite=Strict${secureFlag}`;
     
    }
    
    // Clear axios headers
    delete this.client.defaults.headers.common['Authorization'];
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Helper method to build URL with query parameters
  buildUrlWithParams(url, params) {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }
    const queryString = new URLSearchParams(params).toString();
    return `${url}?${queryString}`;
  }

  // API methods
  async get(url, params = {}) {
    const fullUrl = this.buildUrlWithParams(url, params);
    return await this.client.get(fullUrl);
  }

  async post(url, data, config = {}) {
    // Handle query parameters in POST requests
    if (config.params) {
      const fullUrl = this.buildUrlWithParams(url, config.params);
      // Remove params from config to avoid axios processing them again
      const newConfig = { ...config };
      delete newConfig.params;
      return await this.client.post(fullUrl, data, newConfig);
    }
    
    return await this.client.post(url, data, config);
  }

  async put(url, data, config = {}) {
    // Handle query parameters in PUT requests
    if (config.params) {
      const fullUrl = this.buildUrlWithParams(url, config.params);
      const newConfig = { ...config };
      delete newConfig.params;
      return await this.client.put(fullUrl, data, newConfig);
    }
    
    return await this.client.put(url, data, config);
  }

  async delete(url, config = {}) {
    // Handle query parameters in DELETE requests
    if (config.params) {
      const fullUrl = this.buildUrlWithParams(url, config.params);
      const newConfig = { ...config };
      delete newConfig.params;
      return await this.client.delete(fullUrl, newConfig);
    }
    
    return await this.client.delete(url, config);
  }

  async postFormData(url, formData, config = {}) {
    const finalConfig = {
      ...config,
      headers: { 
        'Content-Type': 'multipart/form-data',
        ...config.headers
      }
    };
    
    // Handle query parameters in form data posts
    if (finalConfig.params) {
      const fullUrl = this.buildUrlWithParams(url, finalConfig.params);
      delete finalConfig.params;
      return await this.client.post(fullUrl, formData, finalConfig);
    }
    
    return await this.client.post(url, formData, finalConfig);
  }
}

// Create singleton instance
const api = new ApiClient();

export default api;