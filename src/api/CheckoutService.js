
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
  
  // START: Added logic for additional_phone
  if (formData.additional_phone && formData.additional_phone.trim() !== '') {
    searchParams.append('additional_phone', formData.additional_phone);
  }
  // END: Added logic for additional_phone

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
  // Note: additional_phone is optional, so no validation is needed here.
  if (deliveryMethod === 'address') {
    if (!formData.state) errors.state = 'State is required';
    if (!formData.city) errors.city = 'City/LGA is required';
    if (!formData.street_address) errors.street_address = 'Street address is required';
  }
  if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms.';
  return errors;
};

export const fetchDeliveryFeeForState = async (state) => {
  try {
    const response = await fetch(`${BASE_URL}/api/fetch-delivery-fee?state=${encodeURIComponent(state)}`);
    const result = await response.json();
    if (result.code === 200) return result.delivery_fee;
    return 5000; // Fallback
  } catch (error) {
    return 5000; // Fallback
  }
};

export const fetchLGADeliveryFees = async (state) => {
  try {
    const response = await fetch(`${BASE_URL}/api/fetch-lgas-delivery-fees?state=${encodeURIComponent(state)}`);
    const result = await response.json();
    if (result.code === 200) return result.delivery_fees;
    return [];
  } catch (error) {
    return [];
  }
};

export const fetchBusParkDeliveryFee = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/fetch-bus-park-delivery-fee`);
    const result = await response.json();
    if (result.code === 200) return result.delivery_fee;
    return 2000; // Fallback
  } catch (error) {
    return 2000; // Fallback
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
