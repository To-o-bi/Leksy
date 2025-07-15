import api from './axios.js';
import { ENDPOINTS, CATEGORIES } from './config.js';

// Utility functions
const isBrowser = () => typeof window !== 'undefined';
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Auth Service
export const authService = {
  async login(username, password) {
    if (!username?.trim() || !password?.trim()) {
      throw new Error('Username and password are required');
    }

    // Clear any existing auth data
    this.clearAuth();

    const loginMethods = [
      // Form-encoded data
      () => {
        const formData = new URLSearchParams();
        formData.append('username', username.trim());
        formData.append('password', password);
        return api.post('/admin/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      },
      // Query parameters
      () => api.post(`/admin/login?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password)}`),
      // JSON body
      () => api.post('/admin/login', { username: username.trim(), password })
    ];

    let response;
    let lastError;

    for (const method of loginMethods) {
      try {
        response = await method();
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!response) {
      throw lastError || new Error('All login methods failed');
    }

    if (response.data?.code !== 200) {
      throw new Error(response.data?.message || 'Login failed');
    }

    if (!response.data.token) {
      throw new Error('No authentication token received');
    }

    console.log('✅ Login successful! Response data:', {
      hasToken: !!response.data.token,
      hasUser: !!response.data.user,
      hasAdmin: !!response.data.admin,
      code: response.data.code,
      responseKeys: Object.keys(response.data)
    });

    // Store token and user data using the API client
    api.setToken(response.data.token);
    console.log('🔑 Token stored, now storing user data...');
    
    let userData = null;
    if (response.data.user) {
      console.log('👤 User data found in response:', { role: response.data.user.role });
      userData = response.data.user;
    } else if (response.data.admin) {
      console.log('👤 Admin data found in response:', { role: response.data.admin.role });
      userData = response.data.admin;
    } else {
      console.log('❌ No user data found in login response:', Object.keys(response.data));
      // Create a basic user object if none exists
      userData = { 
        role: 'admin', 
        username: response.data.username || 'admin',
        id: response.data.id || 1 
      };
      console.log('🔧 Created fallback user data:', userData);
    }
    
    if (userData) {
      api.setUser(userData);
    }

    return response.data;
  },

  async logout() {
    try {
      if (this.isAuthenticated()) {
        await api.post('/admin/logout');
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  },

  clearAuth() {
    api.clearAuth();
  },

  isAuthenticated() {
    return api.isAuthenticated();
  },

  getAuthUser() {
    return api.getUser();
  },

  getToken() {
    return api.getToken();
  },

  updateUser(updates) {
    const currentUser = this.getAuthUser();
    if (!currentUser) return null;
    
    const updatedUser = { ...currentUser, ...updates };
    api.setUser(updatedUser);
    return updatedUser;
  }
};

// Product Service
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
    this._validateProductData(productData);
    const formData = this._buildProductFormData(productData);
    const response = await api.postFormData(ENDPOINTS.ADD_PRODUCT, formData);
    return response.data;
  },

  async updateProduct(productId, productData) {
    if (!productId) throw new Error('Product ID is required');
    
    const formData = new FormData();
    formData.append('product_id', productId);

    const fields = ['name', 'price', 'description', 'available_qty', 'category', 'slashed_price'];
    fields.forEach(field => {
      if (productData[field] !== undefined) {
        formData.append(field, productData[field].toString().trim());
      }
    });
    
    if (productData.concern_options) {
      const concerns = Array.isArray(productData.concern_options) 
        ? productData.concern_options.join(',') 
        : productData.concern_options.toString();
      formData.append('concern_options', concerns);
    }

    if (productData.images?.length) {
      productData.images.forEach(image => formData.append('images[]', image));
    }

    const response = await api.postFormData(ENDPOINTS.UPDATE_PRODUCT, formData);
    return response.data;
  },

  async deleteProduct(productId) {
    if (!productId) throw new Error('Product ID is required');
    
    const formData = new FormData();
    formData.append('product_id', productId);
    
    const response = await api.postFormData(ENDPOINTS.DELETE_PRODUCT, formData);
    return response.data;
  },

  _validateProductData(productData) {
    const required = [
      { field: 'name', message: 'Product name is required' },
      { field: 'price', message: 'Valid price is required', validate: (val) => parseFloat(val) > 0 },
      { field: 'description', message: 'Description is required' },
      { field: 'quantity', message: 'Valid quantity is required', validate: (val) => parseInt(val) >= 0 },
      { field: 'category', message: 'Valid category is required', validate: (val) => CATEGORIES.includes(val) },
      { field: 'concern_options', message: 'At least one concern option is required', validate: (val) => val && val.length > 0 }
    ];

    required.forEach(({ field, message, validate }) => {
      const value = productData[field];
      if (!value || (typeof value === 'string' && !value.trim()) || (validate && !validate(value))) {
        throw new Error(message);
      }
    });

    if (productData.images?.length) {
      productData.images.forEach((image, index) => {
        if (!image.type?.startsWith('image/')) {
          throw new Error(`File ${index + 1} must be an image`);
        }
        if (image.size > 2 * 1024 * 1024) {
          throw new Error(`Image ${index + 1} must be less than 2MB`);
        }
      });
    }
  },

  _buildProductFormData(productData) {
    const formData = new FormData();
    const fields = ['name', 'price', 'description', 'quantity', 'category'];
    
    fields.forEach(field => {
      formData.append(field, productData[field].toString().trim());
    });

    const concerns = Array.isArray(productData.concern_options) 
      ? productData.concern_options.join(',') 
      : productData.concern_options.toString();
    formData.append('concern_options', concerns);

    if (productData.slashed_price) {
      formData.append('slashed_price', productData.slashed_price.toString());
    }

    if (productData.images?.length) {
      productData.images.forEach(image => formData.append('images[]', image));
    }

    return formData;
  }
};

// Contact Service
export const contactService = {
  async submit(contactData) {
    const required = ['name', 'email', 'phone', 'subject', 'message'];
    required.forEach(field => {
      if (!contactData[field]?.trim()) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    });

    if (!isValidEmail(contactData.email)) {
      throw new Error('Invalid email format');
    }

    const formData = new FormData();
    required.forEach(field => {
      formData.append(field, contactData[field].trim());
    });

    const response = await api.postFormData(ENDPOINTS.SUBMIT_CONTACT, formData);
    return response.data;
  },

  async fetchSubmissions(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_CONTACT_SUBMISSIONS, filters);
    return response.data;
  }
};

// Order Service
export const orderService = {
  async initiateCheckout(checkoutData) {
    this._validateCheckoutData(checkoutData);

    const params = {
      name: checkoutData.name?.trim() || '',
      email: checkoutData.email?.trim() || '',
      phone: checkoutData.phone.trim(),
      delivery_method: checkoutData.delivery_method,
      cart: JSON.stringify(checkoutData.cart)
    };

    if (checkoutData.delivery_method === 'address') {
      params.state = checkoutData.state.trim();
      params.city = checkoutData.city.trim();
      params.street_address = checkoutData.street_address.trim();
    }

    if (checkoutData.success_redirect) {
      params.success_redirect = checkoutData.success_redirect;
    } else if (isBrowser()) {
      params.success_redirect = `${window.location.origin}/checkout/success`;
    }

    const response = await api.post(`/checkout/initiate?${new URLSearchParams(params).toString()}`);
    return response.data;
  },

  async fetchOrders(filters = {}) {
    const params = {};
    if (filters.order_status && filters.order_status !== 'all') {
      params.order_status = filters.order_status;
    }
    if (filters.delivery_status && filters.delivery_status !== 'all') {
      params.delivery_status = filters.delivery_status;
    }
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get('/fetch-orders', params);
    return response.data;
  },

  async fetchOrder(orderId) {
    if (!orderId) throw new Error('Order ID is required');
    const response = await api.get('/fetch-order', { order_id: orderId });
    return response.data;
  },

  async changeDeliveryStatus(orderId, newStatus) {
    const validStatuses = ['unpaid', 'order-received', 'packaged', 'in-transit', 'delivered'];
    
    if (!orderId) throw new Error('Order ID is required');
    if (!newStatus || !validStatuses.includes(newStatus)) {
      throw new Error(`Invalid delivery status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const params = { order_id: orderId, new_delivery_status: newStatus };
    const response = await api.post(`/admin/change-delivery-status?${new URLSearchParams(params).toString()}`);
    return response.data;
  },

  _validateCheckoutData(checkoutData) {
    if (!checkoutData.phone?.trim()) throw new Error('Phone is required');
    if (!['pickup', 'address'].includes(checkoutData.delivery_method)) {
      throw new Error('Invalid delivery method');
    }
    if (!checkoutData.cart?.length) throw new Error('Cart cannot be empty');

    if (checkoutData.delivery_method === 'address') {
      const addressFields = ['state', 'city', 'street_address'];
      addressFields.forEach(field => {
        if (!checkoutData[field]?.trim()) {
          throw new Error(`${field.replace('_', ' ')} is required`);
        }
      });
    }
  }
};

// Consultation Service
export const consultationService = {
  async initiateConsultation(consultationData) {
    const cleanData = this._prepareConsultationData(consultationData);
    
    const formData = new FormData();
    Object.entries(cleanData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    
    const response = await api.postFormData(ENDPOINTS.INITIATE_CONSULTATION, formData);
    return response.data;
  },

  async fetchBookedTimes(date = null) {
    const params = date ? { date } : {};
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
    const cleanData = {};
    const fields = ['name', 'email', 'phone', 'age_range', 'gender', 'skin_type', 'channel', 'date', 'time_range'];
    
    fields.forEach(field => {
      if (consultationData[field]) {
        cleanData[field] = consultationData[field].toString().trim();
      }
    });

    // Handle skin concerns
    if (consultationData.skin_concerns) {
      cleanData.skin_concerns = Array.isArray(consultationData.skin_concerns) 
        ? consultationData.skin_concerns.filter(c => c && c.trim()).join(',')
        : consultationData.skin_concerns.toString().trim();
    }

    // Optional fields
    ['current_skincare_products', 'additional_details'].forEach(field => {
      if (consultationData[field]?.trim()) {
        cleanData[field] = consultationData[field].toString().trim();
      }
    });

    // Success redirect
    if (consultationData.success_redirect) {
      cleanData.success_redirect = consultationData.success_redirect;
    } else if (isBrowser()) {
      cleanData.success_redirect = `${window.location.origin}/consultation/success`;
    }

    return cleanData;
  }
};

// Newsletter Service
export const newsletterService = {
  async addSubscriber(email) {
    if (!email?.trim() || !isValidEmail(email.trim())) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    try {
      const formData = new FormData();
      formData.append('email', email.trim());
      
      const response = await api.postFormData(ENDPOINTS.ADD_NEWSLETTER_SUBSCRIBER, formData);
      
      return {
        success: response.data?.code === 200,
        data: response.data,
        message: response.data?.message || (response.data?.code === 200 ? 'Successfully subscribed!' : 'Failed to subscribe')
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error,
        message: error.response?.data?.message || 'Network error. Please try again.'
      };
    }
  },

  async removeSubscriber(email) {
    if (!email?.trim() || !isValidEmail(email.trim())) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    try {
      const formData = new FormData();
      formData.append('email', email.trim());
      
      const response = await api.postFormData(ENDPOINTS.REMOVE_NEWSLETTER_SUBSCRIBER, formData);
      
      return {
        success: response.data?.code === 200,
        data: response.data,
        message: response.data?.message || (response.data?.code === 200 ? 'Successfully unsubscribed!' : 'Failed to unsubscribe')
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error,
        message: error.response?.data?.message || 'Network error. Please try again.'
      };
    }
  },

  async fetchSubscribers(limit = null) {
    try {
      const params = limit ? { limit } : {};
      const response = await api.get(ENDPOINTS.FETCH_NEWSLETTER_SUBSCRIBERS, params);
      
      return {
        success: true,
        data: response.data,
        subscribers: response.data?.submission || response.data?.subscribers || [],
        message: 'Subscribers fetched successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error,
        message: error.response?.data?.message || 'Failed to fetch subscribers.'
      };
    }
  }
};