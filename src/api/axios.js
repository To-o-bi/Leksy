import axios from 'axios';
import { API_CONFIG } from './config.js';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Accept': 'application/json' }
    });
    
    this.setupInterceptors();
    this.initializeAuth();
  }

  // Initialize auth headers on startup
  initializeAuth() {
    const token = this.getToken();
    if (token && !this.isTokenExpired()) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Initialized axios with existing valid token');
    }
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        
        // DEBUG: Log the token and headers
        console.log('🔍 DEBUG: Request interceptor');
        console.log('🔍 Token from cookie:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        console.log('🔍 Request URL:', config.url);
        console.log('🔍 Request method:', config.method);
        
        if (token && !this.isTokenExpired()) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header set:', config.headers.Authorization ? 'YES' : 'NO');
        } else {
          console.log('❌ No valid token available - request may fail if auth required');
          if (token && this.isTokenExpired()) {
            console.log('⚠️ Token expired, clearing auth');
            this.clearAuth();
          }
        }
        
        console.log('🔍 All headers:', config.headers);
        
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(this.formatError(error));
      }
    );

    // Response interceptor - FIXED for cookie approach
    this.client.interceptors.response.use(
      (response) => {
        // Check multiple possible locations for new token
        const newToken = response.data?.token || 
                         response.data?.data?.token || 
                         response.headers['x-new-token'] ||
                         response.headers['new-token'];
        
        if (newToken) {
          console.log('🔄 Updating token from API response');
          console.log('🔄 Old token:', this.getToken()?.substring(0, 20) + '...');
          console.log('🔄 New token:', newToken.substring(0, 20) + '...');
          
          // Update token and axios headers
          this.setToken(newToken);
          
          console.log('✅ Token updated successfully');
        }
        
        return response;
      },
      async (error) => {
        console.error('❌ Response error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        
        // Handle 401 errors - clear auth and redirect
        if (error.response?.status === 401) {
          console.log('🔄 401 error - clearing auth');
          this.clearAuth();
          
          // Only redirect if not already on login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            setTimeout(() => {
              window.location.href = '/admin/login?reason=session_expired';
            }, 100);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
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
        return new Error('Authentication required - please login');
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

  // COOKIE-BASED TOKEN MANAGEMENT
  getToken() {
    if (typeof document === 'undefined') return null;
    
    try {
      const match = document.cookie.match(/auth=([^;]+)/);
      if (match) {
        const encoded = match[1];
        const token = atob(encoded);
        console.log('🔍 Token found in cookie:', token.substring(0, 20) + '...');
        return token;
      }
      
      console.log('🔍 No token found in cookies');
      return null;
    } catch (error) {
      console.error('Error getting token from cookie:', error);
      return null;
    }
  }

  // FIXED - Cookie-based storage with axios header update
  setToken(token, expiryHours = 24) {
    if (typeof document === 'undefined') return;
    
    try {
      if (token) {
        // Calculate expiry date
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (expiryHours * 60 * 60 * 1000));
        
        // Store token data in a separate cookie for expiry tracking
        const tokenData = {
          expiresAt: expiryDate.getTime(),
          createdAt: Date.now()
        };
        
        // Encode token and store in cookie
        const encoded = btoa(token);
        const cookieOptions = [
          `auth=${encoded}`,
          'path=/',
          `max-age=${expiryHours * 3600}`, // max-age in seconds
          'SameSite=Strict',
          // Add Secure flag in production
          // location.protocol === 'https:' ? 'Secure' : ''
        ].filter(Boolean).join('; ');
        
        document.cookie = cookieOptions;
        
        // Store token metadata
        const metaEncoded = btoa(JSON.stringify(tokenData));
        const metaCookieOptions = [
          `auth_meta=${metaEncoded}`,
          'path=/',
          `max-age=${expiryHours * 3600}`,
          'SameSite=Strict'
        ].join('; ');
        
        document.cookie = metaCookieOptions;
        
        // CRITICAL: Update axios default headers immediately
        if (this.client && this.client.defaults) {
          this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('✅ Updated axios default Authorization header');
        }
        
        console.log('✅ Token stored in cookie:', token.substring(0, 20) + '...');
        console.log('✅ Token expires at:', expiryDate.toLocaleString());
        console.log('✅ Hours until expiry:', expiryHours);
        
        // Verify immediately that token is not expired
        const isExpired = this.isTokenExpired();
        console.log('✅ Token expired check immediately after storage:', isExpired ? 'EXPIRED' : 'VALID');
        
      } else {
        // Clear cookies
        document.cookie = 'auth=; path=/; max-age=0';
        document.cookie = 'auth_meta=; path=/; max-age=0';
        
        // Remove from axios headers too
        if (this.client && this.client.defaults) {
          delete this.client.defaults.headers.common['Authorization'];
          console.log('✅ Removed Authorization header from axios defaults');
        }
        
        console.log('🗑️ Token cookies cleared');
      }
    } catch (error) {
      console.error('Error storing token in cookie:', error);
    }
  }

  // ENHANCED - Cookie-based auth clearing
  clearAuth() {
    if (typeof document === 'undefined') return;
    
    try {
      // Clear all auth-related cookies with different path variations
      const cookiesToClear = ['auth', 'auth_meta', 'auth_token', 'refresh_token', 'user'];
      const paths = ['/', '/admin', '/admin/'];
      
      cookiesToClear.forEach(cookieName => {
        paths.forEach(path => {
          document.cookie = `${cookieName}=; path=${path}; max-age=0`;
          document.cookie = `${cookieName}=; path=${path}; max-age=0; domain=${window.location.hostname}`;
        });
      });
      
      // Clear axios headers
      if (this.client && this.client.defaults) {
        delete this.client.defaults.headers.common['Authorization'];
        console.log('✅ Cleared Authorization header from axios defaults');
      }
      
      console.log('🗑️ Auth cookies cleared');
    } catch (error) {
      console.error('Error clearing auth cookies:', error);
    }
  }

  // Get token metadata from cookie
  getTokenData() {
    if (typeof document === 'undefined') return null;
    
    try {
      const match = document.cookie.match(/auth_meta=([^;]+)/);
      if (match) {
        const encoded = match[1];
        const tokenData = JSON.parse(atob(encoded));
        return tokenData;
      }
      
      // If no token metadata but token exists, create default expiry (24 hours from now)
      const token = this.getToken();
      if (token) {
        const defaultData = {
          expiresAt: Date.now() + (24 * 60 * 60 * 1000),
          createdAt: Date.now()
        };
        
        // Store the metadata
        const metaEncoded = btoa(JSON.stringify(defaultData));
        document.cookie = `auth_meta=${metaEncoded}; path=/; max-age=86400; SameSite=Strict`;
        
        console.log('✅ Created default token metadata for existing token');
        return defaultData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting token metadata from cookie:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired() {
    const tokenData = this.getTokenData();
    if (!tokenData || !tokenData.expiresAt) {
      console.log('🔍 Token expired check: No token metadata found');
      return true;
    }
    
    const now = Date.now();
    const isExpired = now >= tokenData.expiresAt;
    const timeUntilExpiry = tokenData.expiresAt - now;
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / (60 * 1000));
    const hoursUntilExpiry = Math.floor(timeUntilExpiry / (60 * 60 * 1000));
    
    console.log('🔍 Token expiry check:', {
      now: new Date(now).toLocaleString(),
      expiresAt: new Date(tokenData.expiresAt).toLocaleString(),
      minutesUntilExpiry,
      hoursUntilExpiry,
      isExpired,
      timeUntilExpiryMs: timeUntilExpiry
    });
    
    return isExpired;
  }

  // Check if token is expiring soon (within specified minutes)
  isTokenExpiringSoon(minutesThreshold = 10) {
    const tokenData = this.getTokenData();
    if (!tokenData || !tokenData.expiresAt) {
      return true;
    }
    
    const thresholdTime = minutesThreshold * 60 * 1000;
    const timeUntilExpiry = tokenData.expiresAt - Date.now();
    const isExpiringSoon = timeUntilExpiry <= thresholdTime;
    
    console.log('🔍 Token expiring soon check:', {
      minutesThreshold,
      timeUntilExpiryMinutes: Math.floor(timeUntilExpiry / (60 * 1000)),
      isExpiringSoon
    });
    
    return isExpiringSoon;
  }

  // Get remaining token time in minutes
  getTokenRemainingTime() {
    const tokenData = this.getTokenData();
    if (!tokenData || !tokenData.expiresAt) {
      console.log('🔍 No token metadata for remaining time calculation');
      return 0;
    }
    
    const now = Date.now();
    const remaining = tokenData.expiresAt - now;
    const minutes = Math.max(0, Math.floor(remaining / (60 * 1000)));
    
    console.log('🔍 Token remaining time:', {
      expiresAt: new Date(tokenData.expiresAt).toLocaleString(),
      now: new Date(now).toLocaleString(),
      remainingMs: remaining,
      remainingMinutes: minutes
    });
    
    return minutes;
  }

  // Set refresh token (for compatibility)
  setRefreshToken(refreshToken) {
    if (typeof document === 'undefined') return;
    
    try {
      if (refreshToken) {
        const encoded = btoa(refreshToken);
        document.cookie = `refresh_token=${encoded}; path=/; max-age=2592000; SameSite=Strict`; // 30 days
        console.log('✅ Refresh token stored in cookie');
      } else {
        document.cookie = 'refresh_token=; path=/; max-age=0';
        console.log('🗑️ Refresh token cookie cleared');
      }
    } catch (error) {
      console.error('Error storing refresh token in cookie:', error);
    }
  }

  // Get refresh token
  getRefreshToken() {
    if (typeof document === 'undefined') return null;
    
    try {
      const match = document.cookie.match(/refresh_token=([^;]+)/);
      return match ? atob(match[1]) : null;
    } catch (error) {
      console.error('Error getting refresh token from cookie:', error);
      return null;
    }
  }

  // Debug method to check auth state
  debugAuthState() {
    const token = this.getToken();
    const tokenData = this.getTokenData();
    const refreshToken = this.getRefreshToken();
    const axiosAuthHeader = this.client.defaults.headers.common['Authorization'];
    
    // Get user cookie if exists
    let user = null;
    try {
      const userMatch = document.cookie.match(/user=([^;]+)/);
      user = userMatch ? JSON.parse(atob(userMatch[1])) : null;
    } catch (e) {
      // ignore
    }
    
    console.log('🔍 Current Auth State:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      tokenExpiry: tokenData ? new Date(tokenData.expiresAt).toLocaleString() : 'No expiry data',
      remainingMinutes: this.getTokenRemainingTime(),
      isExpired: this.isTokenExpired(),
      isExpiringSoon: this.isTokenExpiringSoon(),
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      user: user,
      axiosAuthHeader: axiosAuthHeader ? axiosAuthHeader.substring(0, 30) + '...' : 'NOT SET',
      allCookies: document.cookie
    });
    
    return { 
      token, 
      tokenData, 
      refreshToken,
      user,
      remainingMinutes: this.getTokenRemainingTime(),
      axiosAuthHeader
    };
  }

  // Public API methods
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.client({ method: 'get', url: fullUrl });
  }

  async post(url, data, config = {}) {
    return this.client({ method: 'post', url, data, ...config });
  }

  async put(url, data, config = {}) {
    return this.client({ method: 'put', url, data, ...config });
  }

  async patch(url, data, config = {}) {
    return this.client({ method: 'patch', url, data, ...config });
  }

  async delete(url, config = {}) {
    return this.client({ method: 'delete', url, ...config });
  }

  async postFormData(url, formData) {
    return this.client({ 
      method: 'post', 
      url, 
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async putFormData(url, formData) {
    return this.client({ 
      method: 'put', 
      url, 
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}

const api = new ApiClient();

// Add global debug functions
if (typeof window !== 'undefined') {
  window.debugAuth = function() {
    console.log('=== AUTH DEBUG ===');
    
    // Check cookies
    console.log('🔍 All cookies:', document.cookie);
    
    // Check API client state
    const apiState = api.debugAuthState();
    
    console.log('=== END DEBUG ===');
    
    return apiState;
  };

  window.debugTokenExpiry = function() {
    console.log('=== TOKEN EXPIRY DEBUG ===');
    
    // Check what's in cookies
    const token = api.getToken();
    const tokenData = api.getTokenData();
    
    console.log('🔍 Token from cookie:', token ? token.substring(0, 30) + '...' : 'NONE');
    console.log('🔍 Token metadata:', tokenData);
    
    if (tokenData) {
      console.log('🔍 Parsed token data:', {
        createdAt: new Date(tokenData.createdAt).toLocaleString(),
        expiresAt: new Date(tokenData.expiresAt).toLocaleString(),
        timeCreated: tokenData.createdAt,
        timeExpires: tokenData.expiresAt,
        currentTime: Date.now(),
        currentTimeFormatted: new Date().toLocaleString()
      });
      
      // Check if the expiry time looks reasonable
      const hoursUntilExpiry = (tokenData.expiresAt - Date.now()) / (1000 * 60 * 60);
      console.log('🔍 Hours until expiry:', hoursUntilExpiry);
      
      if (hoursUntilExpiry < 0) {
        console.log('❌ Token is already expired!');
      } else if (hoursUntilExpiry > 48) {
        console.log('⚠️ Token expires very far in the future');
      } else {
        console.log('✅ Token expiry looks reasonable');
      }
    }
    
    // Test the API methods
    console.log('🔍 Testing API methods...');
    try {
      console.log('API token:', api.getToken());
      console.log('API isExpired:', api.isTokenExpired());
      console.log('API remaining:', api.getTokenRemainingTime());
      
      // Check axios headers
      const authHeader = api.client.defaults.headers.common['Authorization'];
      console.log('Axios auth header:', authHeader ? authHeader.substring(0, 30) + '...' : 'NOT SET');
    } catch (e) {
      console.error('Error testing API methods:', e);
    }
    
    console.log('=== END TOKEN DEBUG ===');
  };

  // Test token setter
  window.setTestToken = function() {
    const testToken = 'test-token-' + Date.now();
    console.log('🧪 Setting test token:', testToken);
    api.setToken(testToken, 24); // 24 hours
    
    setTimeout(() => {
      console.log('🧪 Testing token after 1 second...');
      console.log('Is expired?', api.isTokenExpired());
      console.log('Remaining time:', api.getTokenRemainingTime());
      console.log('Axios header set?', api.client.defaults.headers.common['Authorization'] ? 'YES' : 'NO');
      console.log('Cookies:', document.cookie);
    }, 1000);
  };

  // Clear all auth data
  window.clearAuthDebug = function() {
    console.log('🧹 Clearing all auth data...');
    api.clearAuth();
    console.log('🧹 Auth cleared. Current cookies:', document.cookie);
  };

  console.log('🔧 Debug functions loaded:');
  console.log('  - debugAuth() - check full auth state');
  console.log('  - debugTokenExpiry() - check token expiry details');
  console.log('  - setTestToken() - set a test token');
  console.log('  - clearAuthDebug() - clear all auth data');
}

export default api;