import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from './config.js';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Accept': 'application/json' }
    });
    
    this.requestQueue = new Map();
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        const isAdminRoute = config.url?.includes('/admin/') && !config.url?.includes('/admin/login');
        
        if (isAdminRoute && token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(this.formatError(error))
    );

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response) => {
        if (response.data?.token) {
          this.setToken(response.data.token);
        }
        return response;
      },
      async (error) => {
        const { config, response } = error;
        
        if (response?.status === 401) {
          this.clearAuth();
          window.location.href = '/login';
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

  // Request deduplication
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

  // Secure token handling with cookies
  getToken() {
    const match = document.cookie.match(/auth=([^;]+)/);
    return match ? atob(match[1]) : null;
  }

  setToken(token) {
    const encoded = btoa(token);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(); // 24 hours
    document.cookie = `auth=${encoded}; path=/; expires=${expires}; SameSite=Strict; Secure`;
  }

  clearAuth() {
    document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('user');
  }

  // Core methods
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