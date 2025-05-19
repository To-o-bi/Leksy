import React, { createContext, useContext, useState, useEffect } from 'react';
import productService from '../api/services/productService';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch all products on component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Extract unique categories after products are loaded
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product.category))];
      setCategories(uniqueCategories);
    }
  }, [products]);

  /**
   * Fetch all products from the API
   * @param {Object} options - Optional query parameters
   * @returns {Promise<Array>} Products array
   */
  const fetchAllProducts = async (options = {}) => {
    setLoading(true);
    setError(null);
    console.log('Fetching all products from API');
    
    try {
      // Change this line from getAllProducts to fetchProducts
      const response = await productService.fetchProducts(options);
      
      if (response && response.products) {
        setProducts(response.products);
        return response.products;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load products');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a product by ID
   * @param {string} productId - Product ID to find
   * @returns {Object|null} Product object or null if not found
   */
  const getProductById = async (productId) => {
    // First check if product already exists in state
    const cachedProduct = products.find(p => p.product_id === productId);
    
    if (cachedProduct) {
      return cachedProduct;
    }
    
    // If not in state, fetch from API
    setLoading(true);
    try {
      const product = await productService.fetchProduct(productId);
      return product;
    } catch (err) {
      console.error(`Failed to fetch product ${productId}:`, err);
      setError(err.message || 'Failed to load product details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter products by category
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered products
   */
  const filterByCategory = (category) => {
    if (!category || category === 'all') {
      return products;
    }
    return products.filter(product => product.category === category);
  };

  const value = {
    products,
    loading,
    error,
    categories,
    fetchAllProducts,
    getProductById,
    filterByCategory
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;