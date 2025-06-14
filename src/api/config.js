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