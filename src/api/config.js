// src/api/config.js 
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://leksycosmetics.com/api',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const ENDPOINTS = {
  // Authentication - from API docs
  ADMIN_LOGIN: '/admin/login',
  ADMIN_LOGOUT: '/admin/logout',
  
  // Products - from API docs
  ADD_PRODUCT: '/admin/add-product',
  UPDATE_PRODUCT: '/admin/update-product',
  DELETE_PRODUCT: '/admin/delete-product',
  FETCH_PRODUCT: '/fetch-product',
  FETCH_PRODUCTS: '/fetch-products',
  
  // Orders - CORRECTED based on API docs
  INITIATE_CHECKOUT: '/checkout/initiate',
  FETCH_ORDER: '/fetch-order',
  FETCH_ORDERS: '/fetch-orders',
  CHANGE_DELIVERY_STATUS: '/admin/change-delivery-status',
  
  // Contact - from API docs
  SUBMIT_CONTACT: '/submit-contact',
  FETCH_CONTACT_SUBMISSION: '/admin/fetch-contact-submission',
  FETCH_CONTACT_SUBMISSIONS: '/admin/fetch-contact-submissions',
  
  // Consultation - from API docs
  INITIATE_CONSULTATION: '/consultation/initiate',
  FETCH_BOOKED_TIMES: '/consultation/fetch-booked-times',
  FETCH_CONSULTATION: '/admin/fetch-consultation',
  FETCH_CONSULTATIONS: '/fetch-consultations',
  
  // Newsletter - from API docs
  ADD_NEWSLETTER_SUBSCRIBER: '/newsletter-subscribers/add',
  REMOVE_NEWSLETTER_SUBSCRIBER: '/newsletter-subscribers/remove',
  FETCH_NEWSLETTER_SUBSCRIBERS: '/admin/fetch-newsletter-subscribers',
  
  // Delivery - from API docs
  FETCH_DELIVERY_FEE: '/fetch-delivery-fee',
  FETCH_DELIVERY_FEES: '/fetch-delivery-fees',
  UPDATE_DELIVERY_FEES: '/admin/update-delivery-fees',

  // delivery discounts
  MANAGE_DELIVERY_DISCOUNT: '/admin/manage-delivery-discounts',
  
  // Product Discounts 
  MANAGE_DISCOUNTS: '/admin/manage-discounts'
};

// From API docs - valid categories
export const CATEGORIES = [
  'serums',
  'moisturizers', 
  'bathe and body',
  'sunscreens',
  'toners',
  'face cleansers'
];

// From API docs - valid order statuses
export const ORDER_STATUSES = [
  'successful',
  'unsuccessful',
  'flagged', 
  'all'
];

// From API docs - valid delivery statuses
export const DELIVERY_STATUSES = [
  'unpaid',
  'order-received',
  'packaged',
  'in-transit', 
  'delivered',
  'all'
];

// From API docs - valid consultation channels
export const CONSULTATION_CHANNELS = [
  'video-channel',
  'whatsapp'
];

// From API docs - valid time ranges
export const TIME_RANGES = [
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM', 
  '5:00 PM - 6:00 PM'
];

// Additional constants for forms
export const SKIN_TYPES = [
  'normal',
  'dry', 
  'oily',
  'combination',
  'sensitive'
];

export const AGE_RANGES = [
  '18 - 25',
  '26 - 35',
  '36 - 45', 
  '46 - 55',
  '56+'
];

export const GENDERS = [
  'male',
  'female',
  'other',
  'prefer-not-to-say'
];