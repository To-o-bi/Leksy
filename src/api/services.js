import api from './axios.js';
import { ENDPOINTS, CATEGORIES } from './config.js';
import { validateForm, validators } from './validation.js';

export const authService = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    // Use GET request with query parameters as per API doc
    const response = await api.get(ENDPOINTS.ADMIN_LOGIN, { username, password });
    
    if (response.data?.code === 200) {
      if (response.data.token) api.setToken(response.data.token);
      if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    
    throw new Error(response.data?.message || 'Login failed');
  },

  async logout() {
    try {
      await api.post(ENDPOINTS.ADMIN_LOGOUT);
    } finally {
      api.clearAuth();
      localStorage.removeItem('user');
    }
  },

  clearAuth() {
    api.clearAuth();
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!api.getToken() && !!localStorage.getItem('user');
  },

  getAuthUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      localStorage.removeItem('user');
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
    const response = await api.get(ENDPOINTS.FETCH_PRODUCT, { product_id: productId });
    return response.data;
  },

  async addProduct(productData) {
    if (!productData.name?.trim()) throw new Error('Product name is required');
    if (!productData.price || parseFloat(productData.price) <= 0) throw new Error('Valid price is required');
    if (!productData.description?.trim()) throw new Error('Description is required');
    if (!productData.quantity || parseInt(productData.quantity) < 0) throw new Error('Valid quantity is required');
    if (!productData.category || !CATEGORIES.includes(productData.category)) throw new Error('Valid category is required');

    // Use GET request with query parameters as per API doc
    const params = {
      name: productData.name,
      price: productData.price,
      description: productData.description,
      quantity: productData.quantity,
      category: productData.category
    };

    if (productData.slashed_price) params.slashed_price = productData.slashed_price;

    // Handle images separately if provided
    if (productData.images?.length) {
      productData.images.forEach(image => {
        if (!image.type?.startsWith('image/')) throw new Error('Only image files allowed');
        if (image.size > 2 * 1024 * 1024) throw new Error('Image must be less than 2MB');
      });
      
      // For images, we need to use FormData with POST
      const formData = new FormData();
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
      });
      productData.images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await api.postFormData(ENDPOINTS.ADD_PRODUCT, formData);
      return response.data;
    }

    // If no images, use GET with query parameters
    const response = await api.get(ENDPOINTS.ADD_PRODUCT, params);
    return response.data;
  },

  async updateProduct(productId, productData) {
    const params = { product_id: productId };
    
    // Add only the fields that are being updated
    Object.entries(productData).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined) {
        params[key] = value;
      }
    });

    // Handle images separately if provided
    if (productData.images?.length) {
      const formData = new FormData();
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      productData.images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await api.postFormData(ENDPOINTS.UPDATE_PRODUCT, formData);
      return response.data;
    }

    // If no images, use GET with query parameters
    const response = await api.get(ENDPOINTS.UPDATE_PRODUCT, params);
    return response.data;
  },

  async deleteProduct(productId) {
    // Use GET request with query parameters as per API doc
    const response = await api.get(ENDPOINTS.DELETE_PRODUCT, { product_id: productId });
    return response.data;
  }
};

