import axios from 'axios';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://leksycosmetics.com/api',
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });
    
    // Simple token rotation tracking
    this.isUpdatingToken = false;
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

    // Response interceptor - handle token rotation and immediate 401s
    this.client.interceptors.response.use(
      (response) => {
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
        
        // ALWAYS update token from successful responses (token rotation)
        if (response.data?.token && response.data.code === 200 && !this.isUpdatingToken) {
          this.isUpdatingToken = true;
          const newToken = response.data.token;
          const currentToken = this.getToken();
          
          if (newToken !== currentToken) {
            console.log('🔄 Auto-updating rotated token from API response:', {
              oldToken: currentToken ? currentToken.substring(0, 20) + '...' : 'NONE',
              newToken: newToken.substring(0, 20) + '...',
              requestId,
              timestamp: new Date().toISOString()
            });
            
            this.setToken(newToken);
          }
          this.isUpdatingToken = false;
        }
        
        // Handle API-level 401 errors with extensive debugging
        if (response.data?.code === 401) {
          console.log('🚨 API-level 401 detected - token expired or invalid');
          console.log('📋 Response details:', {
            url: response.config.url,
            message: response.data.message,
            requestId,
            currentToken: this.getToken() ? this.getToken().substring(0, 20) + '...' : 'NONE',
            timestamp: new Date().toISOString()
          });
          
          // EXTENSIVE DEBUG: Analyze the request that failed
          console.log('🔍 FAILED REQUEST ANALYSIS:', {
            method: response.config.method?.toUpperCase(),
            fullUrl: response.config.url,
            sentAuthHeader: response.config.headers?.Authorization ? 
              response.config.headers.Authorization.substring(0, 30) + '...' : 'NOT SENT',
            requestData: response.config.data ? 'HAS DATA' : 'NO DATA',
            requestParams: response.config.params || 'NO PARAMS',
            requestHeaders: Object.keys(response.config.headers || {}),
            responseStatus: response.status,
            responseCode: response.data?.code,
            responseMessage: response.data?.message
          });
          
          // DEVICE BINDING DEBUG
          console.log('🔍 DEVICE BINDING DEBUG:', {
            currentUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
            currentCookies: typeof document !== 'undefined' ? document.cookie : 'SSR',
            note: 'Backend validates: md5(token + "|@|" + userAgent + "|@|" + IP)',
            possibleIssues: [
              'User agent changed (browser update, different browser)',
              'IP address changed (VPN, network switch, mobile data)',
              'Token genuinely expired and needs rotation',
              'Token corruption during storage/retrieval'
            ]
          });
          
          // TOKEN STORAGE DEBUG
          const tokenFromStorage = this.getToken();
          console.log('🔍 TOKEN STORAGE DEBUG:', {
            hasTokenInStorage: !!tokenFromStorage,
            tokenLength: tokenFromStorage ? tokenFromStorage.length : 0,
            tokenPreview: tokenFromStorage ? tokenFromStorage.substring(0, 50) + '...' : 'NO TOKEN',
            cookieRaw: typeof document !== 'undefined' ? 
              document.cookie.match(/auth_token=([^;]+)/) : 'SSR',
            axiosDefaultHeader: this.client.defaults.headers.common['Authorization'],
            requestAuthHeader: response.config.headers?.Authorization
          });
          
          // Give user immediate feedback but delay logout slightly
          this.handleTokenExpiry(response.data.message || 'Your session has expired');
          
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
        
        // Handle HTTP 401 errors with debugging
        if (error.response?.status === 401) {
          console.log('🚨 HTTP 401 detected - authentication failed');
          
          // EXTENSIVE DEBUG for HTTP 401
          console.log('🔍 HTTP 401 DEBUG:', {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            sentAuthHeader: error.config?.headers?.Authorization ? 
              error.config.headers.Authorization.substring(0, 30) + '...' : 'NOT SENT',
            responseData: error.response?.data,
            responseHeaders: error.response?.headers,
            currentToken: this.getToken() ? this.getToken().substring(0, 20) + '...' : 'NONE',
            axiosDefaultHeader: this.client.defaults.headers.common['Authorization']
          });
          
          this.handleTokenExpiry('Authentication failed');
        }

        return Promise.reject(error);
      }
    );
  }

  // Handle token expiry with comprehensive debugging
  handleTokenExpiry(message) {
    console.log('🚨 Token expired:', message);
    
    // COMPREHENSIVE DEBUG INFO
    console.log('🔍 COMPLETE AUTH STATE DEBUG:', {
      currentToken: this.getToken(),
      tokenPreview: this.getToken() ? this.getToken().substring(0, 30) + '...' : 'NO TOKEN',
      authHeader: this.client.defaults.headers.common['Authorization'],
      allCookies: typeof document !== 'undefined' ? document.cookie : 'SSR',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) + '...' : 'Unknown',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      isUpdatingToken: this.isUpdatingToken
    });
    
    // Check if this might be a device/IP binding issue
    console.log('🔍 DEVICE BINDING ANALYSIS:', {
      note: 'Your backend uses md5(token + userAgent + IP) for validation',
      suspectedIssue: 'Token might be valid but device/IP changed',
      recommendation: 'Check if user agent or IP changed since login'
    });
    
    // Show immediate user feedback
    if (typeof window !== 'undefined') {
      // Try to show a more user-friendly message
      const userMessage = this.getUserFriendlyMessage(message);
      
      // Use a non-blocking notification if possible
      if (window.alert) {
        setTimeout(() => {
          const shouldReload = confirm(
            `${userMessage}\n\nDEBUG INFO: Check console for detailed logs.\n\nClick OK to log in again, or Cancel to stay on this page.`
          );
          
          if (shouldReload) {
            this.clearAuth();
            this.redirectToLogin();
          }
        }, 500); // Small delay to let user see what they were doing
      } else {
        // Fallback to automatic redirect
        setTimeout(() => {
          this.clearAuth();
          this.redirectToLogin();
        }, 2000);
      }
    }
  }

  // Make error messages more user-friendly
  getUserFriendlyMessage(originalMessage) {
    const friendlyMessages = {
      'Unauthorized! Please login/re-login.': 'Your session has expired due to security settings.',
      'Token expired': 'Your login session has timed out.',
      'Authentication failed': 'Your login credentials are no longer valid.',
      'Invalid token': 'Your session is no longer active.'
    };
    
    return friendlyMessages[originalMessage] || 'Your session has expired. Please log in again.';
  }

  // Token management (simplified for your backend)
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
    this.isUpdatingToken = false;
    
    console.log('✅ Auth fully cleared');
  }

  redirectToLogin() {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      console.log('🔄 Redirecting to login page...');
      setTimeout(() => {
        window.location.href = '/login?reason=session_expired';
      }, 100);
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // API methods with better error handling
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

  // Enhanced debug method with comprehensive analysis
  debugAuth() {
    const token = this.getToken();
    const authHeader = this.client.defaults.headers.common['Authorization'];
    
    // Get raw cookie data
    const rawCookie = typeof document !== 'undefined' ? 
      document.cookie.match(/auth_token=([^;]+)/) : null;
    
    const debug = {
      // Basic auth state
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
      tokenLength: token ? token.length : 0,
      authHeader: authHeader || 'NOT SET',
      isAuthenticated: this.isAuthenticated(),
      isUpdatingToken: this.isUpdatingToken,
      
      // Backend compatibility
      backendType: 'Token Rotation (No Refresh Endpoint)',
      
      // Device binding info (critical for your backend)
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      userAgentPreview: typeof navigator !== 'undefined' ? 
        navigator.userAgent.substring(0, 100) + '...' : 'Unknown',
      
      // Cookie debug
      allCookies: typeof document !== 'undefined' ? document.cookie : 'SSR',
      rawAuthCookie: rawCookie ? rawCookie[1].substring(0, 30) + '...' : 'NOT FOUND',
      
      // Environment info
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      timestamp: new Date().toISOString(),
      
      // Backend validation reminder
      backendValidation: 'md5(token + "|@|" + userAgent + "|@|" + IP)',
      commonIssues: [
        'User agent changed (browser update)',
        'IP address changed (network switch)',
        'Token rotation timing',
        'Cookie encoding/decoding issues'
      ]
    };
    
    console.log('🔍 COMPREHENSIVE API Client Auth Debug:', debug);
    
    // Additional device binding analysis
    if (typeof navigator !== 'undefined') {
      console.log('🔍 DEVICE BINDING VALIDATION:', {
        userAgentLength: navigator.userAgent.length,
        userAgentStart: navigator.userAgent.substring(0, 50),
        userAgentEnd: navigator.userAgent.substring(navigator.userAgent.length - 50),
        note: 'Any change in user agent will invalidate your token'
      });
    }
    
    return debug;
  }

  async testAuth() {
    try {
      console.log('🧪 Testing authentication (no refresh endpoint available)...');
      const response = await this.get('/fetch-orders', { limit: 1 });
      console.log('✅ Auth test successful - token may have been rotated');
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

  // Check device binding info
  debugDeviceBinding() {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    console.log('🔍 Device Binding Debug:', {
      userAgent,
      cookiesSent: typeof document !== 'undefined' ? document.cookie : 'SSR',
      note: 'Your PHP backend binds tokens to device+IP. Changes in these can cause 401s.',
      recommendation: 'Since there is no refresh endpoint, tokens must be rotated via successful API calls.'
    });
  }

  // Method to simulate staying active (make a lightweight call to rotate token)
  async stayActive() {
    try {
      console.log('🔄 Making lightweight call to stay active and rotate token...');
      
      // Try a few lightweight endpoints that might exist
      const lightweightEndpoints = [
        '/admin-profile',
        '/fetch-orders?limit=1',
        '/fetch-products?limit=1'
      ];
      
      for (const endpoint of lightweightEndpoints) {
        try {
          const response = await this.get(endpoint);
          if (response.data?.code === 200) {
            console.log(`✅ Stay active successful via ${endpoint}`);
            return { success: true, endpoint };
          }
        } catch (error) {
          console.log(`❌ ${endpoint} failed for stay active:`, error.message);
          continue;
        }
      }
      
      return { success: false, error: 'No available endpoints for staying active' };
    } catch (error) {
      console.error('❌ Stay active failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const api = new ApiClient();

// Expose debug functions with enhanced debugging
if (typeof window !== 'undefined') {
  window.api = api;
  window.debugAPI = () => api.debugAuth();
  window.testAPI = () => api.testAuth();
  window.logoutAPI = () => api.logout();
  window.debugDeviceAPI = () => api.debugDeviceBinding();
  window.stayActiveAPI = () => api.stayActive();
  
  // Additional debug helpers
  window.debugTokenAPI = () => {
    const token = api.getToken();
    console.log('🔍 RAW TOKEN DEBUG:', {
      token: token,
      tokenLength: token ? token.length : 0,
      tokenType: typeof token,
      base64Encoded: token ? btoa(token).substring(0, 50) + '...' : 'NO TOKEN',
      rawCookie: document.cookie,
      authCookieMatch: document.cookie.match(/auth_token=([^;]+)/),
      userAgent: navigator.userAgent
    });
    return token;
  };
  
  window.debugRequestAPI = (url) => {
    console.log('🔍 REQUEST DEBUG for:', url);
    console.log('Current token:', api.getToken()?.substring(0, 30) + '...');
    console.log('Auth header:', api.client.defaults.headers.common['Authorization']);
    console.log('User agent:', navigator.userAgent.substring(0, 100) + '...');
  };
  
  console.log('🔧 Enhanced debug functions available:');
  console.log('  - window.debugAPI() - comprehensive auth state');
  console.log('  - window.debugTokenAPI() - raw token analysis'); 
  console.log('  - window.debugRequestAPI(url) - pre-request debug');
  console.log('  - window.testAPI() - test authenticated request'); 
  console.log('  - window.logoutAPI() - manual logout');
  console.log('  - window.debugDeviceAPI() - device binding check');
  console.log('  - window.stayActiveAPI() - make call to rotate token');
}

export default api;