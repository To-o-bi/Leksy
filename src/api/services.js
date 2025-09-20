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

    // Store token and user data using the API client
    api.setToken(response.data.token);
    
    let userData = null;
    if (response.data.user) {
      userData = response.data.user;
    } else if (response.data.admin) {
      userData = response.data.admin;
    } else {
      // Create a basic user object if none exists
      userData = { 
        role: 'admin', 
        username: response.data.username || 'admin',
        id: response.data.id || 1 
      };
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
    if (filters.concernOptions?.length) params.concern_options_filter = filters.concernOptions.join(',');

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

    // Basic fields
    const fields = ['name', 'price', 'description', 'available_qty', 'category', 'slashed_price'];
    fields.forEach(field => {
      if (productData[field] !== undefined && productData[field] !== null) {
        formData.append(field, productData[field].toString().trim());
      }
    });
    
    if (productData.concern_options) {
      const concerns = Array.isArray(productData.concern_options) 
        ? productData.concern_options.join(',') 
        : productData.concern_options.toString();
      formData.append('concern_options', concerns);
    }

    if (productData.removed_images?.length) {
      formData.append('removed_images', productData.removed_images.join(','));
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
    if (!productData.name?.trim()) {
      throw new Error('Product name is required');
    }
    
    if (!productData.price || productData.price <= 0) {
      throw new Error('Valid price is required');
    }

    if (!productData.category) {
      throw new Error('Category is required');
    }

    if (!productData.description?.trim()) {
      throw new Error('Description is required');
    }

    if (productData.quantity === undefined || productData.quantity < 0) {
      throw new Error('Valid quantity is required');
    }

    if (!productData.concern_options?.length) {
      throw new Error('At least one concern option is required');
    }

    return true;
  },

  _buildProductFormData(productData) {
    const formData = new FormData();
    
    // Basic required fields
    const fields = ['name', 'price', 'description', 'quantity', 'category'];
    fields.forEach(field => {
      formData.append(field, productData[field].toString().trim());
    });

    // Concern options
    const concerns = Array.isArray(productData.concern_options) 
      ? productData.concern_options.join(',') 
      : productData.concern_options.toString();
    formData.append('concern_options', concerns);

    // Optional slashed price
    if (productData.slashed_price) {
      formData.append('slashed_price', productData.slashed_price.toString());
    }

    // Images
    if (productData.images?.length) {
      productData.images.forEach(image => formData.append('images[]', image));
    }

    return formData;
  }
};

// Improved Contact Service with better error handling
export const contactService = {
  async submit(contactData) {
    // Validate required fields
    const required = ['name', 'email', 'phone', 'subject', 'message'];
    required.forEach(field => {
      if (!contactData[field]?.trim()) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    });

    // Additional email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      throw new Error('Invalid email format');
    }

    try {
      const formData = new FormData();
      required.forEach(field => {
        formData.append(field, contactData[field].trim());
      });

      // Add timestamp to help with duplicate detection
      formData.append('timestamp', new Date().toISOString());

      console.log('Sending request to:', ENDPOINTS.SUBMIT_CONTACT);
      
      const response = await api.postFormData(ENDPOINTS.SUBMIT_CONTACT, formData);
      
      // Log the response for debugging
      console.log('API Response:', response);
      
      return response.data;
      
    } catch (error) {
      console.error('Contact service error:', error);
      
      // Improve error messages based on common scenarios
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || 'Server error';
        
        if (status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (status === 400) {
          throw new Error(`Validation error: ${message}`);
        } else if (status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Request failed: ${message}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Check your internet connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  },

  async fetchSubmissions(filters = {}) {
    try {
      const response = await api.get(ENDPOINTS.FETCH_CONTACT_SUBMISSIONS, filters);
      return response.data;
    } catch (error) {
      console.error('Fetch submissions error:', error);
      throw error;
    }
  }
};

// Order Service - Updated
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

    // Add additional_phone if provided
    if (checkoutData.additional_phone?.trim()) {
      params.additional_phone = checkoutData.additional_phone.trim();
    }

    // Add additional_details if provided
    if (checkoutData.additional_details?.trim()) {
      params.additional_details = checkoutData.additional_details.trim();
    }

    // Add LGA if provided (for Lagos state)
    if (checkoutData.lga?.trim()) {
      params.lga = checkoutData.lga.trim();
    }

    if (checkoutData.delivery_method === 'address') {
      params.state = checkoutData.state.trim();
      params.city = checkoutData.city.trim();
      params.street_address = checkoutData.street_address.trim();
    }

    // Handle bus-park delivery method
    if (checkoutData.delivery_method === 'bus-park') {
      // Bus park delivery typically doesn't require address details
      // but might require state for delivery fee calculation
      if (checkoutData.state?.trim()) {
        params.state = checkoutData.state.trim();
      }
    }

    if (checkoutData.success_redirect) {
      params.success_redirect = checkoutData.success_redirect;
    } else if (isBrowser()) {
      params.success_redirect = `${window.location.origin}/checkout/checkout-success`;
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

    // Create a FormData object and append the data
    const formData = new FormData();
    formData.append('order_id', orderId);
    formData.append('new_delivery_status', newStatus);

    // Send the request using the confirmed FormData method
    const response = await api.post('/admin/change-delivery-status', formData);
    
    return response.data;
  },

  _validateCheckoutData(checkoutData) {
    if (!checkoutData.phone?.trim()) throw new Error('Phone is required');
    if (!['pickup', 'address', 'bus-park'].includes(checkoutData.delivery_method)) {
      throw new Error('Invalid delivery method. Must be pickup, address, or bus-park');
    }
    if (!checkoutData.cart?.length) throw new Error('Cart cannot be empty');

    if (checkoutData.delivery_method === 'address') {
      const addressFields = ['state', 'city', 'street_address'];
      addressFields.forEach(field => {
        if (!checkoutData[field]?.trim()) {
          throw new Error(`${field.replace('_', ' ')} is required for address delivery`);
        }
      });
    }

    // Validate additional_phone format if provided
    if (checkoutData.additional_phone && !/^\d{10,15}$/.test(checkoutData.additional_phone.replace(/\D/g, ''))) {
      throw new Error('Additional phone must be a valid phone number');
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


// Sales Service - Fixed Implementation
export const salesService = {
  async fetchSales(filters = {}) {
    const params = {};
    
    // Add any filters if needed
    if (filters.startDate) params.start_date = filters.startDate;
    if (filters.endDate) params.end_date = filters.endDate;
    if (filters.limit) params.limit = filters.limit;
    if (filters.status) params.status = filters.status;

    const response = await api.get('/fetch-sales', params);
    return response.data;
  },

  async fetchSaleById(saleId) {
    if (!saleId) throw new Error('Sale ID is required');
    const response = await api.get('/fetch-sale', { sale_id: saleId });
    return response.data;
  },

  async updateSaleStatus(saleId, status) {
    if (!saleId || !status) throw new Error('Sale ID and status are required');
    
    const formData = new FormData();
    formData.append('sale_id', saleId);
    formData.append('status', status);
    
    const response = await api.postFormData('/update-sale-status', formData);
    return response.data;
  }
};