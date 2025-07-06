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
      
      console.log('🔑 Token check:', { 
        hasMemoryToken: !!this.tokenStore, 
        hasCookieToken: !!token,
        cookieFound: !!match
      });
      
      // Store in memory for future requests
      if (token) {
        this.tokenStore = token;
      }
      
      return token;
    } catch (error) {
      console.error('❌ Error reading token:', error);
      return null;
    }
  }

  setToken(token) {
    if (!token) return;
    
    // Store in memory immediately
    this.tokenStore = token;
    console.log('💾 Setting token in memory');
    
    // Store in secure cookie for persistence
    if (typeof document !== 'undefined') {
      try {
        const encoded = btoa(token);
        // Use Secure flag only on HTTPS
        const isHttps = window.location.protocol === 'https:';
        const secureFlag = isHttps ? '; Secure' : '';
        const cookieString = `auth_token=${encoded}; path=/; max-age=31536000; SameSite=Strict${secureFlag}`;
        document.cookie = cookieString;
        console.log('🍪 Token cookie set:', { isHttps, cookieString });
        
        // Verify the cookie was set
        const verification = document.cookie.match(/auth_token=([^;]+)/);
        console.log('🔍 Token cookie verification:', { cookieSet: !!verification });
      } catch (error) {
        console.error('❌ Error setting token cookie:', error);
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
        console.log('👤 User retrieved from cookie:', { hasUser: !!user, role: user?.role });
        return user;
      } else {
        console.log('👤 No user cookie found');
      }
    } catch (error) {
      console.error('❌ Error reading user data:', error);
    }
    return null;
  }

  setUser(userData) {
    if (!userData) return;
    
    // Store in memory immediately
    this.userStore = userData;
    console.log('💾 Setting user in memory:', { role: userData.role });
    
    // Store in secure cookie for persistence
    if (typeof document !== 'undefined') {
      try {
        const encoded = btoa(JSON.stringify(userData));
        // Use Secure flag only on HTTPS
        const isHttps = window.location.protocol === 'https:';
        const secureFlag = isHttps ? '; Secure' : '';
        const cookieString = `user_data=${encoded}; path=/; max-age=31536000; SameSite=Strict${secureFlag}`;
        document.cookie = cookieString;
        console.log('🍪 User cookie set:', { isHttps, cookieString: cookieString.substring(0, 50) + '...' });
        
        // Verify the cookie was set
        const verification = document.cookie.match(/user_data=([^;]+)/);
        console.log('🔍 User cookie verification:', { cookieSet: !!verification });
      } catch (error) {
        console.error('❌ Error setting user cookie:', error);
      }
    }
  }

  clearAuth() {
    // Clear in-memory storage
    this.tokenStore = null;
    this.userStore = null;
    console.log('🧹 Clearing auth from memory');
    
    // Clear cookies
    if (typeof document !== 'undefined') {
      const isHttps = window.location.protocol === 'https:';
      const secureFlag = isHttps ? '; Secure' : '';
      
      document.cookie = `auth_token=; path=/; max-age=0; SameSite=Strict${secureFlag}`;
      document.cookie = `user_data=; path=/; max-age=0; SameSite=Strict${secureFlag}`;
      console.log('🧹 Cookies cleared');
    }
    
    // Clear axios headers
    delete this.client.defaults.headers.common['Authorization'];
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    console.log('🔍 API Client Auth Check:', { token: !!token, user: !!user, hasAuth: !!(token && user) });
    return !!(token && user);
  }

  // API methods
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return await this.client.get(fullUrl);
  }

  async post(url, data, config = {}) {
    return await this.client.post(url, data, config);
  }

  async put(url, data) {
    return await this.client.put(url, data);
  }

  async delete(url) {
    return await this.client.delete(url);
  }

  async postFormData(url, formData) {
    return await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}

// Create singleton instance
const api = new ApiClient();

export default api;