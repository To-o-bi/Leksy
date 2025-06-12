// src/api/services/productService.js - Complete corrected version
import api from './axios';

/**
 * Fetch a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product data
 */
export const fetchProduct = async (productId) => {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  try {
    const response = await api.get(`/fetch-product?product_id=${productId}`);
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch product');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Fetch multiple products with optional filters
 * @param {Object} options - Query options
 * @param {string[]} options.categories - Array of categories to filter by
 * @param {string[]} options.productIds - Array of specific product IDs to fetch
 * @param {string} options.sort - Sort by field (name, price, category)
 * @returns {Promise<Object>} Products data
 */
export const fetchProducts = async (options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add category filter if provided
    if (options.categories && options.categories.length > 0) {
      queryParams.append('filter', options.categories.join(','));
    }
    
    // Add specific product IDs if provided
    if (options.productIds && options.productIds.length > 0) {
      queryParams.append('products_ids_array', options.productIds.join(','));
    }
    
    // Add sorting if provided
    if (options.sort) {
      queryParams.append('sort', options.sort);
    }
    
    const queryString = queryParams.toString();
    const url = `/fetch-products${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to fetch products');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Add a new product (Admin only)
 * @param {Object} productData - Product information
 * @param {string} productData.name - Product name
 * @param {number} productData.price - Product price
 * @param {number} productData.slashed_price - Original price (optional)
 * @param {string} productData.description - Product description
 * @param {number} productData.quantity - Available quantity
 * @param {string} productData.category - Product category
 * @param {File[]} productData.images - Product images (max 2MB each)
 * @returns {Promise<Object>} Add product response
 */
export const addProduct = async (productData) => {
  const { name, price, slashed_price, description, quantity, category, images } = productData;
  
  if (!name || !price || !description || !quantity || !category) {
    throw new Error('All required fields must be provided');
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price.toString());
    if (slashed_price) formData.append('slashed_price', slashed_price.toString());
    formData.append('description', description);
    formData.append('quantity', quantity.toString());
    formData.append('category', category);
    
    // Add images if provided (backend expects images[] field name)
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images[]', image);
      });
    }
    
    const response = await api.post('/admin/add-product', formData);
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to add product');
    }
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

/**
 * Update an existing product (Admin only)
 * @param {string} productId - Product ID to update
 * @param {Object} productData - Updated product information (all fields optional)
 * @returns {Promise<Object>} Update product response
 */
export const updateProduct = async (productId, productData) => {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  try {
    const formData = new FormData();
    formData.append('product_id', productId);
    
    // Add only provided fields
    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined && productData[key] !== null) {
        if (key === 'images' && Array.isArray(productData[key])) {
          // Handle multiple images with correct field name
          productData[key].forEach((image) => {
            formData.append('images[]', image);
          });
        } else {
          formData.append(key, productData[key].toString());
        }
      }
    });
    
    const response = await api.post('/admin/update-product', formData);
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to update product');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product (Admin only)
 * @param {string} productId - Product ID to delete
 * @returns {Promise<Object>} Delete product response
 */
export const deleteProduct = async (productId) => {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  try {
    const formData = new FormData();
    formData.append('product_id', productId);
    
    const response = await api.post('/admin/delete-product', formData);
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Get all available product categories
 * This is a helper function to maintain consistency with your backend categories
 */
export const getProductCategories = () => {
  return [
    'serums',
    'moisturizers', 
    'bathe and body',
    'sunscreens',
    'toners',
    'face cleansers'
  ];
};

/**
 * Initiate checkout process
 * @param {Object} checkoutData - Checkout information
 * @param {string} checkoutData.phone - Customer phone number
 * @param {string} checkoutData.delivery_method - 'pickup' or 'address'
 * @param {string} checkoutData.state - Customer state (if delivery_method is 'address')
 * @param {string} checkoutData.city - Customer city (if delivery_method is 'address')
 * @param {string} checkoutData.street_address - Customer address (if delivery_method is 'address')
 * @param {Array} checkoutData.cart - Array of cart items with product_id and quantity
 * @returns {Promise<Object>} Checkout initiation response
 */
export const initiateCheckout = async (checkoutData) => {
  const { phone, delivery_method, state, city, street_address, cart } = checkoutData;
  
  if (!phone || !delivery_method || !cart || cart.length === 0) {
    throw new Error('Phone, delivery method, and cart are required');
  }
  
  if (delivery_method === 'address' && (!state || !city || !street_address)) {
    throw new Error('State, city, and street address are required for address delivery');
  }

  try {
    const queryParams = new URLSearchParams();
    queryParams.append('phone', phone);
    queryParams.append('delivery_method', delivery_method);
    
    if (delivery_method === 'address') {
      queryParams.append('state', state);
      queryParams.append('city', city);
      queryParams.append('street_address', street_address);
    }
    
    // Encode cart as JSON string
    queryParams.append('cart', JSON.stringify(cart));
    
    const response = await api.get(`/initiate-checkout?${queryParams.toString()}`);
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to initiate checkout');
    }
  } catch (error) {
    console.error('Error initiating checkout:', error);
    throw error;
  }
};

export default {
  fetchProduct,
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  initiateCheckout
};