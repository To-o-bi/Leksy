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
  FETCH_ORDER: '/fetch-order',
  INITIATE_CHECKOUT: '/checkout/initiate',
  FETCH_ORDERS: '/fetch-orders',
  CHANGE_DELIVERY_STATUS: '/admin/change-delivery-status',
  SUBMIT_CONTACT: '/submit-contact',
  FETCH_CONTACT_SUBMISSIONS: '/admin/fetch-contact-submissions',
  FETCH_CONTACT_SUBMISSION: '/admin/fetch-contact-submission',
  // Consultation endpoints
  INITIATE_CONSULTATION: '/consultation/initiate',
  FETCH_BOOKED_TIMES: '/consultation/fetch-booked-times',
  FETCH_CONSULTATION: '/admin/fetch-consultation',
  FETCH_CONSULTATIONS: '/fetch-consultations',
};

export const CATEGORIES = ['serums', 'moisturizers', 'bathe and body', 'sunscreens', 'toners', 'face cleansers'];