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
 * @param {string} deliveryMethod - Delivery method ('address', 'pickup', or 'bus_park')
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
 * Fetches delivery fee for a specific state
 * @param {string} state - State name
 * @returns {Promise<number>} Delivery fee in Naira
 */
export const fetchDeliveryFeeForState = async (state) => {
  try {
    const response = await fetch(`${BASE_URL}/api/fetch-delivery-fee?state=${encodeURIComponent(state)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code === 200) {
      return result.delivery_fee;
    } else {
      throw new Error(result.message || 'Failed to fetch delivery fee');
    }
    
  } catch (error) {
    console.error('Error fetching delivery fee for state:', error);
    // Fallback to default delivery fee if API fails
    return 5000;
  }
};

/**
 * Fetches delivery fee for a specific LGA
 * @param {string} state - State name
 * @param {string} lga - LGA name
 * @returns {Promise<number>} Delivery fee in Naira
 */
export const fetchDeliveryFeeForLGA = async (state, lga) => {
  try {
    const response = await fetch(`${BASE_URL}/api/fetch-delivery-fee?state=${encodeURIComponent(state)}&lga=${encodeURIComponent(lga)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code === 200) {
      return result.delivery_fee;
    } else {
      // If LGA not found, fallback to state delivery fee
      return await fetchDeliveryFeeForState(state);
    }
    
  } catch (error) {
    console.error('Error fetching delivery fee for LGA:', error);
    // Fallback to state delivery fee if LGA API fails
    return await fetchDeliveryFeeForState(state);
  }
};

/**
 * Fetches bus park delivery fee
 * @returns {Promise<number>} Bus park delivery fee in Naira
 */
export const fetchBusParkDeliveryFee = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/fetch-bus-park-delivery-fee`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code === 200) {
      return result.delivery_fee;
    } else {
      throw new Error(result.message || 'Failed to fetch bus park delivery fee');
    }
    
  } catch (error) {
    console.error('Error fetching bus park delivery fee:', error);
    // Fallback to default bus park delivery fee
    return 2000;
  }
};

/**
 * Fetches all delivery fees (states based)
 * @returns {Promise<Array>} Array of delivery fees by state
 */
export const fetchAllDeliveryFees = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/fetch-delivery-fees`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code === 200) {
      return result.delivery_fees;
    } else {
      throw new Error(result.message || 'Failed to fetch delivery fees');
    }
    
  } catch (error) {
    console.error('Error fetching all delivery fees:', error);
    return [];
  }
};

/**
 * Fetches all LGA delivery fees for a state
 * @param {string} state - State name (optional)
 * @returns {Promise<Array>} Array of delivery fees by LGA
 */
export const fetchLGADeliveryFees = async (state = null) => {
  try {
    const url = state 
      ? `${BASE_URL}/api/fetch-lgas-delivery-fees?state=${encodeURIComponent(state)}`
      : `${BASE_URL}/api/fetch-lgas-delivery-fees`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.code === 200) {
      return result.delivery_fees;
    } else {
      throw new Error(result.message || 'Failed to fetch LGA delivery fees');
    }
    
  } catch (error) {
    console.error('Error fetching LGA delivery fees:', error);
    return [];
  }
};

/**
 * Calculates shipping cost based on delivery method and location
 * @param {string} deliveryMethod - Delivery method ('address', 'pickup', or 'bus_park')
 * @param {string} state - State name (required for address delivery)
 * @param {string} lga - LGA name (optional for more specific pricing)
 * @returns {Promise<number>} Shipping cost in Naira
 */
export const calculateShipping = async (deliveryMethod, state = null, lga = null) => {
  try {
    switch (deliveryMethod) {
      case 'pickup':
        return 0;
        
      case 'bus_park':
        return await fetchBusParkDeliveryFee();
        
      case 'address':
        if (!state) {
          throw new Error('State is required for address delivery');
        }
        
        // If LGA is provided, try to get LGA-specific fee, otherwise use state fee
        if (lga) {
          return await fetchDeliveryFeeForLGA(state, lga);
        } else {
          return await fetchDeliveryFeeForState(state);
        }
        
      default:
        throw new Error('Invalid delivery method');
    }
  } catch (error) {
    console.error('Error calculating shipping:', error);
    // Fallback to default fees based on delivery method
    switch (deliveryMethod) {
      case 'pickup':
        return 0;
      case 'bus_park':
        return 2000;
      case 'address':
        return 5000;
      default:
        return 5000;
    }
  }
};

/**
 * Initiates checkout process with the API
 * @param {Object} formData - Customer form data
 * @param {string} deliveryMethod - Delivery method ('address', 'pickup', or 'bus_park')
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
      address: deliveryMethod === 'address' ? formData.street_address : 
               deliveryMethod === 'bus_park' ? 'Bus Park Delivery' : 'Store Pickup',
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
 * Generates success redirect URL
 * @returns {string} Success redirect URL
 */
export const getSuccessRedirectUrl = () => {
  return `${window.location.origin}/checkout/checkout-success`;
};

/**
 * Utility function to get delivery method display name
 * @param {string} deliveryMethod - Delivery method code
 * @returns {string} Display name for delivery method
 */
export const getDeliveryMethodDisplayName = (deliveryMethod) => {
  switch (deliveryMethod) {
    case 'pickup':
      return 'Store Pickup';
    case 'bus_park':
      return 'Bus Park Delivery';
    case 'address':
      return 'Home Delivery';
    default:
      return 'Unknown';
  }
};