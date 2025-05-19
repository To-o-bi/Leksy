import authService from './services/authService';
import productService from './services/productService';

// Combine all service exports for easy import
export {
  authService,
  productService
};

// Export API endpoint constants for consistent usage across the app
export const ENDPOINTS = {

  // Auth endpoints
  LOGIN: '/admin/login',
  
  // Product endpoints
  FETCH_PRODUCTS: '/fetch-products',

  FETCH_PRODUCT: '/fetch-product',

  ADD_PRODUCT: '/admin/add-product',

  EDIT_PRODUCT: '/admin/edit-product',

  DELETE_PRODUCT: '/admin/delete-product',
  
  // User endpoints
  USER_PROFILE: '/user/profile',

  CONTACT: '/contact',

};