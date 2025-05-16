// src/api/services/productService.js
import api from '../axios';

/**
 * Get all products with optional filtering
 * @param {Object} filters - Optional filters for products
 * @returns {Promise} - Promise with products data
 */
export const getAllProducts = async (filters = {}) => {
  try {
    // Create query parameters according to the API documentation
    const queryParams = new URLSearchParams();
    
    // Handle category filter - API expects 'filter' parameter
    if (filters.category) {
      // API expects comma-separated list of categories in 'filter' parameter
      queryParams.append('filter', filters.category);
    }
    
    // Handle sorting if needed
    if (filters.sort) {
      queryParams.append('sort', filters.sort);
    }
    
    // Handle product IDs array if specified
    if (filters.productIds && filters.productIds.length > 0) {
      queryParams.append('products_ids_array', filters.productIds.join(','));
    }
    
    // IMPORTANT FIX: Use POST request instead of GET based on API documentation
    const response = await api.post(`/api/fetch-products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    
    // Check if response has expected structure
    if (response.data && response.data.code === 200 && response.data.products) {
      // Format product data if needed
      return response.data.products.map(product => ({
        ...product,
        // Ensure expected fields in component are available
        id: product.product_id,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        // Add any other field transformations needed
      }));
    }
    
    // Handle success response with no products
    if (response.data && response.data.code === 200) {
      console.log('API returned success but no products array found');
      return [];
    }
    
    // Handle unexpected response structure
    console.error('Unexpected API response format:', response.data);
    throw new Error('Unexpected API response format');
    
  } catch (error) {
    console.error('Error fetching products:', error.response || error);
    throw error;
  }
};

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise} - Promise with product data
 */
export const getProductById = async (productId) => {
  try {
    // IMPORTANT FIX: Use POST request instead of GET based on API documentation
    const response = await api.post(`/api/fetch-product?product_id=${encodeURIComponent(productId)}`);
    
    if (response.data && response.data.code === 200 && response.data.product) {
      return {
        ...response.data.product,
        id: response.data.product.product_id,
        image: response.data.product.images && response.data.product.images.length > 0 
          ? response.data.product.images[0] 
          : null,
      };
    }
    
    throw new Error('Product not found');
  } catch (error) {
    console.error('Error fetching product by ID:', error.response || error);
    throw error;
  }
};

/**
 * Get related products (products in the same category)
 * @param {string} productId - Current product ID to exclude
 * @param {string} category - Category to match
 * @param {number} limit - Maximum number of related products to return
 * @returns {Promise} - Promise with related products data
 */
export const getRelatedProducts = async (productId, category, limit = 4) => {
  try {
    // Create query parameters for the API
    const queryParams = new URLSearchParams();
    
    // Filter by the same category
    if (category) {
      queryParams.append('filter', category);
    }
    
    // Use POST request for consistency
    const response = await api.post(`/api/fetch-products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    
    if (response.data && response.data.code === 200 && response.data.products) {
      // Filter out the current product and limit the results
      const relatedProducts = response.data.products
        .filter(product => product.product_id !== productId)
        .slice(0, limit)
        .map(product => ({
          ...product,
          id: product.product_id,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
        }));
        
      return relatedProducts;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching related products:', error.response || error);
    return []; // Return empty array on error to prevent UI issues
  }
};

/**
 * Search products by keyword (name or description)
 * @param {string} keyword - Search term
 * @returns {Promise} - Promise with matching products
 */
export const searchProducts = async (keyword) => {
  try {
    // Get all products first (API doesn't support search parameter)
    const response = await api.post('/api/fetch-products');
    
    if (response.data && response.data.code === 200 && response.data.products) {
      // Filter products by keyword client-side
      const searchTerm = keyword.toLowerCase().trim();
      
      // Return empty array if no search term
      if (!searchTerm) return [];
      
      // Filter products by name or description
      const matchingProducts = response.data.products
        .filter(product => 
          (product.name && product.name.toLowerCase().includes(searchTerm)) ||
          (product.description && product.description.toLowerCase().includes(searchTerm))
        )
        .map(product => ({
          ...product,
          id: product.product_id,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
        }));
        
      return matchingProducts;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching products:', error.response || error);
    throw error;
  }
};

/**
 * Get featured products (for homepage or special sections)
 * @param {number} limit - Maximum number of products to return
 * @returns {Promise} - Promise with featured products
 */
export const getFeaturedProducts = async (limit = 8) => {
  try {
    // We could add a featured flag in the future, but for now we'll just get the most recent products
    const response = await api.post('/api/fetch-products');
    
    if (response.data && response.data.code === 200 && response.data.products) {
      // Just take the first {limit} products for now
      const featuredProducts = response.data.products
        .slice(0, limit)
        .map(product => ({
          ...product,
          id: product.product_id,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
        }));
        
      return featuredProducts;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching featured products:', error.response || error);
    return []; // Return empty array on error to prevent UI issues
  }
};

// Export individual functions instead of including the api instance
export default {
  getAllProducts,
  getProductById,
  getRelatedProducts,
  searchProducts,
  getFeaturedProducts
};