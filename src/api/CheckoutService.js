// services.js - API service functions for checkout

const BASE_URL = 'https://leksycosmetics.com';

/**
 * Formats price to Nigerian Naira currency format
 * @param {number} price - Price in kobo or naira
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return `₦${parseFloat(price).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Prepares cart data for API submission
 * @param {Array} cart - Cart items array
 * @returns {Array} Formatted cart data for API
 */
export const prepareCartForAPI = (cart) => {
  return cart.map(item => ({
    product_id: item.id,
    quantity: item.quantity
  }));
};

/**
 * Validates checkout form data
 * @param {Object} formData - Form data object
 * @param {string} deliveryMethod - Delivery method ('address' or 'pickup')
 * @returns {Object} Validation errors object
 */
export const validateCheckoutForm = (formData, deliveryMethod) => {
  const errors = {};
  
  if (!formData.name.trim()) errors.name = 'Name is required';
  if (!formData.email.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
  if (!formData.phone.trim()) errors.phone = 'Phone number is required';
  
  if (deliveryMethod === 'address') {
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.street_address.trim()) errors.street_address = 'Street address is required';
  }
  
  if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms and conditions';
  
  return errors;
};

/**
 * Initiates checkout process with the API
 * @param {Object} formData - Customer form data
 * @param {string} deliveryMethod - Delivery method ('address' or 'pickup')
 * @param {Array} cart - Cart items
 * @param {string} successRedirectUrl - URL to redirect after successful payment
 * @returns {Promise<Object>} API response
 */
export const initiateCheckout = async (formData, deliveryMethod, cart, successRedirectUrl) => {
  try {
    // Prepare cart data according to API specification
    const cartData = prepareCartForAPI(cart);
    
    // Prepare form data - include required fields based on delivery method
    const requestData = new FormData();
    requestData.append('name', formData.name.trim());
    requestData.append('email', formData.email.trim());
    requestData.append('phone', formData.phone.trim());
    requestData.append('delivery_method', deliveryMethod);
    requestData.append('cart', JSON.stringify(cartData));
    requestData.append('success_redirect', successRedirectUrl);
    
    // ONLY include address fields for delivery orders
    if (deliveryMethod === 'address') {
      requestData.append('state', formData.state.trim());
      requestData.append('city', formData.city.trim());
      requestData.append('street_address', formData.street_address.trim());
    }
    // For pickup orders: DO NOT send any address fields
    
    // Add notes if provided
    if (formData.notes && formData.notes.trim()) {
      requestData.append('notes', formData.notes.trim());
    }

    // Build API URL
    const apiUrl = `${BASE_URL}/api/checkout/initiate`;
    
    // Build debug object for logging
    const debugData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      delivery_method: deliveryMethod,
      cart: JSON.stringify(cartData),
      success_redirect: successRedirectUrl,
      notes: formData.notes?.trim() || ''
    };
    
    // Only add address fields to debug log if it's a delivery order
    if (deliveryMethod === 'address') {
      debugData.state = formData.state.trim();
      debugData.city = formData.city.trim();
      debugData.street_address = formData.street_address.trim();
    }
    
    // Log request details for debugging
    console.log('Initiating checkout with URL:', apiUrl);
    console.log('Request data:', debugData);

    // Make API request using FormData in body
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: requestData, // Send as form data in body
      // Note: Don't set Content-Type header when using FormData - browser sets it automatically
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    return result;
    
  } catch (error) {
    console.error('Checkout initiation error:', error);
    throw error;
  }
};

/**
 * Alternative implementation using URLSearchParams for form-encoded data
 * Use this if the API specifically expects application/x-www-form-urlencoded
 */
export const initiateCheckoutAlternative = async (formData, deliveryMethod, cart, successRedirectUrl) => {
  try {
    const cartData = prepareCartForAPI(cart);
    
    // Use URLSearchParams for proper form encoding
    const requestData = new URLSearchParams();
    requestData.append('name', formData.name.trim());
    requestData.append('email', formData.email.trim());
    requestData.append('phone', formData.phone.trim());
    requestData.append('delivery_method', deliveryMethod);
    requestData.append('cart', JSON.stringify(cartData));
    requestData.append('success_redirect', successRedirectUrl);
    
    // ONLY include address fields for delivery orders
    if (deliveryMethod === 'address') {
      requestData.append('state', formData.state.trim());
      requestData.append('city', formData.city.trim());
      requestData.append('street_address', formData.street_address.trim());
    }
    // For pickup orders: DO NOT send any address fields
    
    if (formData.notes && formData.notes.trim()) {
      requestData.append('notes', formData.notes.trim());
    }

    const apiUrl = `${BASE_URL}/api/checkout/initiate`;
    
    console.log('Initiating checkout with URL:', apiUrl);
    console.log('Request body:', requestData.toString());

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestData.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    return result;
    
  } catch (error) {
    console.error('Checkout initiation error:', error);
    throw error;
  }
};

/**
 * Stores order details in memory for success page
 * @param {Object} formData - Customer form data
 * @param {string} deliveryMethod - Delivery method
 * @param {Array} cart - Cart items
 * @param {number} totalPrice - Total price before shipping
 * @param {number} shipping - Shipping cost
 * @param {number} finalTotal - Final total including shipping
 */
export const storeOrderDetails = (formData, deliveryMethod, cart, totalPrice, shipping, finalTotal) => {
  window.pendingOrderDetails = {
    customerInfo: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    },
    deliveryInfo: {
      method: deliveryMethod,
      address: deliveryMethod === 'address' ? formData.street_address : 'Store Pickup',
      city: deliveryMethod === 'address' ? formData.city : 'N/A',
      state: deliveryMethod === 'address' ? formData.state : 'N/A'
    },
    orderSummary: {
      items: cart,
      subtotal: totalPrice,
      shipping: shipping,
      total: finalTotal
    },
    notes: formData.notes || ''
  };
};

/**
 * Nigerian states list for form dropdown
 */
export const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

/**
 * Calculates shipping cost based on delivery method
 * @param {string} deliveryMethod - Delivery method ('address' or 'pickup')
 * @returns {number} Shipping cost in Naira
 */
export const calculateShipping = (deliveryMethod) => {
  return deliveryMethod === 'pickup' ? 0 : 5000; // Fixed shipping cost
};

/**
 * Generates success redirect URL
 * @returns {string} Success redirect URL
 */
export const getSuccessRedirectUrl = () => {
  return `${window.location.origin}/checkout/checkout-success`;
};