// src/api/config.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://leksycosmetics.com/api',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

export const ENDPOINTS = {
  ADMIN_LOGIN: '/admin/login',
  ADMIN_LOGOUT: '/admin/logout',
  ADD_PRODUCT: '/admin/add-product',
  UPDATE_PRODUCT: '/admin/update-product',
  DELETE_PRODUCT: '/admin/delete-product',
  FETCH_PRODUCT: '/fetch-product',
  FETCH_PRODUCTS: '/fetch-products',
  INITIATE_CHECKOUT: '/initiate-checkout',
  FETCH_ORDERS: '/admin/fetch-orders',
  CHANGE_DELIVERY_STATUS: '/admin/change-delivery-status',
  SUBMIT_CONTACT: '/submit-contact',
  FETCH_CONTACT_SUBMISSIONS: '/admin/fetch-contact-submissions',
};

export const CATEGORIES = ['serums', 'moisturizers', 'bathe and body', 'sunscreens', 'toners', 'face cleansers'];

// src/api/axios.js
import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from './config.js';

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Accept': 'application/json' }
    });
    
    this.requestQueue = new Map();
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        const isAdminRoute = config.url?.includes('/admin/') && !config.url?.includes('/admin/login');
        
        if (isAdminRoute && token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(this.formatError(error))
    );

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response) => {
        if (response.data?.token) {
          this.setToken(response.data.token);
        }
        return response;
      },
      async (error) => {
        const { config, response } = error;
        
        if (response?.status === 401) {
          this.clearAuth();
          window.location.href = '/login';
          return Promise.reject(this.formatError(error));
        }

        // Retry logic for network errors
        if (this.shouldRetry(error) && config && !config._retry) {
          config._retryCount = (config._retryCount || 0) + 1;
          
          if (config._retryCount <= API_CONFIG.MAX_RETRIES) {
            config._retry = true;
            await this.delay(API_CONFIG.RETRY_DELAY * config._retryCount);
            return this.client(config);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  shouldRetry(error) {
    return !error.response || 
           error.code === 'ECONNABORTED' || 
           (error.response.status >= 500 && error.response.status <= 599);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatError(error) {
    if (error.response?.data?.message) return new Error(error.response.data.message);
    if (error.code === 'ECONNABORTED') return new Error('Request timeout');
    if (!error.response) return new Error('Network error');
    return new Error('An error occurred');
  }

  // Request deduplication
  async request(config) {
    const key = this.getRequestKey(config);
    
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = this.client(config).finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  getRequestKey(config) {
    return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
  }

  // Secure token handling with cookies
  getToken() {
    const match = document.cookie.match(/auth=([^;]+)/);
    return match ? atob(match[1]) : null;
  }

  setToken(token) {
    const encoded = btoa(token);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(); // 24 hours
    document.cookie = `auth=${encoded}; path=/; expires=${expires}; SameSite=Strict; Secure`;
  }

  clearAuth() {
    document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('user');
  }

  // Core methods
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request({ method: 'get', url: fullUrl });
  }

  async post(url, data, config = {}) {
    return this.request({ method: 'post', url, data, ...config });
  }

  async postFormData(url, formData) {
    return this.request({ 
      method: 'post', 
      url, 
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
}

const api = new ApiClient();
export default api;

// src/api/validation.js
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim()),
  
  phone: (phone) => {
    const clean = phone?.replace(/\D/g, '') || '';
    return clean.length >= 10 && clean.length <= 15;
  },
  
  required: (value) => Boolean(value?.toString().trim()),
  
  minLength: (value, min) => value?.toString().trim().length >= min,
  
  maxLength: (value, max) => value?.toString().trim().length <= max,
  
  price: (price) => !isNaN(price) && parseFloat(price) > 0,
  
  image: (file) => {
    if (!file) return { valid: true };
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    return {
      valid: validTypes.includes(file.type) && file.size <= maxSize,
      error: !validTypes.includes(file.type) ? 'Invalid file type' : 
             file.size > maxSize ? 'File too large (max 2MB)' : null
    };
  }
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    
    for (const [rule, param] of Object.entries(fieldRules)) {
      if (rule === 'required' && param && !validators.required(value)) {
        errors[field] = `${field} is required`;
        break;
      }
      if (rule === 'email' && param && value && !validators.email(value)) {
        errors[field] = 'Invalid email format';
        break;
      }
      if (rule === 'phone' && param && value && !validators.phone(value)) {
        errors[field] = 'Invalid phone number';
        break;
      }
      if (rule === 'minLength' && value && !validators.minLength(value, param)) {
        errors[field] = `Minimum ${param} characters required`;
        break;
      }
    }
  });
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

// src/api/validation.js
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim()),
  
  phone: (phone) => {
    const clean = phone?.replace(/\D/g, '') || '';
    return clean.length >= 10 && clean.length <= 15;
  },
  
  required: (value) => Boolean(value?.toString().trim()),
  
  minLength: (value, min) => value?.toString().trim().length >= min,
  
  maxLength: (value, max) => value?.toString().trim().length <= max,
  
  price: (price) => !isNaN(price) && parseFloat(price) > 0,
  
  image: (file) => {
    if (!file) return { valid: true };
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    return {
      valid: validTypes.includes(file.type) && file.size <= maxSize,
      error: !validTypes.includes(file.type) ? 'Invalid file type' : 
             file.size > maxSize ? 'File too large (max 2MB)' : null
    };
  }
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    
    for (const [rule, param] of Object.entries(fieldRules)) {
      if (rule === 'required' && param && !validators.required(value)) {
        errors[field] = `${field} is required`;
        break;
      }
      if (rule === 'email' && param && value && !validators.email(value)) {
        errors[field] = 'Invalid email format';
        break;
      }
      if (rule === 'phone' && param && value && !validators.phone(value)) {
        errors[field] = 'Invalid phone number';
        break;
      }
      if (rule === 'minLength' && value && !validators.minLength(value, param)) {
        errors[field] = `Minimum ${param} characters required`;
        break;
      }
    }
  });
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

