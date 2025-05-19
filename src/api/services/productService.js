// src/api/services/productService.js
import api from '../axios';

/**
 * Fetch all products with optional filtering
 * @param {Object} options - Query options
 * @param {string} options.category - Optional product category filter
 * @param {string} options.sort - Optional sorting parameter
 * @returns {Promise<Object>} Products response
 */
export const fetchProducts = async (options = {}) => {
  try {
    const response = await api.post('/fetch-products', null, { params: options });
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch products');
    }
  } catch (error) {
    console.error('Fetch products error:', error);
    throw new Error(
      error.response?.data?.message || 
      'Unable to load products. Please try again later.'
    );
  }
};

/**
 * Fetch a single product by ID
 * @param {string} productId - Product ID to fetch
 * @returns {Promise<Object>} Product data
 */
export const fetchProduct = async (productId) => {
  try {
    const response = await api.post('/fetch-product', null, {
      params: { product_id: productId }
    });
    
    if (response.data && response.data.code === 200) {
      return response.data.product;
    } else {
      throw new Error(response.data.message || 'Failed to fetch product');
    }
  } catch (error) {
    console.error('Fetch product error:', error);
    throw new Error(
      error.response?.data?.message || 
      'Unable to load product details. Please try again later.'
    );
  }
};

/**
 * Add a new product (Admin only)
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Response with product ID
 */
export const addProduct = async (productData) => {
  try {
    const response = await api.post('/admin/add-product', null, {
      params: productData
    });
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to add product');
    }
  } catch (error) {
    console.error('Add product error:', error);
    throw new Error(
      error.response?.data?.message || 
      'Unable to add product. Please try again later.'
    );
  }
};

/**
 * Edit an existing product (Admin only)
 * @param {string} productId - Product ID to edit
 * @param {Object} updates - Product data updates
 * @returns {Promise<Object>} Response with product ID
 */
export const editProduct = async (productId, updates) => {
  try {
    const response = await api.post('/admin/edit-product', null, {
      params: {
        product_id: productId,
        ...updates
      }
    });
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to update product');
    }
  } catch (error) {
    console.error('Edit product error:', error);
    throw new Error(
      error.response?.data?.message || 
      'Unable to update product. Please try again later.'
    );
  }
};

/**
 * Delete a product (Admin only)
 * @param {string} productId - Product ID to delete
 * @returns {Promise<Object>} Response with success message
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await api.post('/admin/delete-product', null, {
      params: { product_id: productId }
    });
    
    if (response.data && response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to delete product');
    }
  } catch (error) {
    console.error('Delete product error:', error);
    throw new Error(
      error.response?.data?.message || 
      'Unable to delete product. Please try again later.'
    );
  }
};

export default {
  fetchProducts,
  fetchProduct,
  addProduct,
  editProduct,
  deleteProduct
};