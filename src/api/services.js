import api from './axios.js';
import { ENDPOINTS, CATEGORIES } from './config.js';

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

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('price', productData.price);
    formData.append('description', productData.description);
    formData.append('quantity', productData.quantity);
    formData.append('category', productData.category);

    if (productData.slashed_price) formData.append('slashed_price', productData.slashed_price);

    if (productData.images?.length) {
      productData.images.forEach(image => {
        if (!image.type?.startsWith('image/')) throw new Error('Only image files allowed');
        if (image.size > 2 * 1024 * 1024) throw new Error('Image must be less than 2MB');
        formData.append('images', image);
      });
    }

    const response = await api.postFormData(ENDPOINTS.ADD_PRODUCT, formData);
    return response.data;
  },

  async updateProduct(productId, productData) {
    const formData = new FormData();
    formData.append('product_id', productId);
    
    Object.entries(productData).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach(image => formData.append('images', image));
      } else if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.postFormData(ENDPOINTS.UPDATE_PRODUCT, formData);
    return response.data;
  },

  async deleteProduct(productId) {
    const formData = new FormData();
    formData.append('product_id', productId);
    const response = await api.postFormData(ENDPOINTS.DELETE_PRODUCT, formData);
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
      phone: checkoutData.phone,
      delivery_method: checkoutData.delivery_method,
      cart: JSON.stringify(checkoutData.cart)
    };

    if (checkoutData.delivery_method === 'address') {
      params.state = checkoutData.state;
      params.city = checkoutData.city;
      params.street_address = checkoutData.street_address;
    }

    const response = await api.get(ENDPOINTS.INITIATE_CHECKOUT, params);
    return response.data;
  },

  async fetchOrders(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_ORDERS, filters);
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