// src/api/services.js
import api from './axios.js';
import { ENDPOINTS, CATEGORIES } from './config.js';
import { validateForm, validators } from './validation.js';

export const authService = {
  async login(username, password) {
    const response = await api.get(ENDPOINTS.ADMIN_LOGIN, { username, password });
    if (response.data.code === 200) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error(response.data.message || 'Login failed');
  },

  async logout() {
    try {
      await api.post(ENDPOINTS.ADMIN_LOGOUT);
    } finally {
      api.clearAuth();
    }
  },

  isAuthenticated() {
    return Boolean(api.getToken() && localStorage.getItem('user'));
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
    const validation = validateForm(productData, {
      name: { required: true, minLength: 2 },
      price: { required: true },
      description: { required: true, minLength: 10 },
      quantity: { required: true },
      category: { required: true }
    });

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    if (!CATEGORIES.includes(productData.category)) {
      throw new Error('Invalid category');
    }

    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach(image => {
          const imageValidation = validators.image(image);
          if (!imageValidation.valid) {
            throw new Error(imageValidation.error);
          }
          formData.append('images', image);
        });
      } else if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

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
    const response = await api.post(ENDPOINTS.DELETE_PRODUCT, null, {
      params: { product_id: productId }
    });
    return response.data;
  }
};

export const contactService = {
  async submit(contactData) {
    const validation = validateForm(contactData, {
      name: { required: true, minLength: 2 },
      email: { required: true, email: true },
      phone: { required: true, phone: true },
      subject: { required: true, minLength: 5 },
      message: { required: true, minLength: 10 }
    });

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const formData = new FormData();
    Object.entries(contactData).forEach(([key, value]) => {
      formData.append(key, value.toString().trim());
    });

    const response = await api.postFormData(ENDPOINTS.SUBMIT_CONTACT, formData);
    return response.data;
  },

  async fetchSubmissions(filters = {}) {
    const response = await api.get(ENDPOINTS.FETCH_CONTACT_SUBMISSIONS, filters);
    return response.data;
  }
};

export const orderService = {
  async initiateCheckout(checkoutData) {
    const validation = validateForm(checkoutData, {
      phone: { required: true, phone: true },
      delivery_method: { required: true }
    });

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    if (checkoutData.delivery_method === 'address') {
      const addressValidation = validateForm(checkoutData, {
        state: { required: true },
        city: { required: true },
        street_address: { required: true }
      });

      if (!addressValidation.isValid) {
        throw new Error(`Address required: ${Object.values(addressValidation.errors).join(', ')}`);
      }
    }

    const params = { ...checkoutData };
    if (checkoutData.cart) {
      params.cart = JSON.stringify(checkoutData.cart);
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
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid delivery status');
    }

    const response = await api.get(ENDPOINTS.CHANGE_DELIVERY_STATUS, {
      order_id: orderId,
      new_delivery_status: newStatus
    });
    return response.data;
  }
};

// src/api/utils.js
export const formatPrice = (price, currency = '₦') => {
  const num = typeof price === 'number' ? price : parseFloat(price) || 0;
  return `${currency}${num.toLocaleString()}`;
};

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
};

export const getInitials = (name) => {
  return name?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';
};

export const sanitizeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// src/api/index.js
export { authService, productService, contactService, orderService } from './services.js';
export { formatPrice, formatDate, getInitials, sanitizeHtml, debounce } from './utils.js';
export { validators, validateForm } from './validation.js';
export { ENDPOINTS, CATEGORIES, API_CONFIG } from './config.js';
export { default as api } from './axios.js';