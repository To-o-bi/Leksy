import axios from 'axios';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://leksycosmetics.com/api',
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });
    
    // Token rotation handling
    this.pendingRequests = new Map();
    this.isTokenUpdating = false;
    
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - add token to headers
    this.client.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now(), requestId: Date.now() + Math.random() };
        
        const token = this.getToken();
        
        console.log('🔍 REQUEST INTERCEPTOR DEBUG:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
          requestId: config.metadata.requestId,
          timestamp: new Date().toISOString()
        });
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header set for request:', config.metadata.requestId);
        } else {
          console.log('❌ No token available for request:', config.metadata.requestId);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token rotation from your PHP backend
    this.client.interceptors.response.use(
      async (response) => {
        const requestId = response.config.metadata?.requestId;
        console.log('✅ Response success:', {
          url: response.config.url,
          status: response.status,
          apiCode: response.data?.code,
          hasNewToken: !!response.data?.token,
          requestId,
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - (response.config.metadata?.startTime || Date.now())
        });
        
        // CRITICAL: Handle token rotation from your PHP backend
        // Your backend sends new tokens in successful responses
        if (response.data?.token && response.data.code === 200) {
          await this.updateTokenFromResponse(response.data.token, requestId);
        }
        
        // Handle API-level 401 errors (when your PHP backend returns code: 401)
        if (response.data?.code === 401) {
          console.log('🚨 API-level 401 detected - token invalid or expired');
          console.log('📋 Response details:', {
            url: response.config.url,
            message: response.data.message,
            requestId,
            timestamp: new Date().toISOString()
          });
          
          // For token rotation systems, 401 usually means we need to re-login
          this.handleSessionExpired('API returned 401 - token rotation required re-authentication');
          
          // Convert to error for calling code
          const error = new Error(response.data.message || 'Unauthorized! Please login/re-login.');
          error.response = {
            status: 401,
            data: response.data,
            config: response.config
          };
          error.isAPILevel401 = true;
          throw error;
        }
        
        return response;
      },
      (error) => {
        const requestId = error.config?.metadata?.requestId;
        console.error('❌ HTTP Response error:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          requestId,
          timestamp: new Date().toISOString()
        });
        
        // Handle HTTP 401 errors
        if (error.response?.status === 401) {
          console.log('🚨 HTTP 401 detected - authentication failed');
          this.handleSessionExpired('HTTP 401 status code');
        }

        return Promise.reject(error);
      }
    );
  }

  // Handle token updates from successful responses (for token rotation)
  async updateTokenFromResponse(newToken, requestId) {
    if (this.isTokenUpdating) {
      console.log('🔄 Token update already in progress, queuing...', requestId);
      return;
    }

    const currentToken = this.getToken();
    
    if (newToken !== currentToken) {
      this.isTokenUpdating = true;
      
      console.log('🔄 Updating rotated token from API response:', {
        oldToken: currentToken ? currentToken.substring(0, 20) + '...' : 'NONE',
        newToken: newToken.substring(0, 20) + '...',
        requestId,
        timestamp: new Date().toISOString()
      });
      
      try {
        // Update token in storage
        this.setToken(newToken);
        
        // Update all pending requests with new token
        await this.updatePendingRequestsToken(newToken);
        
        console.log('✅ Token rotation completed successfully');
      } catch (error) {
        console.error('❌ Error during token rotation:', error);
      } finally {
        this.isTokenUpdating = false;
      }
    }
  }

  // Update any pending requests with the new token
  async updatePendingRequestsToken(newToken) {
    this.pendingRequests.forEach((request, key) => {
      if (request.headers) {
        request.headers.Authorization = `Bearer ${newToken}`;
        console.log('🔄 Updated pending request token:', key);
      }
    });
  }

  // Centralized session expiry handler
  handleSessionExpired(reason) {
    console.log(`🚨 Session expired: ${reason}`);
    console.log('🗑️ Clearing authentication data...');
    
    this.clearAuth();
    
    // Show user-friendly message before redirect
    if (typeof window !== 'undefined') {
      console.log('🔄 Redirecting to login page...');
      
      // Optional: Show a brief notification to user
      if (window.alert) {
        setTimeout(() => {
          alert('Your session has expired due to security token rotation. Please log in again.');
        }, 100);
      }
      
      this.redirectToLogin();
    }
  }

  // Token management with device/IP awareness
  getToken() {
    if (typeof document === 'undefined') {
      return null;
    }
    
    try {
      const match = document.cookie.match(/auth_token=([^;]+)/);
      if (match) {
        const encoded = match[1];
        const token = atob(encoded);
        return token;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting token from cookie:', error);
      return null;
    }
  }

  setToken(token) {
    console.log('🔧 setToken called with:', token ? token.substring(0, 20) + '...' : 'NULL');
    
    if (typeof document === 'undefined') {
      console.log('❌ Document undefined - running in SSR environment');
      return;
    }
    
    if (token) {
      try {
        // Encode and store in cookie
        const encoded = btoa(token);
        const cookieString = `auth_token=${encoded}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = cookieString;
        
        // Update axios default headers immediately for future requests
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('✅ Token set and axios headers updated');
        
        // Verify it was set
        const verification = this.getToken();
        if (verification) {
          console.log('✅ Token verification successful');
        } else {
          console.error('❌ Token verification failed');
        }
        
      } catch (error) {
        console.error('❌ Error setting token:', error);
      }
    } else {
      this.clearTokenFromStorage();
    }
  }

  clearTokenFromStorage() {
    if (typeof document === 'undefined') return;
    
    document.cookie = 'auth_token=; path=/; max-age=0';
    delete this.client.defaults.headers.common['Authorization'];
    console.log('🗑️ Token cleared from storage and headers');
  }

  clearAuth() {
    console.log('🗑️ Clearing all auth data...');
    
    if (typeof document !== 'undefined') {
      // Clear all auth-related cookies
      document.cookie = 'auth_token=; path=/; max-age=0';
      document.cookie = 'refresh_token=; path=/; max-age=0';
      document.cookie = 'user=; path=/; max-age=0';
    }
    
    // Clear axios headers
    delete this.client.defaults.headers.common['Authorization'];
    
    // Clear pending requests
    this.pendingRequests.clear();
    this.isTokenUpdating = false;
    
    console.log('✅ Auth fully cleared');
  }

  redirectToLogin() {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      setTimeout(() => {
        window.location.href = '/login?reason=token_rotation_expired';
      }, 1000);
    }
  }

  // Check if user is authenticated (simplified for token rotation)
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // API methods with token rotation awareness
  async get(url, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      return await this.client.get(fullUrl);
    } catch (error) {
      console.error(`❌ GET ${url} failed:`, error.message);
      throw error;
    }
  }

  async post(url, data) {
    try {
      return await this.client.post(url, data);
    } catch (error) {
      console.error(`❌ POST ${url} failed:`, error.message);
      throw error;
    }
  }

  async put(url, data) {
    try {
      return await this.client.put(url, data);
    } catch (error) {
      console.error(`❌ PUT ${url} failed:`, error.message);
      throw error;
    }
  }

  async delete(url) {
    try {
      return await this.client.delete(url);
    } catch (error) {
      console.error(`❌ DELETE ${url} failed:`, error.message);
      throw error;
    }
  }

  async postFormData(url, formData) {
    try {
      return await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error(`❌ POST FORM ${url} failed:`, error.message);
      throw error;
    }
  }

  // Enhanced debug methods for token rotation
  debugAuth() {
    const token = this.getToken();
    const authHeader = this.client.defaults.headers.common['Authorization'];
    
    const debug = {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
      authHeader: authHeader || 'NOT SET',
      isAuthenticated: this.isAuthenticated(),
      isTokenUpdating: this.isTokenUpdating,
      pendingRequestsCount: this.pendingRequests.size,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      cookies: typeof document !== 'undefined' ? document.cookie : 'SSR'
    };
    
    console.log('🔍 API Client Auth Debug (Token Rotation System):', debug);
    return debug;
  }

  async testAuth() {
    try {
      console.log('🧪 Testing authentication with token rotation system...');
      const response = await this.get('/fetch-orders', { limit: 1 });
      console.log('✅ Auth test successful - check if token was rotated');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Auth test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Manual logout method
  logout() {
    console.log('👋 Manual logout initiated');
    this.clearAuth();
    this.redirectToLogin();
  }

  // Method to check if we're having device/IP issues
  debugDeviceBinding() {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    console.log('🔍 Device Binding Debug:', {
      userAgent,
      cookiesSent: typeof document !== 'undefined' ? document.cookie : 'SSR',
      note: 'Your PHP backend binds tokens to device+IP. Changes in these can cause 401s.'
    });
  }
}

// Create singleton instance
const api = new ApiClient();

// Expose debug functions
if (typeof window !== 'undefined') {
  window.api = api;
  window.debugAPI = () => api.debugAuth();
  window.testAPI = () => api.testAuth();
  window.logoutAPI = () => api.logout();
  window.debugDeviceAPI = () => api.debugDeviceBinding();
  
  console.log('🔧 Debug functions available for token rotation system:');
  console.log('  - window.debugAPI() - check auth state');
  console.log('  - window.testAPI() - test authenticated request'); 
  console.log('  - window.logoutAPI() - manual logout');
  console.log('  - window.debugDeviceAPI() - check device binding');
}

export default api;