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

export const authService = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('password', password);

    try {
      const response = await api.post('/admin/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.code === 200) {
        // Set token first
        if (response.data.token) {
          api.setToken(response.data.token);
        }
        
        // Then set user data
        if (response.data.user) {
          storage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
      }

      throw new Error(response.data?.message || 'Login failed');
    } catch (error) {
      // Clear any partial auth state on login failure
      this.clearAuth();
      throw error;
    }
  },

  async logout() {
    try {
      // Attempt graceful logout
      await api.post(ENDPOINTS.ADMIN_LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
      // Continue with local cleanup even if API fails
    } finally {
      this.clearAuth();
    }
  },

  clearAuth() {
    api.clearAuth();
    storage.removeItem('user');
  },

  isAuthenticated() {
    const hasToken = !!api.getToken();
    const hasUser = !!storage.getItem('user');
    
    // If we have a token but no user data, or vice versa, clear both
    if (hasToken !== hasUser) {
      console.warn('Auth state mismatch detected, clearing auth');
      this.clearAuth();
      return false;
    }
    
    return hasToken && hasUser;
  },

  getAuthUser() {
    try {
      const userData = storage.getItem('user');
      if (!userData) return null;
      
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      storage.removeItem('user');
      return null;
    }
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

export const orderService = {
  async initiateCheckout(checkoutData) {
    // Validation
    this._validateCheckoutData(checkoutData);

    const params = {
      name: checkoutData.name?.trim() || '',
      email: checkoutData.email?.trim() || '',
      phone: checkoutData.phone.trim(),
      delivery_method: checkoutData.delivery_method,
      cart: JSON.stringify(checkoutData.cart)
    };

    // Add address fields if needed
    if (checkoutData.delivery_method === 'address') {
      params.state = checkoutData.state.trim();
      params.city = checkoutData.city.trim();
      params.street_address = checkoutData.street_address.trim();
    }

    // Add success redirect URL (safe for SSR)
    if (checkoutData.success_redirect) {
      params.success_redirect = checkoutData.success_redirect;
    } else if (isBrowser()) {
      params.success_redirect = `${window.location.origin}/checkout/success`;
    }

    const response = await api.post(ENDPOINTS.INITIATE_CHECKOUT, null, { params });
    return response.data;
  },

  async fetchOrders(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_ORDERS, filters);
    return response.data;
  },

  async fetchOrder(orderId) {
    if (!orderId) throw new Error('Order ID is required');
    
    const response = await api.get(ENDPOINTS.FETCH_ORDER, { order_id: orderId });
    return response.data;
  },

  async changeDeliveryStatus(orderId, newStatus) {
    const validStatuses = ['unpaid', 'order-received', 'packaged', 'in-transit', 'delivered'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid delivery status');
    if (!orderId) throw new Error('Order ID is required');

    const response = await api.get(ENDPOINTS.CHANGE_DELIVERY_STATUS, {
      order_id: orderId,
      new_delivery_status: newStatus
    });
    return response.data;
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