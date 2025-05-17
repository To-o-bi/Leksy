import api from '../axios';

/**
 * Fetch all products with optional filtering
 * @param {Object} filters - Optional filters (category, sort)
 * @returns {Promise<Array>} Array of products
 */
export const getAllProducts = async (filters = {}) => {
  try {
    // Construct URL with query parameters according to the documentation
    let url = '/fetch-products';
    const params = new URLSearchParams();
    
    // Add category filter if specified
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    // Add sorting if specified
    if (filters.sort) {
      params.append('sort', filters.sort);
    }
    
    // Add query parameters to URL if any exist
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    // The API expects a POST request
    const response = await api.post(url);
    
    // Check for success response
    if (response.data && response.data.code === 200) {
      return response.data.products || [];
    } else {
      const errorMessage = response.data?.message || 'Unexpected API response';
      console.error(errorMessage, response.data);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; // Propagate the error instead of silently returning empty array
  }
};

/**
 * Get a single product by ID
 * @param {string} productId - The product ID to fetch
 * @returns {Promise<Object>} Product object
 */
export const getProductById = async (productId) => {
  try {
    // Since there's no direct endpoint to get a product by ID in the docs,
    // we'll fetch all products and filter by ID
    const allProducts = await getAllProducts();
    const product = allProducts.find(p => p.product_id === productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
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
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response with product ID
 */
export const addProduct = async (productData, token) => {
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
        'Authorization': `Bearer ${token}`
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
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response with status
 */
export const updateProduct = async (productId, productData, token) => {
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
        'Authorization': `Bearer ${token}`
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
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response with status
 */
export const deleteProduct = async (productId, token) => {
  try {
    const url = `/admin/delete-product?product_id=${encodeURIComponent(productId)}`;
    
    const response = await api.post(url, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
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
 * Get related products (products in the same category)
 * @param {string} category - Category to match
 * @param {string} currentProductId - Product ID to exclude
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise<Array>} Related products array
 */
export const getRelatedProducts = async (category, currentProductId, limit = 4) => {
  try {
    const products = await getAllProducts({ category });
    
    // Filter out the current product
    return products
      .filter(product => product.product_id !== currentProductId)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching related products:', error);
    throw error; // Propagate the error instead of silently returning empty array
  }
};

export default {
  getAllProducts,
  getProductById,
  loginAdmin,
  addProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts
};