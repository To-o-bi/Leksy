import axios from 'axios';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://leksycosmetics.com/api', // CORRECTED BASE URL
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });
    
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - add token to headers
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp for response timing
        config.metadata = { startTime: Date.now() };
        
        const token = this.getToken();
        
        console.log('🔍 REQUEST INTERCEPTOR DEBUG:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
          existingAuthHeader: config.headers.Authorization,
          timestamp: new Date().toISOString()
        });
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header set:', config.headers.Authorization.substring(0, 30) + '...');
        } else {
          console.log('❌ No token available for request');
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle 401 errors and token updates
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ Response success:', {
          url: response.config.url,
          status: response.status,
          hasData: !!response.data,
          apiCode: response.data?.code,
          hasNewToken: !!response.data?.token,
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - (response.config.metadata?.startTime || Date.now())
        });
        
        // AUTO-UPDATE TOKEN from successful responses (if provided)
        if (response.data?.token && response.data.code === 200) {
          const newToken = response.data.token;
          const currentToken = this.getToken();
          
          if (newToken !== currentToken) {
            console.log('🔄 Auto-updating token from API response', {
              oldToken: currentToken ? currentToken.substring(0, 20) + '...' : 'NONE',
              newToken: newToken.substring(0, 20) + '...'
            });
            this.setToken(newToken);
          }
        }
        
        // CHECK FOR API-LEVEL 401 ERRORS but DON'T auto-redirect
        if (response.data?.code === 401) {
          console.log('🚨 API-level 401 detected - letting calling code handle it', {
            url: response.config.url,
            message: response.data.message,
            timestamp: new Date().toISOString()
          });
          
          // Convert this to an error for the calling code to handle
          const error = new Error(response.data.message || 'Authentication required');
          error.response = {
            status: 401,
            data: response.data,
            config: response.config
          };
          error.config = response.config;
          error.isAPILevel401 = true; // Flag to identify this type of error
          throw error;
        }
        
        return response;
      },
      async (error) => {
        console.error('❌ HTTP Response error:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          timestamp: new Date().toISOString()
        });
        
        // Only handle actual HTTP 401 errors (not API-level ones)
        if (error.response?.status === 401 && !error.isAPILevel401) {
          console.log('🚨 HTTP 401 detected - clearing auth and redirecting to login');
          this.clearAuth();
          this.redirectToLogin();
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  getToken() {
    if (typeof document === 'undefined') {
      console.log('🔍 getToken: Document undefined (SSR)');
      return null;
    }
    
    try {
      console.log('🔍 getToken: Searching for auth_token in cookies...');
      console.log('🔍 All cookies:', document.cookie);
      
      const match = document.cookie.match(/auth_token=([^;]+)/);
      console.log('🔍 Cookie match result:', match);
      
      if (match) {
        const encoded = match[1];
        console.log('🔍 Found encoded token:', encoded.substring(0, 20) + '...');
        
        const token = atob(encoded);
        console.log('🔍 Decoded token:', token.substring(0, 20) + '...');
        return token;
      }
      
      console.log('🔍 No auth_token cookie found');
      return null;
    } catch (error) {
      console.error('❌ Error getting token from cookie:', error);
      return null;
    }
  }

  setToken(token) {
    console.log('🔧 setToken called with:', token ? token.substring(0, 20) + '...' : 'NULL/UNDEFINED');
    
    if (typeof document === 'undefined') {
      console.log('❌ Document undefined - running in SSR environment');
      return;
    }
    
    if (token) {
      try {
        console.log('🔧 Attempting to store token...');
        
        // Encode and store in cookie
        const encoded = btoa(token);
        console.log('🔧 Encoded token:', encoded.substring(0, 20) + '...');
        
        const cookieString = `auth_token=${encoded}; path=/; max-age=86400; SameSite=Strict`;
        console.log('🔧 Cookie string:', cookieString);
        
        document.cookie = cookieString;
        
        // Verify cookie was set immediately
        const cookieTest = document.cookie;
        console.log('🔧 Document.cookie after setting:', cookieTest);
        
        // Test retrieval immediately
        const retrievedToken = this.getToken();
        console.log('🔧 Retrieved token immediately:', retrievedToken ? retrievedToken.substring(0, 20) + '...' : 'NOT RETRIEVED');
        
        // CRITICAL: Update axios default headers immediately
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.client.defaults.headers['Authorization'] = `Bearer ${token}`;
        
        console.log('✅ Token set and axios headers updated:', {
          tokenPreview: token.substring(0, 20) + '...',
          commonAuthHeader: this.client.defaults.headers.common['Authorization'],
          directAuthHeader: this.client.defaults.headers['Authorization'],
          cookieSet: document.cookie.includes('auth_token')
        });
      } catch (error) {
        console.error('❌ Error setting token:', error);
      }
    } else {
      console.log('🗑️ Clearing token...');
      document.cookie = 'auth_token=; path=/; max-age=0';
      delete this.client.defaults.headers.common['Authorization'];
      delete this.client.defaults.headers['Authorization'];
      console.log('🗑️ Token cleared and axios headers removed');
    }
  }

  clearAuth() {
    this.setToken(null);
    // Clear any other auth-related cookies
    document.cookie = 'refresh_token=; path=/; max-age=0';
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', {
      refresh_token: refreshToken
    });

    const newToken = response.data.token || response.data.access_token;
    if (!newToken) {
      throw new Error('No token in refresh response');
    }

    return newToken;
  }

  getRefreshToken() {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/refresh_token=([^;]+)/);
    return match ? atob(match[1]) : null;
  }

  // Simple token expiry check (optional - for compatibility with AuthContext)
  isTokenExpired() {
    // Since we removed complex expiry tracking, just check if token exists
    // Let the server handle expiry validation via 401 responses
    return !this.getToken();
  }

  clearAuth() {
    this.setToken(null);
    // Clear any other auth-related cookies
    document.cookie = 'refresh_token=; path=/; max-age=0';
    document.cookie = 'user=; path=/; max-age=0';
    
    // Double-check that headers are cleared
    delete this.client.defaults.headers.common['Authorization'];
    delete this.client.defaults.headers['Authorization'];
    
    console.log('🗑️ Auth fully cleared including all headers');
  }

  redirectToLogin() {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      setTimeout(() => {
        window.location.href = '/login?reason=session_expired';
      }, 100);
    }
  }

  // API methods
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.client.get(fullUrl);
  }

  async post(url, data) {
    return this.client.post(url, data);
  }

  async put(url, data) {
    return this.client.put(url, data);
  }

  async delete(url) {
    return this.client.delete(url);
  }

  // Debug method to check auth state
  debugAuth() {
    const token = this.getToken();
    const commonAuthHeader = this.client.defaults.headers.common['Authorization'];
    const directAuthHeader = this.client.defaults.headers['Authorization'];
    
    console.log('🔍 API Client Auth Debug:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
      commonAuthHeader: commonAuthHeader || 'NOT SET',
      directAuthHeader: directAuthHeader || 'NOT SET',
      allCommonHeaders: this.client.defaults.headers.common,
      allDirectHeaders: this.client.defaults.headers,
      cookies: typeof document !== 'undefined' ? document.cookie : 'SSR'
    });
    
    return {
      hasToken: !!token,
      hasCommonAuthHeader: !!commonAuthHeader,
      hasDirectAuthHeader: !!directAuthHeader,
      token,
      commonAuthHeader,
      directAuthHeader
    };
  }

  // Test method to make a simple authenticated request
  async testAuth() {
    try {
      console.log('🧪 Testing authentication with a simple request...');
      const response = await this.get('/fetch-orders', { limit: 1 });
      console.log('✅ Auth test successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Auth test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const api = new ApiClient();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.api = api;
  window.debugAPI = () => api.debugAuth();
  window.testAPI = () => api.testAuth();
  
  console.log('🔧 Debug functions available:');
  console.log('  - window.api.debugAuth() - check auth state');
  console.log('  - window.api.testAuth() - test authenticated request');
  console.log('  - debugAPI() - shortcut for debugAuth');
  console.log('  - testAPI() - shortcut for testAuth');
}

export default api;