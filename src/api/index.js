// src/api/index.js - Updated to match backend API exactly
import authService from './services/authService';
import productService from './services/productService';

// Export services for easy import throughout the app
export {
  authService,
  productService
};

// Export axios instance
export { default as api } from './axios';

// API endpoint constants matching your backend exactly
export const ENDPOINTS = {
  // Admin Authentication endpoints
  ADMIN_LOGIN: '/admin/login',
  ADMIN_LOGOUT: '/admin/logout',
  
  // Product management endpoints (Admin)
  ADD_PRODUCT: '/admin/add-product',
  UPDATE_PRODUCT: '/admin/update-product',
  DELETE_PRODUCT: '/admin/delete-product',
  
  // Product fetching endpoints (Public)
  FETCH_PRODUCT: '/fetch-product',
  FETCH_PRODUCTS: '/fetch-products',
  
  // Order endpoints
  INITIATE_CHECKOUT: '/initiate-checkout',
  
  // Other endpoints
  CONTACT: '/contact'
};

// API response codes from your backend
export const RESPONSE_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PRECONDITION_FAILED: 412,
  SERVER_ERROR: 500
};

// Product categories as defined in your backend
export const PRODUCT_CATEGORIES = [
  'serums',
  'moisturizers',
  'bathe and body',
  'sunscreens', 
  'toners',
  'face cleansers'
];

// Delivery methods for checkout
export const DELIVERY_METHODS = {
  PICKUP: 'pickup',
  ADDRESS: 'address'
};

// Helper functions for API usage
export const API_HELPERS = {
  /**
   * Build query string for fetch-products endpoint
   * @param {Object} options - Query options
   * @returns {string} Query string
   */
  buildProductsQuery: (options = {}) => {
    const params = new URLSearchParams();
    
    if (options.categories?.length > 0) {
      params.append('filter', options.categories.join(','));
    }
    
    if (options.productIds?.length > 0) {
      params.append('products_ids_array', options.productIds.join(','));
    }
    
    if (options.sort) {
      params.append('sort', options.sort);
    }
    
    return params.toString();
  },

  /**
   * Check if response is successful based on your backend format
   * @param {Object} response - API response
   * @returns {boolean} Is successful
   */
  isSuccessResponse: (response) => {
    return response?.data?.code === RESPONSE_CODES.SUCCESS;
  },

  /**
   * Extract error message from API response
   * @param {Object} error - Error object
   * @returns {string} Error message
   */
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return error.message || 'An unexpected error occurred';
  },

  /**
   * Create FormData for product operations
   * @param {Object} productData - Product data
   * @returns {FormData} FormData object
   */
  createProductFormData: (productData) => {
    const formData = new FormData();
    
    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined && productData[key] !== null) {
        if (key === 'images' && Array.isArray(productData[key])) {
          productData[key].forEach(image => {
            formData.append('images[]', image); // Use images[] for backend compatibility
          });
        } else {
          formData.append(key, productData[key].toString());
        }
      }
    });
    
    return formData;
  }
};

// Export everything as default for convenience
export default {
  authService,
  productService,
  ENDPOINTS,
  RESPONSE_CODES,
  PRODUCT_CATEGORIES,
  DELIVERY_METHODS,
  API_HELPERS
};