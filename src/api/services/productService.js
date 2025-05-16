// src/api/services/productService.js
import api from '../axios';

/**
 * Fetch all products with optional filters
 * @param {Object} filters - Optional filters (category, sort)
 * @returns {Promise<Array>} Array of products
 */
export const getAllProducts = async (filters = {}) => {
  try {
    // Construct URL with query parameters
    let url = '/fetch-products';
    const params = new URLSearchParams();
    
    // Add filters according to API documentation
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    if (filters.sort) {
      params.append('sort', filters.sort);
    }
    
    // API expects POST request with query parameters
    const response = await api.post(
      params.toString() ? `${url}?${params.toString()}` : url
    );
    
    if (response.data && response.data.code === 200) {
      return response.data.products || [];
    } else {
      console.error('Unexpected API response:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get a single product by ID
 * @param {string} productId - The product ID to fetch
 * @returns {Promise<Object>} Product object
 */
export const getProductById = async (productId) => {
  try {
    // API expects a POST request for fetch-product
    const response = await api.post(`/fetch-product?product_id=${productId}`);
    
    if (response.data && response.data.code === 200 && response.data.product) {
      return response.data.product;
    }
    
    throw new Error('Product not found');
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

/**
 * Login as admin
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Login response with token
 */
export const loginAdmin = async (username, password) => {
  try {
    const url = `/admin/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const response = await api.post(url);
    
    if (response.data.code === 200) {
      // Store auth token and user data
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Add a new product (Admin only)
 * @param {Object} productData - Product data to add
 * @returns {Promise<Object>} Response with product ID
 */
export const addProduct = async (productData) => {
  try {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, productData[key]);
      }
    });
    
    // Add images if present
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    const response = await api.post('/admin/add-product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to add product');
    }
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

/**
 * Update an existing product (Admin only)
 * @param {string} productId - ID of product to update
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Response with status
 */
export const updateProduct = async (productId, productData) => {
  try {
    const formData = new FormData();
    
    // Add product ID
    formData.append('product_id', productId);
    
    // Add other fields
    Object.keys(productData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, productData[key]);
      }
    });
    
    // Add images if present
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    const response = await api.post('/admin/edit-product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to update product');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product (Admin only)
 * @param {string} productId - ID of product to delete
 * @returns {Promise<Object>} Response with status
 */
export const deleteProduct = async (productId) => {
  try {
    const url = `/admin/delete-product?product_id=${encodeURIComponent(productId)}`;
    
    const response = await api.post(url);
    
    if (response.data.code === 200) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Get featured products
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise<Array>} Featured products array
 */
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const response = await api.post('/fetch-products');
    
    if (response.data && response.data.code === 200 && response.data.products) {
      // For now, just return the first few products as featured
      return response.data.products.slice(0, limit);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export default {
  getAllProducts,
  getProductById,
  loginAdmin,
  addProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts
};