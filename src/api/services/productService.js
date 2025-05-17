import api from '../axios';

/**
 * Fetch all products with optional filtering
 * @param {Object} filters - Optional filters (category, sort)
 * @returns {Promise<Array>} Array of products
 */
export const getAllProducts = async (filters = {}) => {
  try {
    // Construct URL with query parameters
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
    
    console.log(`Sending request to ${url}`);
    
    // The API expects a POST request with empty body
    const response = await api.post(url);
    
    // Check for success response
    if (response.data && response.data.code === 200) {
      console.log(`Received ${response.data.products?.length || 0} products`);
      return response.data.products || [];
    } else {
      const errorMessage = response.data?.message || 'Unexpected API response';
      console.error(errorMessage, response.data);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; // Propagate the error
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
    console.log(`Fetching product with ID: ${productId}`);
    const allProducts = await getAllProducts();
    const product = allProducts.find(p => p.product_id === productId || p.id === productId);
    
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
 * Get related products (products in the same category)
 * @param {string} category - Category to match
 * @param {string} currentProductId - Product ID to exclude
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise<Array>} Related products array
 */
export const getRelatedProducts = async (category, currentProductId, limit = 4) => {
  try {
    console.log(`Fetching related products for category: ${category}`);
    const products = await getAllProducts({ category });
    
    // Filter out the current product
    return products
      .filter(product => product.product_id !== currentProductId && product.id !== currentProductId)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching related products:', error);
    throw error; // Propagate the error
  }
};

export default {
  getAllProducts,
  getProductById,
  getRelatedProducts
};