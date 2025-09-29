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

    this.clearAuth();

    const loginMethods = [
      () => {
        const formData = new URLSearchParams();
        formData.append('username', username.trim());
        formData.append('password', password);
        return api.post('/admin/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      },
      () => api.post(`/admin/login?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password)}`),
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

    api.setToken(response.data.token);
    
    let userData = null;
    if (response.data.user) {
      userData = response.data.user;
    } else if (response.data.admin) {
      userData = response.data.admin;
    } else {
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
      // Silent fail for logout API call
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

// Enhanced Product Service with Debug Logging
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
    
    console.log('🔍 Fetching product with ID:', productId);
    
    const response = await api.get(ENDPOINTS.FETCH_PRODUCT, { product_id: productId });
    
    // Debug: Log the raw response
    console.log('📥 Raw fetchProduct response:', response);
    console.log('📥 Response data:', response.data);
    
    if (response.data && response.data.product) {
      console.log('🔍 Product concern_options from API:', {
        raw: response.data.product.concern_options,
        type: typeof response.data.product.concern_options,
        isArray: Array.isArray(response.data.product.concern_options),
        stringified: JSON.stringify(response.data.product.concern_options)
      });
    }
    
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
    
    console.log('🚀 Starting updateProduct with:', {
      productId,
      productData: JSON.stringify(productData, null, 2)
    });
    
    const formData = new FormData();
    formData.append('product_id', productId);

    const fields = ['name', 'price', 'description', 'available_qty', 'category', 'slashed_price'];
    fields.forEach(field => {
      if (productData[field] !== undefined && productData[field] !== null) {
        const value = productData[field].toString().trim();
        formData.append(field, value);
        console.log(`📝 Added field ${field}:`, value);
      }
    });
    
    // CRITICAL: Enhanced concern_options handling with extensive debugging
    console.log('🎯 Processing concern_options:', {
      original: productData.concern_options,
      type: typeof productData.concern_options,
      isArray: Array.isArray(productData.concern_options),
      length: productData.concern_options?.length,
      isDefined: productData.concern_options !== undefined,
      isNull: productData.concern_options === null,
      stringified: JSON.stringify(productData.concern_options)
    });
    
    if (productData.concern_options !== undefined) {
      let concernsToSend = '';
      
      if (Array.isArray(productData.concern_options)) {
        // If it's an array (including empty array), join with commas
        concernsToSend = productData.concern_options.join(',');
        console.log('✅ Processed as array - joined result:', concernsToSend);
      } else if (productData.concern_options) {
        // If it's a string or other value, convert to string
        concernsToSend = productData.concern_options.toString();
        console.log('✅ Processed as string:', concernsToSend);
      } else {
        // Explicitly handle null/undefined/false cases
        concernsToSend = '';
        console.log('✅ Processed as empty (null/undefined/false)');
      }
      
      // Always append, even if empty string (this tells backend to clear concerns)
      formData.append('concern_options', concernsToSend);
      console.log('📤 Final concern_options being sent:', {
        value: concernsToSend,
        length: concernsToSend.length,
        isEmpty: concernsToSend === '',
        type: typeof concernsToSend
      });
    } else {
      console.log('⚠️ concern_options is undefined - not sending to backend');
    }

    if (productData.removed_images?.length) {
      const removedImagesStr = productData.removed_images.join(',');
      formData.append('removed_images', removedImagesStr);
      console.log('🗑️ Removed images:', removedImagesStr);
    }

    if (productData.images?.length) {
      console.log('🖼️ Adding new images:', productData.images.length);
      productData.images.forEach((image, index) => {
        formData.append('images[]', image);
        console.log(`📷 Image ${index + 1}:`, image.name || 'Unknown filename', `(${image.size} bytes)`);
      });
    }

    // Debug: Log all FormData entries
    console.log('📋 Complete FormData being sent:');
    for (let [key, value] of formData.entries()) {
      if (key === 'images[]') {
        console.log(`${key}: [File: ${value.name || 'unknown'}, ${value.size || 'unknown size'} bytes]`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    console.log('🌐 Making API request to updateProduct...');
    const response = await api.postFormData(ENDPOINTS.UPDATE_PRODUCT, formData);
    
    // Enhanced response debugging
    console.log('📥 Raw updateProduct response:', response);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers);
    console.log('📥 Response data:', response.data);
    
    // Try to parse if it's a string with HTML
    let parsedResponse = response.data;
    if (typeof response.data === 'string') {
      console.log('🔍 Response is string, attempting to parse...');
      
      // Check for HTML response (common backend error)
      if (response.data.includes('<!DOCTYPE') || response.data.includes('<html')) {
        console.error('❌ Received HTML response instead of JSON - this indicates a backend error');
        console.log('📄 HTML Response preview:', response.data.substring(0, 500) + '...');
      }
      
      // Try to extract JSON from string response
      try {
        const jsonMatch = response.data.match(/\{.*\}$/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
          console.log('✅ Extracted JSON from string response:', parsedResponse);
        }
      } catch (e) {
        console.error('❌ Failed to parse JSON from string response:', e);
      }
    }
    
    // Log final parsed response
    console.log('📋 Final parsed response:', {
      code: parsedResponse?.code,
      message: parsedResponse?.message,
      success: parsedResponse?.success,
      data: parsedResponse?.data,
      product: parsedResponse?.product,
      fullResponse: parsedResponse
    });
    
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

    return true;
  },

  _buildProductFormData(productData) {
    const formData = new FormData();
    
    const fields = ['name', 'price', 'description', 'quantity', 'category'];
    fields.forEach(field => {
      formData.append(field, productData[field].toString().trim());
    });

    if (productData.concern_options && productData.concern_options.length > 0) {
      const concerns = Array.isArray(productData.concern_options) 
        ? productData.concern_options.join(',') 
        : productData.concern_options.toString();
      formData.append('concern_options', concerns);
    }

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      throw new Error('Invalid email format');
    }

    try {
      const formData = new FormData();
      required.forEach(field => {
        formData.append(field, contactData[field].trim());
      });

      formData.append('timestamp', new Date().toISOString());
      
      const response = await api.postFormData(ENDPOINTS.SUBMIT_CONTACT, formData);
      return response.data;
      
    } catch (error) {
      if (error.response) {
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
        throw new Error('No response from server. Check your internet connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
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

    if (checkoutData.additional_phone?.trim()) {
      params.additional_phone = checkoutData.additional_phone.trim();
    }

    if (checkoutData.additional_details?.trim()) {
      params.additional_details = checkoutData.additional_details.trim();
    }

    if (checkoutData.lga?.trim()) {
      params.lga = checkoutData.lga.trim();
    }

    if (checkoutData.delivery_method === 'address') {
      params.state = checkoutData.state.trim();
      params.city = checkoutData.city.trim();
      params.street_address = checkoutData.street_address.trim();
    }

    if (checkoutData.delivery_method === 'bus-park') {
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

    const formData = new FormData();
    formData.append('order_id', orderId);
    formData.append('new_delivery_status', newStatus);

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

    if (consultationData.skin_concerns) {
      cleanData.skin_concerns = Array.isArray(consultationData.skin_concerns) 
        ? consultationData.skin_concerns.filter(c => c && c.trim()).join(',')
        : consultationData.skin_concerns.toString().trim();
    }

    ['current_skincare_products', 'additional_details'].forEach(field => {
      if (consultationData[field]?.trim()) {
        cleanData[field] = consultationData[field].toString().trim();
      }
    });

    if (consultationData.success_redirect) {
      cleanData.success_redirect = consultationData.success_redirect;
    } else if (isBrowser()) {
      cleanData.success_redirect = `${window.location.origin}/consultation/success`;
    }

    return cleanData;
  }
};

// Sales Service
export const salesService = {
  async fetchSales(filters = {}) {
    const params = {};
    
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