// src/api/services.js
import api from './axios.js';
import { ENDPOINTS, CATEGORIES } from './config.js';
// import { validateForm, validators } from './validation.js';

export const authService = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/admin/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

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

    if (!productData.concern_options || productData.concern_options.length === 0) {
      throw new Error('At least one concern option is required');
    }

    if (productData.images?.length) {
      productData.images.forEach(image => {
        if (!image.type?.startsWith('image/')) throw new Error('Only image files allowed');
        if (image.size > 2 * 1024 * 1024) throw new Error('Image must be less than 2MB');
      });
    }

    const formData = new FormData();
    formData.append('name', productData.name.trim());
    formData.append('price', productData.price.toString());
    formData.append('description', productData.description.trim());
    formData.append('quantity', productData.quantity.toString());
    formData.append('category', productData.category);

    if (Array.isArray(productData.concern_options)) {
      formData.append('concern_options', productData.concern_options.join(','));
    } else {
      formData.append('concern_options', productData.concern_options.toString());
    }

    if (productData.slashed_price) {
      formData.append('slashed_price', productData.slashed_price.toString());
    }

    if (productData.images?.length) {
      productData.images.forEach(image => {
        formData.append('images[]', image);
      });
    }

    const response = await api.postFormData(ENDPOINTS.ADD_PRODUCT, formData);
    return response.data;
  },

  async updateProduct(productId, productData) {
    const params = { product_id: productId };

    Object.entries(productData).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'concern_options' && value !== undefined) {
        params[key] = value;
      }
    });

    if (productData.concern_options) {
      if (Array.isArray(productData.concern_options)) {
        params.concern_options = productData.concern_options.join(',');
      } else {
        params.concern_options = productData.concern_options.toString();
      }
    }

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

    const response = await api.get(ENDPOINTS.UPDATE_PRODUCT, params);
    return response.data;
  },

    async deleteProduct(productId) {
    try {
      // Try FormData approach (similar to login and other endpoints)
      const formData = new FormData();
      formData.append('product_id', productId);
      
      const response = await api.postFormData(ENDPOINTS.DELETE_PRODUCT, formData);
      
      // Log the response to debug
      console.log('Delete API response:', response);
      console.log('Response data:', response.data);
      
      // Return the full response data structure that your frontend expects
      return response.data || response;
    } catch (error) {
      console.error('Delete product API error:', error);
      // Re-throw the error so your frontend can handle it
      throw error;
    }
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
      console.log('Contact API response:', response);
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

    const response = await api.post(ENDPOINTS.INITIATE_CHECKOUT, null, { params });
    return response.data;
  },

  async fetchOrders(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_ORDERS, filters);
    return response.data;
  },

  async fetchOrder(orderId) {
    const response = await api.get(ENDPOINTS.FETCH_ORDER, { order_id: orderId });
    return response.data;
  },

  async changeDeliveryStatus(orderId, newStatus) {
    const validStatuses = ['unpaid', 'order-received', 'packaged', 'in-transit', 'delivered'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid delivery status');

    const response = await api.get(ENDPOINTS.CHANGE_DELIVERY_STATUS, {
      order_id: orderId,
      new_delivery_status: newStatus
    });
    return response.data;
  }
};

export const consultationService = {
  async initiateConsultation(consultationData) {
    console.log('🔍 Raw consultation data received:', consultationData);

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
      time_range: consultationData.time_range?.toString().trim(),
      success_redirect: consultationData.success_redirect || `${window.location.origin}/consultation/success`
    };

    let skinConcerns = consultationData.skin_concerns;
    if (Array.isArray(skinConcerns)) {
      cleanData.skin_concerns = skinConcerns.filter(c => !isEmpty(c)).join(',');
    } else {
      cleanData.skin_concerns = skinConcerns?.toString().trim();
    }

    if (!isEmpty(consultationData.current_skincare_products)) {
      cleanData.current_skincare_products = consultationData.current_skincare_products.toString().trim();
    }

    if (!isEmpty(consultationData.additional_details)) {
      cleanData.additional_details = consultationData.additional_details.toString().trim();
    }

    try {
      const queryString = new URLSearchParams(cleanData).toString();
      const url = `${ENDPOINTS.INITIATE_CONSULTATION}?${queryString}`;
      const response1 = await api.post(url);
      return response1.data;
    } catch (error1) {
      console.log('❌ APPROACH 1 FAILED:', error1.response?.data?.message || error1.message);
    }

    try {
      const response2 = await api.post(ENDPOINTS.INITIATE_CONSULTATION, cleanData);
      return response2.data;
    } catch (error2) {
      console.log('❌ APPROACH 2 FAILED:', error2.response?.data?.message || error2.message);
    }

    try {
      const formData = new FormData();
      Object.entries(cleanData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      const response3 = await api.postFormData(ENDPOINTS.INITIATE_CONSULTATION, formData);
      return response3.data;
    } catch (error3) {
      console.log('❌ APPROACH 3 FAILED:', error3.response?.data?.message || error3.message);
    }

    try {
      const response4 = await api.post(ENDPOINTS.INITIATE_CONSULTATION, null, { params: cleanData });
      return response4.data;
    } catch (error4) {
      console.log('❌ APPROACH 4 FAILED:', error4.response?.data?.message || error4.message);
    }

    try {
      const response5 = await api.get(ENDPOINTS.INITIATE_CONSULTATION, cleanData);
      return response5.data;
    } catch (error5) {
      console.log('❌ APPROACH 5 FAILED:', error5.response?.data?.message || error5.message);
    }

    throw new Error('All API request approaches failed. Check console for detailed error messages.');
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
