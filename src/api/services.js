// src/api/services.js - FIXED VERSION
import api from './axios.js';
import { ENDPOINTS, CATEGORIES, API_CONFIG } from './config.js';

// Utility functions
const isBrowser = () => typeof window !== 'undefined';
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Safe localStorage wrapper
const storage = {
  getItem(key) {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  },
  
  setItem(key, value) {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  },
  
  removeItem(key) {
    if (!isBrowser()) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }
};

// Fixed authService that works with simplified API client
export const authService = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    try {
      console.log('🔐 Starting login process...');
      console.log('🔐 Username:', username);
      console.log('🔐 Password length:', password.length);
      
      // Clear any existing auth data first
      this.clearAuth();
      
      // Debug: Check auth state before login
      console.log('🔍 Auth state before login:');
      api.debugAuth();
      
      // Try multiple login formats to find the one that works
      let response;
      let loginMethod = 'unknown';
      
      try {
        // METHOD 1: Form-encoded data (most common)
        console.log('🧪 Trying method 1: Form-encoded data');
        const formData = new URLSearchParams();
        formData.append('username', username.trim());
        formData.append('password', password);
        
        response = await api.post('/admin/login', formData, {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        loginMethod = 'form-encoded';
        console.log('✅ Form-encoded method worked');
      } catch (formError) {
        console.log('❌ Form-encoded method failed:', formError.message);
        
        try {
          // METHOD 2: Query parameters (as per API docs)
          console.log('🧪 Trying method 2: Query parameters');
          response = await api.post(`/admin/login?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password)}`);
          loginMethod = 'query-params';
          console.log('✅ Query parameters method worked');
        } catch (queryError) {
          console.log('❌ Query parameters method failed:', queryError.message);
          
          try {
            // METHOD 3: JSON body
            console.log('🧪 Trying method 3: JSON body');
            response = await api.post('/admin/login', {
              username: username.trim(),
              password: password
            });
            loginMethod = 'json';
            console.log('✅ JSON method worked');
          } catch (jsonError) {
            console.log('❌ All login methods failed');
            throw new Error('Login failed - server not accepting credentials in any expected format');
          }
        }
      }

      console.log('🔐 Login response:', {
        method: loginMethod,
        code: response.data?.code,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user,
        message: response.data?.message,
        tokenPreview: response.data?.token ? response.data.token.substring(0, 20) + '...' : 'NO TOKEN',
        fullResponseData: response.data // Log full response for debugging
      });

      if (response.data?.code === 200) {
        // Store token FIRST before anything else
        if (response.data.token) {
          console.log('✅ Setting token in API client');
          console.log('🔍 Token to store:', response.data.token);
          
          // Set token using the API client method
          api.setToken(response.data.token);
          
          // Verify token was stored immediately
          setTimeout(() => {
            console.log('🔍 Immediate verification after token storage:');
            const storedToken = api.getToken();
            console.log('Stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'NOT STORED');
            console.log('Document cookies:', document.cookie);
            api.debugAuth();
          }, 100);
          
        } else {
          throw new Error('No authentication token received from server');
        }
        
        // Store user data AFTER token
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('✅ User data stored:', response.data.user);
        } else {
          console.warn('⚠️ No user data received from server');
        }
        
        // Final verification
        setTimeout(() => {
          console.log('🔍 Final auth verification:');
          console.log('Auth service isAuthenticated:', this.isAuthenticated());
          api.debugAuth();
        }, 200);
        
        console.log('✅ Login completed successfully');
        return response.data;
      }

      throw new Error(response.data?.message || 'Login failed - invalid response');
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Clear any partial auth state on login failure
      this.clearAuth();
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied - admin privileges required');
      } else if (error.message.includes('Network')) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Login failed - please try again');
      }
    }
  },

  async logout() {
    try {
      console.log('🔓 Logging out...');
      
      // Attempt graceful logout with current token
      if (this.isAuthenticated()) {
        await api.post('/admin/logout');
        console.log('✅ Server logout successful');
      }
    } catch (error) {
      console.warn('⚠️ Server logout failed:', error.message);
      // Continue with local cleanup even if server logout fails
    } finally {
      this.clearAuth();
      console.log('✅ Local logout completed');
    }
  },

  clearAuth() {
    console.log('🧹 Clearing auth data...');
    api.clearAuth();
    localStorage.removeItem('user');
    console.log('🗑️ Auth cleared via authService');
    
    // Debug: Verify auth was cleared
    setTimeout(() => {
      console.log('🔍 Auth state after clearing:');
      api.debugAuth();
    }, 100);
  },

  // SIMPLIFIED: Just check if we have token and user data
  isAuthenticated() {
    const hasToken = !!api.getToken();
    const hasUser = !!localStorage.getItem('user');
    
    console.log('🔍 Authentication check:', { 
      hasToken, 
      hasUser
    });
    
    // If we have a token but no user data, or vice versa, clear both
    if (hasToken !== hasUser) {
      console.warn('⚠️ Auth state mismatch detected, clearing auth');
      this.clearAuth();
      return false;
    }
    
    return hasToken && hasUser;
  },

  getAuthUser() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  // SIMPLIFIED: Debug method without expiry checks
  debugAuthState() {
    const token = api.getToken();
    const user = this.getAuthUser();
    const isAuth = this.isAuthenticated();
    
    console.log('🔍 AuthService State:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      hasUser: !!user,
      user: user,
      isAuthenticated: isAuth,
      cookies: document.cookie
    });
    
    return { 
      token, 
      user, 
      isAuthenticated: isAuth
    };
  }
};