export const contactService = {
  async submit(contactData) {
    if (!contactData.name?.trim()) throw new Error('Name is required');
    if (!contactData.email?.trim()) throw new Error('Email is required');
    if (!contactData.phone?.trim()) throw new Error('Phone is required');
    if (!contactData.subject?.trim()) throw new Error('Subject is required');
    if (!contactData.message?.trim()) throw new Error('Message is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) throw new Error('Invalid email format');

    // Use POST request with query parameters as per API doc
    const params = {
      name: contactData.name.trim(),
      email: contactData.email.trim(),
      phone: contactData.phone.trim(),
      subject: contactData.subject.trim(),
      message: contactData.message.trim()
    };

    const response = await api.post(ENDPOINTS.SUBMIT_CONTACT, null, { params });
    return response.data;
  },

  async fetchSubmissions(filters = {}) {
    try {
      const response = await api.get(ENDPOINTS.FETCH_CONTACT_SUBMISSIONS, filters);
      return response.data || response;
    } catch (error) {
      console.error('Contact fetch error:', error);
      throw error;
    }
  }
};

export const orderService = {
  async initiateCheckout(checkoutData) {
    if (!checkoutData.phone?.trim()) throw new Error('Phone is required');
    if (!checkoutData.delivery_method) throw new Error('Delivery method is required');
    if (!['pickup', 'address'].includes(checkoutData.delivery_method)) throw new Error('Invalid delivery method');
    if (!checkoutData.cart?.length) throw new Error('Cart cannot be empty');

    if (checkoutData.delivery_method === 'address') {
      if (!checkoutData.state?.trim()) throw new Error('State is required');
      if (!checkoutData.city?.trim()) throw new Error('City is required');
      if (!checkoutData.street_address?.trim()) throw new Error('Street address is required');
    }

    // API expects name and email as well according to the documentation
    const params = {
      name: checkoutData.name || '',
      email: checkoutData.email || '',
      phone: checkoutData.phone,
      delivery_method: checkoutData.delivery_method,
      cart: JSON.stringify(checkoutData.cart)
    };

    if (checkoutData.delivery_method === 'address') {
      params.state = checkoutData.state;
      params.city = checkoutData.city;
      params.street_address = checkoutData.street_address;
    }

    if (checkoutData.success_redirect) {
      params.success_redirect = checkoutData.success_redirect;
    }

    // Use POST request as per API doc (checkout/initiate uses POST)
    const response = await api.post(ENDPOINTS.INITIATE_CHECKOUT, null, { params });
    return response.data;
  },

  async fetchOrders(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_ORDERS, filters);
    return response.data;
  },

  async fetchOrder(orderId) {
    // Add single order fetch endpoint
    const response = await api.get(ENDPOINTS.FETCH_ORDER, { order_id: orderId });
    return response.data;
  },

  async changeDeliveryStatus(orderId, newStatus) {
    const validStatuses = ['unpaid', 'order-received', 'packaged', 'in-transit', 'delivered'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid delivery status');

    // Use GET request with query parameters as per API doc
    const response = await api.get(ENDPOINTS.CHANGE_DELIVERY_STATUS, {
      order_id: orderId,
      new_delivery_status: newStatus
    });
    return response.data;
  }
};

// Add consultation service based on API documentation
export const consultationService = {
  async initiateConsultation(consultationData) {
    const requiredFields = ['name', 'email', 'phone', 'age_range', 'gender', 'skin_type', 'skin_concerns', 'channel', 'date', 'time_range'];
    
    for (const field of requiredFields) {
      if (!consultationData[field]) {
        throw new Error(`${field.replace('_', ' ')} is required`);
      }
    }

    const validChannels = ['video-channel', 'whatsapp'];
    const validTimeRanges = ['2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM'];
    
    if (!validChannels.includes(consultationData.channel)) {
      throw new Error('Invalid channel');
    }
    
    if (!validTimeRanges.includes(consultationData.time_range)) {
      throw new Error('Invalid time range');
    }

    const params = {
      name: consultationData.name,
      email: consultationData.email,
      phone: consultationData.phone,
      age_range: consultationData.age_range,
      gender: consultationData.gender,
      skin_type: consultationData.skin_type,
      skin_concerns: Array.isArray(consultationData.skin_concerns) 
        ? consultationData.skin_concerns.join(',') 
        : consultationData.skin_concerns,
      channel: consultationData.channel,
      date: consultationData.date,
      time_range: consultationData.time_range
    };

    if (consultationData.current_skincare_products) {
      params.current_skincare_products = consultationData.current_skincare_products;
    }
    
    if (consultationData.additional_details) {
      params.additional_details = consultationData.additional_details;
    }
    
    if (consultationData.success_redirect) {
      params.success_redirect = consultationData.success_redirect;
    }

    // Use POST request as per API doc
    const response = await api.post(ENDPOINTS.INITIATE_CONSULTATION, null, { params });
    return response.data;
  },

  async fetchBookedTimes(date = null) {
    const params = {};
    if (date) params.date = date;
    
    const response = await api.get(ENDPOINTS.FETCH_BOOKED_TIMES, params);
    return response.data;
  },

  async fetchConsultation(consultationId) {
    const response = await api.get(ENDPOINTS.FETCH_CONSULTATION, { consultation_id: consultationId });
    return response.data;
  },

  async fetchConsultations(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_CONSULTATIONS, filters);
    return response.data;
  }
};