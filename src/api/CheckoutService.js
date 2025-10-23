// src/api/CheckoutService.js

const BASE_URL = 'https://leksycosmetics.com';

/**
 * Prepares cart data for API submission, ensuring correct keys.
 * @param {Array} cart - The cart items array from useCart hook.
 * @returns {Array} Formatted cart data for the API.
 */
export const prepareCartForAPI = (cart) => {
  return cart.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
  }));
};

/**
 * Calculates total price from cart items
 * @param {Array} cart - The cart items
 * @returns {number} Total price
 */
const calculateTotalPrice = (cart) => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

/**
 * Initiates the checkout process using URLSearchParams.
 * @param {Object} formData - Customer form data.
 * @param {string} deliveryMethod - The selected delivery method.
 * @param {Array} cart - The original cart items.
 * @param {string} successRedirectUrl - The URL for successful payment.
 * @returns {Promise<Object>} API response.
 */
export const initiateCheckout = async (formData, deliveryMethod, cart, successRedirectUrl) => {
  const cartForAPI = prepareCartForAPI(cart);
  
  const searchParams = new URLSearchParams();
  searchParams.append('name', formData.name);
  searchParams.append('email', formData.email);
  searchParams.append('phone', formData.phone);
  
  if (formData.additional_phone && formData.additional_phone.trim() !== '') {
    searchParams.append('additional_phone', formData.additional_phone);
  }
  
  if (formData.notes && formData.notes.trim() !== '') {
    searchParams.append('additional_details', formData.notes);
  }

  searchParams.append('delivery_method', deliveryMethod);
  searchParams.append('cart', JSON.stringify(cartForAPI));
  searchParams.append('success_redirect', successRedirectUrl);

  if (deliveryMethod === 'address') {
    searchParams.append('state', formData.state);
    searchParams.append('city', formData.city);
    searchParams.append('street_address', formData.street_address);
    if (formData.state === 'Lagos' && formData.city) {
      searchParams.append('lga', formData.city);
    }
  } else if (deliveryMethod === 'bus-park') {
    searchParams.append('state', formData.state);
    searchParams.append('city', formData.city);
  }

  const response = await fetch(`${BASE_URL}/api/checkout/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: searchParams.toString(),
  });

  const result = await response.json();
  
  if (response.ok && result.code === 200) {
    return result;
  }
  
  throw new Error(result.message || 'Checkout failed');
};

export const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return '₦0.00';
  return `₦${numericPrice.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const validateCheckoutForm = (formData, deliveryMethod) => {
  const errors = {};
  if (!formData.name.trim()) errors.name = 'Name is required';
  if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
  if (!formData.phone.trim()) errors.phone = 'Phone number is required';
  
  if (deliveryMethod === 'address') {
    if (!formData.state) errors.state = 'State is required';
    if (!formData.city) errors.city = 'City/LGA is required';
    if (!formData.street_address) errors.street_address = 'Street address is required';
  }
  
  if (deliveryMethod === 'bus-park') {
    if (!formData.state) errors.state = 'State is required';
    if (!formData.city) errors.city = 'City/LGA is required';
  }
  
  if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms.';
  return errors;
};

/**
 * Fetches delivery fee for a single state with discount already calculated
 * @param {string} state - State name
 * @param {number} totalPrice - Current cart total for discount calculation
 * @returns {Promise<Object>} Fee object with delivery_fee, original_delivery_fee, discount_percent
 */
export const fetchDeliveryFeeForState = async (state, totalPrice = 0) => {
  try {
    const url = `${BASE_URL}/api/fetch-delivery-fee?state=${encodeURIComponent(state)}&total_price_of_current_purchase=${totalPrice}`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    
    if (result.code === 200) {
      return {
        delivery_fee: parseFloat(result.delivery_fee) || 0,
        original_delivery_fee: parseFloat(result.original_delivery_fee) || parseFloat(result.delivery_fee) || 0,
        discount_percent: parseFloat(result.discount_percent) || 0
      };
    }
    
    // Fallback if state not found
    return { delivery_fee: 0, original_delivery_fee: 0, discount_percent: 0 };
  } catch (error) {
    return { delivery_fee: 0, original_delivery_fee: 0, discount_percent: 0 };
  }
};

/**
 * Fetches LGA delivery fees for Lagos state with discounts already calculated
 * @param {string} state - State name (should be 'Lagos')
 * @param {number} totalPrice - Current cart total for discount calculation
 * @returns {Promise<Array>} Array of LGA objects with fee info
 */
export const fetchLGADeliveryFees = async (state, totalPrice = 0) => {
  try {
    const url = `${BASE_URL}/api/fetch-lgas-delivery-fees?state=${encodeURIComponent(state)}&total_price_of_current_purchase=${totalPrice}`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    
    if (result.code === 200 && result.delivery_fees) {
      return result.delivery_fees.map(fee => ({
        lga: fee.lga,
        state: fee.state,
        delivery_fee: parseFloat(fee.delivery_fee) || 0,
        original_delivery_fee: parseFloat(fee.original_delivery_fee) || parseFloat(fee.delivery_fee) || 0,
        discount_percent: parseFloat(fee.discount_percent) || 0
      }));
    }
    
    return [];
  } catch (error) {
    return [];
  }
};

/**
 * Fetches delivery fee for a specific LGA with discount already calculated
 * @param {string} lga - LGA name
 * @param {number} totalPrice - Current cart total for discount calculation
 * @returns {Promise<Object>} Fee object with delivery_fee, original_delivery_fee, discount_percent
 */
export const fetchDeliveryFeeForLGA = async (lga, totalPrice = 0) => {
  try {
    const url = `${BASE_URL}/api/fetch-delivery-fee?lga=${encodeURIComponent(lga)}&total_price_of_current_purchase=${totalPrice}`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    
    if (result.code === 200) {
      return {
        delivery_fee: parseFloat(result.delivery_fee) || 0,
        original_delivery_fee: parseFloat(result.original_delivery_fee) || parseFloat(result.delivery_fee) || 0,
        discount_percent: parseFloat(result.discount_percent) || 0
      };
    }
    
    return { delivery_fee: 0, original_delivery_fee: 0, discount_percent: 0 };
  } catch (error) {
    return { delivery_fee: 0, original_delivery_fee: 0, discount_percent: 0 };
  }
};

/**
 * Fetches bus park delivery fee with discount already calculated
 * @param {number} totalPrice - Current cart total for discount calculation
 * @returns {Promise<Object>} Fee object with delivery_fee, original_delivery_fee, discount_percent
 */
export const fetchBusParkDeliveryFee = async (totalPrice = 0) => {
  try {
    const url = `${BASE_URL}/api/fetch-bus-park-delivery-fee?total_price_of_current_purchase=${totalPrice}`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    
    if (result.code === 200) {
      return {
        delivery_fee: parseFloat(result.delivery_fee) || 0,
        original_delivery_fee: parseFloat(result.original_delivery_fee) || parseFloat(result.delivery_fee) || 0,
        discount_percent: parseFloat(result.discount_percent) || 0
      };
    }
    
    // Fallback
    return { delivery_fee: 2000, original_delivery_fee: 2000, discount_percent: 0 };
  } catch (error) {
    return { delivery_fee: 2000, original_delivery_fee: 2000, discount_percent: 0 };
  }
};

export const getSuccessRedirectUrl = () => `${window.location.origin}/checkout/checkout-success`;

export const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];