export const productService = {
  async fetchProducts(filters = {}) {
    const params = {};
    if (filters.categories?.length) params.filter = filters.categories.join(',');
    if (filters.productIds?.length) params.products_ids_array = filters.productIds.join(',');
    if (filters.sort) params.sort = filters.sort;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get(ENDPOINTS.FETCH_PRODUCTS, params);
    return response.data;
  },

  async fetchProduct(productId) {
    if (!productId) throw new Error('Product ID is required');
    
    const response = await api.get(ENDPOINTS.FETCH_PRODUCT, { product_id: productId });
    return response.data;
  },

  async addProduct(productData) {
    // Validation
    this._validateProductData(productData);

    const formData = this._buildProductFormData(productData);
    const response = await api.postFormData(ENDPOINTS.ADD_PRODUCT, formData);
    return response.data;
  },

  async updateProduct(productId, productData) {
    if (!productId) throw new Error('Product ID is required');
    
    const formData = new FormData();
    formData.append('product_id', productId);

    // Add updated fields
    if (productData.name) formData.append('name', productData.name.trim());
    if (productData.price) formData.append('price', productData.price.toString());
    if (productData.description) formData.append('description', productData.description.trim());
    if (productData.quantity !== undefined) formData.append('quantity', productData.quantity.toString());
    if (productData.category) formData.append('category', productData.category);
    if (productData.slashed_price) formData.append('slashed_price', productData.slashed_price.toString());
    
    if (productData.concern_options) {
      const concerns = Array.isArray(productData.concern_options) 
        ? productData.concern_options.join(',') 
        : productData.concern_options.toString();
      formData.append('concern_options', concerns);
    }

    // Handle image uploads
    if (productData.images?.length) {
      productData.images.forEach(image => {
        formData.append('images[]', image);
      });
    }

    const response = await api.postFormData(ENDPOINTS.UPDATE_PRODUCT, formData);
    return response.data;
  },

  async deleteProduct(productId) {
    if (!productId) throw new Error('Product ID is required');
    
    try {
      const formData = new FormData();
      formData.append('product_id', productId);
      
      const response = await api.postFormData(ENDPOINTS.DELETE_PRODUCT, formData);
      return response.data;
    } catch (error) {
      console.error('Delete product error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  // Helper methods
  _validateProductData(productData) {
    if (!productData.name?.trim()) throw new Error('Product name is required');
    if (!productData.price || parseFloat(productData.price) <= 0) throw new Error('Valid price is required');
    if (!productData.description?.trim()) throw new Error('Description is required');
    if (productData.quantity === undefined || parseInt(productData.quantity) < 0) throw new Error('Valid quantity is required');
    if (!productData.category || !CATEGORIES.includes(productData.category)) throw new Error('Valid category is required');
    if (!productData.concern_options || productData.concern_options.length === 0) throw new Error('At least one concern option is required');

    // Validate images
    if (productData.images?.length) {
      productData.images.forEach((image, index) => {
        if (!image.type?.startsWith('image/')) throw new Error(`File ${index + 1} must be an image`);
        if (image.size > 2 * 1024 * 1024) throw new Error(`Image ${index + 1} must be less than 2MB`);
      });
    }
  },

  _buildProductFormData(productData) {
    const formData = new FormData();
    formData.append('name', productData.name.trim());
    formData.append('price', productData.price.toString());
    formData.append('description', productData.description.trim());
    formData.append('quantity', productData.quantity.toString());
    formData.append('category', productData.category);

    const concerns = Array.isArray(productData.concern_options) 
      ? productData.concern_options.join(',') 
      : productData.concern_options.toString();
    formData.append('concern_options', concerns);

    if (productData.slashed_price) {
      formData.append('slashed_price', productData.slashed_price.toString());
    }

    if (productData.images?.length) {
      productData.images.forEach(image => {
        formData.append('images[]', image);
      });
    }

    return formData;
  }
};

export const contactService = {
  async submit(contactData) {
    // Validation
    if (!contactData.name?.trim()) throw new Error('Name is required');
    if (!contactData.email?.trim()) throw new Error('Email is required');
    if (!contactData.phone?.trim()) throw new Error('Phone is required');
    if (!contactData.subject?.trim()) throw new Error('Subject is required');
    if (!contactData.message?.trim()) throw new Error('Message is required');
    if (!isValidEmail(contactData.email)) throw new Error('Invalid email format');

    const formData = new FormData();
    formData.append('name', contactData.name.trim());
    formData.append('email', contactData.email.trim());
    formData.append('phone', contactData.phone.trim());
    formData.append('subject', contactData.subject.trim());
    formData.append('message', contactData.message.trim());

    const response = await api.postFormData(ENDPOINTS.SUBMIT_CONTACT, formData);
    return response.data;
  },

  async fetchSubmissions(filters = {}) {
    try {
      const response = await api.get(ENDPOINTS.FETCH_CONTACT_SUBMISSIONS, filters);
      return response.data;
    } catch (error) {
      console.error('Contact fetch error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch contact submissions');
    }
  }
};

// Fixed orderService following API documentation exactly
export const orderService = {
  async initiateCheckout(checkoutData) {
    // Validation
    this._validateCheckoutData(checkoutData);

    // According to API docs, checkout/initiate uses GET parameters
    const params = {
      name: checkoutData.name?.trim() || '',
      email: checkoutData.email?.trim() || '',
      phone: checkoutData.phone.trim(),
      delivery_method: checkoutData.delivery_method,
      cart: JSON.stringify(checkoutData.cart)
    };

    // Add address fields if delivery method is 'address'
    if (checkoutData.delivery_method === 'address') {
      params.state = checkoutData.state.trim();
      params.city = checkoutData.city.trim();
      params.street_address = checkoutData.street_address.trim();
    }

    // Add success redirect URL
    if (checkoutData.success_redirect) {
      params.success_redirect = checkoutData.success_redirect;
    } else if (isBrowser()) {
      params.success_redirect = `${window.location.origin}/checkout/success`;
    }

    // API docs show this as POST with query parameters
    const response = await api.post(`/checkout/initiate?${new URLSearchParams(params).toString()}`);
    return response.data;
  },

  async fetchOrders(filters = {}) {
    try {
      console.log('🔄 Fetching orders with filters:', filters);
      
      // Build query parameters exactly as API docs specify
      const params = {};
      
      // API docs: order_status = {successful|unsuccessful|all} (default: successful)
      if (filters.order_status && filters.order_status !== 'all') {
        params.order_status = filters.order_status;
      }
      
      // API docs: delivery_status = {unpaid|order-received|packaged|in-transit|delivered|all} (default: all except unpaid)
      if (filters.delivery_status && filters.delivery_status !== 'all') {
        params.delivery_status = filters.delivery_status;
      }
      
      // API docs: limit = {integer|optional}
      if (filters.limit) {
        params.limit = filters.limit;
      }
      
      console.log('📡 API request params:', params);
      
      // CORRECTED: Use the correct endpoint from API docs
      // API docs: GET '{base_url}/api/fetch-orders?...' with Authorization Bearer header
      const response = await api.get('/fetch-orders', params);
      
      console.log('✅ Orders API response:', {
        code: response.data?.code,
        message: response.data?.message,
        orderCount: response.data?.products?.length || 0
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Fetch orders error:', error);
      
      // Enhanced error handling for admin endpoints
      if (error.response?.status === 401) {
        throw new Error('Admin authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Admin privileges required to view orders.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to fetch orders. Please try again.');
      }
    }
  },

  async fetchOrder(orderId) {
    if (!orderId) throw new Error('Order ID is required');
    
    try {
      console.log('🔄 Fetching single order:', orderId);
      
      // API docs: GET /fetch-order?order_id={order_id}
      const response = await api.get('/fetch-order', { order_id: orderId });
      
      console.log('✅ Single order response:', {
        code: response.data?.code,
        hasOrder: !!response.data?.product
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Fetch order error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  },

  async changeDeliveryStatus(orderId, newStatus) {
    const validStatuses = ['unpaid', 'order-received', 'packaged', 'in-transit', 'delivered'];
    
    if (!orderId) throw new Error('Order ID is required');
    if (!newStatus) throw new Error('New delivery status is required');
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid delivery status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      console.log('🔄 Changing delivery status:', { orderId, newStatus });
      
      // API docs: POST /admin/change-delivery-status?new_delivery_status={new_delivery_status}&order_id={order_id}
      // Note: This one correctly keeps /admin/ prefix as shown in API docs
      const params = {
        order_id: orderId,
        new_delivery_status: newStatus
      };
      
      const response = await api.post(`/admin/change-delivery-status?${new URLSearchParams(params).toString()}`);
      
      console.log('✅ Status change response:', {
        code: response.data?.code,
        message: response.data?.message
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Change delivery status error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Admin authentication required. Please log in as admin.');
      } else if (error.response?.status === 403) {
        throw new Error('Admin privileges required to change order status.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to update delivery status. Please try again.');
      }
    }
  },

  _validateCheckoutData(checkoutData) {
    if (!checkoutData.phone?.trim()) throw new Error('Phone is required');
    if (!checkoutData.delivery_method) throw new Error('Delivery method is required');
    if (!['pickup', 'address'].includes(checkoutData.delivery_method)) throw new Error('Invalid delivery method');
    if (!checkoutData.cart?.length) throw new Error('Cart cannot be empty');

    if (checkoutData.delivery_method === 'address') {
      if (!checkoutData.state?.trim()) throw new Error('State is required');
      if (!checkoutData.city?.trim()) throw new Error('City is required');
      if (!checkoutData.street_address?.trim()) throw new Error('Street address is required');
    }
  }
};

export const consultationService = {
  async initiateConsultation(consultationData) {
    console.log('🔍 Processing consultation data:', consultationData);

    // Clean and validate data
    const cleanData = this._prepareConsultationData(consultationData);
    
    try {
      // Use FormData approach (most reliable for this API)
      const formData = new FormData();
      Object.entries(cleanData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      
      const response = await api.postFormData(ENDPOINTS.INITIATE_CONSULTATION, formData);
      return response.data;
    } catch (error) {
      console.error('Consultation API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to book consultation');
    }
  },

  async fetchBookedTimes(date = null) {
    const params = {};
    if (date) params.date = date;

    const response = await api.get(ENDPOINTS.FETCH_BOOKED_TIMES, params);
    return response.data;
  },

  async fetchConsultation(consultationId) {
    if (!consultationId) throw new Error('Consultation ID is required');
    
    const response = await api.get(ENDPOINTS.FETCH_CONSULTATION, { consultation_id: consultationId });
    return response.data;
  },

  async fetchConsultations(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_CONSULTATIONS, filters);
    return response.data;
  },

  _prepareConsultationData(consultationData) {
    const isEmpty = (value) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      if (Array.isArray(value)) return value.length === 0 || value.every(isEmpty);
      return false;
    };

    const cleanData = {
      name: consultationData.name?.toString().trim(),
      email: consultationData.email?.toString().trim(),
      phone: consultationData.phone?.toString().trim(),
      age_range: consultationData.age_range?.toString().trim(),
      gender: consultationData.gender?.toString().trim(),
      skin_type: consultationData.skin_type?.toString().trim(),
      channel: consultationData.channel?.toString().trim(),
      date: consultationData.date?.toString().trim(),
      time_range: consultationData.time_range?.toString().trim()
    };

    // Handle skin concerns
    let skinConcerns = consultationData.skin_concerns;
    if (Array.isArray(skinConcerns)) {
      cleanData.skin_concerns = skinConcerns.filter(c => !isEmpty(c)).join(',');
    } else if (skinConcerns) {
      cleanData.skin_concerns = skinConcerns.toString().trim();
    }

    // Optional fields
    if (!isEmpty(consultationData.current_skincare_products)) {
      cleanData.current_skincare_products = consultationData.current_skincare_products.toString().trim();
    }

    if (!isEmpty(consultationData.additional_details)) {
      cleanData.additional_details = consultationData.additional_details.toString().trim();
    }

    // Success redirect (safe for SSR)
    if (consultationData.success_redirect) {
      cleanData.success_redirect = consultationData.success_redirect;
    } else if (isBrowser()) {
      cleanData.success_redirect = `${window.location.origin}/consultation/success`;
    }

    return cleanData;
  }
};

export const newsletterService = {
  async addSubscriber(email) {
    try {
      // Validate email
      if (!email?.trim()) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      const cleanEmail = email.trim();
      
      if (!isValidEmail(cleanEmail)) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      console.log('🔄 Adding newsletter subscriber:', cleanEmail);

      const formData = new FormData();
      formData.append('email', cleanEmail);
      
      const response = await api.postFormData(ENDPOINTS.ADD_NEWSLETTER_SUBSCRIBER, formData);
      
      if (response.data?.code === 200) {
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Successfully subscribed to newsletter!'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: response.data?.message || 'Failed to subscribe. Please try again.'
        };
      }
    } catch (error) {
      console.error('❌ Newsletter service error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error. Please check your connection and try again.';
      
      return {
        success: false,
        error: error.response?.data || error,
        message: errorMessage
      };
    }
  },

  async removeSubscriber(email) {
    try {
      if (!email?.trim()) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      const cleanEmail = email.trim();
      
      if (!isValidEmail(cleanEmail)) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      console.log('🔄 Removing newsletter subscriber:', cleanEmail);

      const formData = new FormData();
      formData.append('email', cleanEmail);
      
      const response = await api.postFormData(ENDPOINTS.REMOVE_NEWSLETTER_SUBSCRIBER, formData);
      
      if (response.data?.code === 200) {
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Successfully unsubscribed!'
        };
      } else {
        return {
          success: false,
          error: response.data,
          message: response.data?.message || 'Failed to unsubscribe. Please try again.'
        };
      }
    } catch (error) {
      console.error('❌ Newsletter unsubscribe error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Network error. Please check your connection and try again.';
      
      return {
        success: false,
        error: error.response?.data || error,
        message: errorMessage
      };
    }
  },

  async fetchSubscribers(limit = null) {
    try {
      const params = {};
      if (limit) params.limit = limit;

      const response = await api.get(ENDPOINTS.FETCH_NEWSLETTER_SUBSCRIBERS, params);
      
      return {
        success: true,
        data: response.data,
        subscribers: response.data?.submission || response.data?.subscribers || [],
        message: response.data?.message || 'Subscribers fetched successfully!'
      };
    } catch (error) {
      console.error('❌ Newsletter fetch subscribers error:', error);
      return {
        success: false,
        error: error.response?.data || error,
        message: error.response?.data?.message || 'Failed to fetch subscribers.'
      };
    }
  }
};