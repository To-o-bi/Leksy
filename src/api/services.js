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

    const fields = ['name', 'price', 'description', 'available_qty', 'category', 'slashed_price'];
    fields.forEach(field => {
      if (productData[field] !== undefined && productData[field] !== null) {
        const value = productData[field].toString().trim();
        formData.append(field, value);
      }
    });
    
    if (productData.concern_options !== undefined) {
      let concernsToSend = '';
      
      if (Array.isArray(productData.concern_options)) {
        concernsToSend = productData.concern_options.join(',');
      } else if (productData.concern_options) {
        concernsToSend = productData.concern_options.toString();
      } else {
        concernsToSend = '';
      }
      
      formData.append('concern_options', concernsToSend);
    }

    if (productData.removed_images?.length) {
      const removedImagesStr = productData.removed_images.join(',');
      formData.append('removed_images', removedImagesStr);
    }

    if (productData.images?.length) {
      productData.images.forEach((image, index) => {
        formData.append('images[]', image);
      });
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


// product discountService.js 

export const discountService = {
  async fetchDiscounts() {
    try {
      const formBody = new URLSearchParams({ action: 'fetch' }).toString();
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DISCOUNTS,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch discounts');
    }
  },

  async fetchDiscount(discountId) {
    if (!discountId) throw new Error('Discount ID is required');
    
    try {
      const formBody = new URLSearchParams({
        action: 'fetch',
        discount_id: discountId
      }).toString();
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DISCOUNTS,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch discount');
    }
  },

  async addDiscount(discountData) {
    this._validateDiscountData(discountData);
    
    const data = {
      category: discountData.category || 'all',
      discount_percent: discountData.discount_percent,
      valid_from: discountData.valid_from,
      valid_to: discountData.valid_to,
      isFirstTimeOnly: discountData.isFirstTimeOnly ? '1' : '0',
      isActive: '1'
    };

    try {
      const formBody = new URLSearchParams({
        action: 'add',
        ...data
      }).toString();
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DISCOUNTS,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (response.data.code === 200) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to add discount');
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to add discount');
    }
  },

  async editDiscount(discountId, discountData) {
    if (!discountId) throw new Error('Discount ID is required');
    
    const data = {
      discount_id: discountId
    };

    if (discountData.category !== undefined) data.category = discountData.category;
    if (discountData.discount_percent !== undefined) data.discount_percent = discountData.discount_percent;
    if (discountData.valid_from !== undefined) data.valid_from = discountData.valid_from;
    if (discountData.valid_to !== undefined) data.valid_to = discountData.valid_to;
    if (discountData.isFirstTimeOnly !== undefined) data.isFirstTimeOnly = discountData.isFirstTimeOnly ? '1' : '0';
    if (discountData.isActive !== undefined) data.isActive = discountData.isActive ? '1' : '0';

    try {
      const formBody = new URLSearchParams({
        action: 'edit',
        ...data
      }).toString();
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DISCOUNTS,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (response.data.code === 200) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to edit discount');
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to edit discount');
    }
  },

  async deleteDiscount(discountId) {
    if (!discountId) throw new Error('Discount ID is required');
    
    try {
      const formBody = new URLSearchParams({
        action: 'delete',
        discount_id: discountId
      }).toString();
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DISCOUNTS,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete discount');
    }
  },

  async fetchActiveDiscounts() {
    try {
      const formBody = new URLSearchParams({ action: 'fetch' }).toString();
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DISCOUNTS,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (response.data?.code === 200 && response.data?.discount_data) {
        const allDiscounts = response.data.discount_data;
        const now = new Date();
        
        const activeDiscounts = allDiscounts.filter((discount) => {
          // Check if discount is active
          const isActive = discount.isActive === 1 || discount.isActive === '1' || discount.isActive === true;
          if (!isActive) return false;
          
          // Check date range
          const validFrom = new Date(discount.valid_from);
          const validTo = new Date(discount.valid_to);
          validTo.setHours(23, 59, 59, 999);
          
          const isInDateRange = now >= validFrom && now <= validTo;
          if (!isInDateRange) return false;
          
          return true;
        });
        
        return {
          code: 200,
          discounts: activeDiscounts,
          message: 'Active discounts fetched successfully'
        };
      }
      
      return { code: 200, discounts: [], message: 'No active discounts' };
    } catch (error) {
      console.error('Error fetching discounts:', error);
      return { code: 200, discounts: [], message: 'No discounts available' };
    }
  },

  calculateDiscountedPrice(product, discounts) {
    if (!discounts || discounts.length === 0) return null;
    if (!product || !product.price) return null;
    
    const now = new Date();
    const productCategory = (product.category || '').toLowerCase().trim();

    const applicableDiscounts = discounts.filter(discount => {
      // Check if discount is active
      const isActive = discount.isActive === 1 || discount.isActive === '1' || discount.isActive === true;
      if (!isActive) return false;

      // Check date range
      const validFrom = new Date(discount.valid_from);
      const validTo = new Date(discount.valid_to);
      validTo.setHours(23, 59, 59, 999);

      if (now < validFrom || now > validTo) return false;

      // Check category match
      const discountCategory = (discount.category || '').toLowerCase().trim();
      
      if (discountCategory === 'all') return true;
      
      if (discountCategory === 'others') {
        const mainCategories = ['serum', 'cleanser', 'toner', 'mask', 'sunscreen', 
                                'moisturizer', 'body-and-bath', 'eye-cream', 'beauty', 'perfume'];
        return !mainCategories.includes(productCategory);
      }
      
      const normalizedDiscountCategory = discountCategory.replace(/\s+/g, '-');
      const normalizedProductCategory = productCategory.replace(/\s+/g, '-');
      
      return normalizedDiscountCategory === normalizedProductCategory;
    });

    if (applicableDiscounts.length === 0) return null;

    // Get the best discount (highest percentage)
    const bestDiscount = applicableDiscounts.reduce((max, current) => {
      const currentPercent = parseFloat(current.discount_percent) || 0;
      const maxPercent = parseFloat(max.discount_percent) || 0;
      return currentPercent > maxPercent ? current : max;
    });

    const discountPercent = parseFloat(bestDiscount.discount_percent) || 0;
    const originalPrice = parseFloat(product.price) || 0;
    const discountedPrice = originalPrice - (originalPrice * discountPercent / 100);

    return {
      originalPrice,
      discountedPrice: Math.max(0, discountedPrice),
      discountPercent,
      savings: originalPrice - discountedPrice,
      validUntil: bestDiscount.valid_to,
      discountId: bestDiscount.id
    };
  },

  applyDiscountToProduct(product, discounts) {
    if (!product) return product;
    
    const discountInfo = this.calculateDiscountedPrice(product, discounts);
    
    if (discountInfo) {
      return {
        ...product,
        hasDiscount: true,
        originalPrice: discountInfo.originalPrice,
        discountedPrice: discountInfo.discountedPrice,
        discountPercent: discountInfo.discountPercent,
        savings: discountInfo.savings,
        discountValidUntil: discountInfo.validUntil
      };
    }
    
    return product;
  },

  applyDiscountsToProducts(products, discounts) {
    if (!products || !Array.isArray(products)) return products;
    if (!discounts || discounts.length === 0) return products;
    
    return products.map(product => this.applyDiscountToProduct(product, discounts));
  },

  _validateDiscountData(discountData) {
    if (!discountData.discount_percent || discountData.discount_percent <= 0 || discountData.discount_percent > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    if (!discountData.valid_from) throw new Error('Start date is required');
    if (!discountData.valid_to) throw new Error('End date is required');

    const startDate = new Date(discountData.valid_from);
    const endDate = new Date(discountData.valid_to);

    if (isNaN(startDate.getTime())) throw new Error('Invalid start date format');
    if (isNaN(endDate.getTime())) throw new Error('Invalid end date format');
    if (endDate < startDate) throw new Error('End date must be after start date');

    return true;
  }
};


// deliverydiscount.js

export const deliveryDiscountService = {
  async fetchAllDeliveryDiscounts() {
    try {
      const formBody = new URLSearchParams({ action: 'fetch' }).toString();
      
      console.log('🔍 [FETCH ALL DELIVERY DISCOUNTS] Request:', {
        endpoint: ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        body: formBody
      });
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('✅ [FETCH ALL DELIVERY DISCOUNTS] Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [FETCH ALL DELIVERY DISCOUNTS] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 404 || error.response?.data?.code === 404) {
        return { code: 200, discount_data: [], message: 'No delivery discounts found' };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch delivery discounts');
    }
  },

  async fetchDeliveryDiscountById(discountId) {
    try {
      const formBody = new URLSearchParams({ 
        action: 'fetch',
        discount_id: discountId
      }).toString();
      
      console.log('🔍 [FETCH DELIVERY DISCOUNT BY ID] Request:', {
        endpoint: ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        discountId
      });
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('✅ [FETCH DELIVERY DISCOUNT BY ID] Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [FETCH DELIVERY DISCOUNT BY ID] Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch delivery discount');
    }
  },

  async fetchDeliveryDiscountByState(state) {
    try {
      const formBody = new URLSearchParams({ 
        action: 'fetch',
        state: state
      }).toString();
      
      console.log('🔍 [FETCH DELIVERY DISCOUNT BY STATE] Request:', {
        endpoint: ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        state
      });
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('✅ [FETCH DELIVERY DISCOUNT BY STATE] Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [FETCH DELIVERY DISCOUNT BY STATE] Error:', error);
      if (error.response?.status === 404 || error.response?.data?.code === 404) {
        return { code: 404, discount_data: null, message: 'No discount found for this state' };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch delivery discount');
    }
  },

  async createDeliveryDiscount(discountData) {
    this._validateDiscountData(discountData);
    
    const params = {
      action: 'add',
      state: discountData.state,
      discount_percent: discountData.discount_percent,
      valid_from: discountData.valid_from,
      valid_to: discountData.valid_to
    };

    // Add optional fields
    if (discountData.min_order_price_trigger) {
      params.min_order_price_trigger = discountData.min_order_price_trigger;
    }
    
    params.isFirstTimeOnly = discountData.isFirstTimeOnly ? '1' : '0';
    params.isActive = discountData.isActive !== undefined ? (discountData.isActive ? '1' : '0') : '1';

    try {
      const formBody = new URLSearchParams(params).toString();
      
      console.log('➕ [CREATE DELIVERY DISCOUNT] Request:', {
        endpoint: ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        params,
        formBody
      });
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('✅ [CREATE DELIVERY DISCOUNT] Response:', response.data);
      
      if (response.data.code === 200) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to create delivery discount');
    } catch (error) {
      console.error('❌ [CREATE DELIVERY DISCOUNT] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || error.message || 'Failed to create delivery discount');
    }
  },

  async editDeliveryDiscount(discountId, discountData) {
    const params = {
      action: 'edit',
      discount_id: discountId
    };

    // Add only provided fields
    if (discountData.state !== undefined) {
      params.state = discountData.state;
    }
    if (discountData.discount_percent !== undefined) {
      params.discount_percent = discountData.discount_percent;
    }
    if (discountData.min_order_price_trigger !== undefined) {
      params.min_order_price_trigger = discountData.min_order_price_trigger;
    }
    if (discountData.valid_from !== undefined) {
      params.valid_from = discountData.valid_from;
    }
    if (discountData.valid_to !== undefined) {
      params.valid_to = discountData.valid_to;
    }
    if (discountData.isFirstTimeOnly !== undefined) {
      params.isFirstTimeOnly = discountData.isFirstTimeOnly ? '1' : '0';
    }
    if (discountData.isActive !== undefined) {
      params.isActive = discountData.isActive ? '1' : '0';
    }

    try {
      const formBody = new URLSearchParams(params).toString();
      
      console.log('✏️ [EDIT DELIVERY DISCOUNT] Request:', {
        endpoint: ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        params,
        formBody
      });
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('✅ [EDIT DELIVERY DISCOUNT] Response:', response.data);
      
      if (response.data.code === 200) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to edit delivery discount');
    } catch (error) {
      console.error('❌ [EDIT DELIVERY DISCOUNT] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || error.message || 'Failed to edit delivery discount');
    }
  },

  async deleteDeliveryDiscount(discountId) {
    try {
      const formBody = new URLSearchParams({ 
        action: 'delete',
        discount_id: discountId
      }).toString();
      
      console.log('🗑️ [DELETE DELIVERY DISCOUNT] Request:', {
        endpoint: ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        discountId
      });
      
      const response = await api.post(
        ENDPOINTS.MANAGE_DELIVERY_DISCOUNT,
        formBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      console.log('✅ [DELETE DELIVERY DISCOUNT] Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [DELETE DELIVERY DISCOUNT] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Failed to delete delivery discount');
    }
  },

  calculateDeliveryDiscount(deliveryFee, discount, orderTotal, isFirstTimeCustomer = false) {
    if (!discount || !deliveryFee) return null;

    // Check if discount is active
    const isActive = discount.isActive === 1 || discount.isActive === '1' || discount.isActive === true;
    if (!isActive) return null;

    // Check if it's first-time only and user doesn't qualify
    const isFirstTimeOnly = discount.isFirstTimeOnly === 1 || discount.isFirstTimeOnly === '1' || discount.isFirstTimeOnly === true;
    if (isFirstTimeOnly && !isFirstTimeCustomer) return null;

    // Check minimum order price trigger
    if (discount.min_order_price_trigger && orderTotal < parseFloat(discount.min_order_price_trigger)) {
      return null;
    }

    // Check date range
    const now = new Date();
    const validFrom = new Date(discount.valid_from);
    const validTo = new Date(discount.valid_to);
    validTo.setHours(23, 59, 59, 999);

    if (now < validFrom || now > validTo) return null;

    const discountPercent = parseFloat(discount.discount_percent) || 0;
    const originalFee = parseFloat(deliveryFee) || 0;
    const discountAmount = originalFee * discountPercent / 100;
    const discountedFee = originalFee - discountAmount;

    return {
      originalFee,
      discountedFee: Math.max(0, discountedFee),
      discountPercent,
      discountAmount,
      savings: discountAmount,
      validUntil: discount.valid_to,
      isFirstTimeOnly,
      state: discount.state
    };
  },

  isDeliveryDiscountActive(discount) {
    if (!discount) return false;

    const isActive = discount.isActive === 1 || discount.isActive === '1' || discount.isActive === true;
    if (!isActive) return false;

    const now = new Date();
    const validFrom = new Date(discount.valid_from);
    const validTo = new Date(discount.valid_to);
    validTo.setHours(23, 59, 59, 999);

    return now >= validFrom && now <= validTo;
  },

  _validateDiscountData(discountData) {
    if (!discountData.state) {
      throw new Error('State is required');
    }

    if (!discountData.discount_percent || discountData.discount_percent <= 0 || discountData.discount_percent > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    if (!discountData.valid_from) throw new Error('Start date is required');
    if (!discountData.valid_to) throw new Error('End date is required');

    const startDate = new Date(discountData.valid_from);
    const endDate = new Date(discountData.valid_to);

    if (isNaN(startDate.getTime())) throw new Error('Invalid start date format');
    if (isNaN(endDate.getTime())) throw new Error('Invalid end date format');
    if (endDate < startDate) throw new Error('End date must be after start date');

    return true;
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