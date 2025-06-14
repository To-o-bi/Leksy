import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { productService, CATEGORIES } from '../api';

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
  const [lastFetch, setLastFetch] = useState(null);
  const [cache, setCache] = useState(new Map());

  // Static categories from API config
  const categories = useMemo(() => CATEGORIES, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if data needs refresh (5 minutes cache)
  const needsRefresh = useCallback(() => {
    if (!lastFetch) return true;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastFetch > fiveMinutes;
  }, [lastFetch]);

  /**
   * Fetch all products from the API
   */
  const fetchAllProducts = useCallback(async (options = {}, forceRefresh = false) => {
    if (!forceRefresh && products.length > 0 && !needsRefresh()) {
      console.log('Using cached products');
      return products;
    }

    setLoading(true);
    setError(null);
    console.log('Fetching products from API with options:', options);
    
    try {
      const response = await productService.fetchProducts(options);
      console.log('Products fetch response:', response);
      
      if (response && response.code === 200 && response.products) {
        const fetchedProducts = response.products;
        setProducts(fetchedProducts);
        setLastFetch(Date.now());
        console.log(`Loaded ${fetchedProducts.length} products`);
        return fetchedProducts;
      } else {
        throw new Error(response?.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      const errorMessage = err.message || 'Failed to load products';
      setError(errorMessage);
      
      if (products.length === 0) {
        return [];
      }
      return products;
    } finally {
      setLoading(false);
    }
  }, [products, needsRefresh]);

  /**
   * Get a product by ID - Updated to match your API
   */
  const getProductById = useCallback(async (productId, useCache = true) => {
    console.log('getProductById called with:', productId);
    
    if (!productId || productId === 'undefined') {
      console.error('getProductById: Invalid product ID provided:', productId);
      return null;
    }

    // Check cache first if enabled
    if (useCache && cache.has(productId)) {
      const cached = cache.get(productId);
      const cacheAge = Date.now() - cached.timestamp;
      const fiveMinutes = 5 * 60 * 1000;
      
      if (cacheAge < fiveMinutes) {
        console.log(`Using cached product: ${productId}`);
        return cached.product;
      }
    }

    // Check if product exists in current products list
    const cachedProduct = products.find(p => p.product_id === productId);
    if (cachedProduct && useCache) {
      console.log(`Found product in products list: ${productId}`);
      // Cache it for future use
      setCache(prev => new Map(prev).set(productId, {
        product: cachedProduct,
        timestamp: Date.now()
      }));
      return cachedProduct;
    }
    
    // Fetch from API using the correct endpoint
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching product from API: ${productId}`);
      const response = await productService.fetchProduct(productId);
      console.log('Single product API response:', response);
      
      if (response && response.code === 200 && response.product) {
        const product = response.product;
        
        // Cache the product
        setCache(prev => new Map(prev).set(productId, {
          product,
          timestamp: Date.now()
        }));
        
        console.log(`Product fetched successfully:`, product);
        return product;
      } else {
        console.error('Product not found or invalid response:', response);
        throw new Error(response?.message || 'Product not found');
      }
    } catch (err) {
      console.error(`Failed to fetch product ${productId}:`, err);
      const errorMessage = err.message || 'Failed to load product details';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [products, cache]);

  /**
   * Filter products by category
   */
  const filterByCategory = useCallback((category) => {
    if (!category || category === 'all') {
      return products;
    }
    return products.filter(product => product.category === category);
  }, [products]);

  /**
   * Search products by query
   */
  const searchProducts = useCallback((query) => {
    if (!query || !query.trim()) {
      return products;
    }
    
    const searchTerm = query.toLowerCase().trim();
    return products.filter(product => 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm)
    );
  }, [products]);

  /**
   * Get products by multiple categories
   */
  const filterByCategories = useCallback((categoryList) => {
    if (!categoryList || categoryList.length === 0) {
      return products;
    }
    return products.filter(product => categoryList.includes(product.category));
  }, [products]);

  /**
   * Sort products by specified field
   */
  const sortProducts = useCallback((sortBy = 'name', order = 'asc') => {
    const sorted = [...products].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle price sorting
      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (order === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
    
    return sorted;
  }, [products]);

  /**
   * Get products with filters and sorting
   */
  const getFilteredProducts = useCallback((options = {}) => {
    let result = products;
    
    // Apply category filter
    if (options.category && options.category !== 'all') {
      result = filterByCategory(options.category);
    }
    
    // Apply search
    if (options.search) {
      result = result.filter(product => 
        product.name?.toLowerCase().includes(options.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(options.search.toLowerCase())
      );
    }
    
    // Apply sorting
    if (options.sortBy) {
      result = [...result].sort((a, b) => {
        let aValue = a[options.sortBy];
        let bValue = b[options.sortBy];
        
        if (options.sortBy === 'price') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        const order = options.sortOrder === 'desc' ? -1 : 1;
        return aValue > bValue ? order : -order;
      });
    }
    
    return result;
  }, [products, filterByCategory]);

  /**
   * Refresh products data
   */
  const refreshProducts = useCallback(() => {
    return fetchAllProducts({}, true);
  }, [fetchAllProducts]);

  /**
   * Add product to local state
   */
  const addProductToState = useCallback((product) => {
    setProducts(prev => [product, ...prev]);
  }, []);

  /**
   * Update product in local state
   */
  const updateProductInState = useCallback((productId, updates) => {
    setProducts(prev => 
      prev.map(product => 
        product.product_id === productId 
          ? { ...product, ...updates }
          : product
      )
    );
    
    // Update cache as well
    if (cache.has(productId)) {
      const cached = cache.get(productId);
      setCache(prev => new Map(prev).set(productId, {
        product: { ...cached.product, ...updates },
        timestamp: cached.timestamp
      }));
    }
  }, [cache]);

  /**
   * Remove product from local state
   */
  const removeProductFromState = useCallback((productId) => {
    setProducts(prev => prev.filter(product => product.product_id !== productId));
    
    // Remove from cache
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(productId);
      return newCache;
    });
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Clear old cache entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      setCache(prev => {
        const newCache = new Map();
        for (const [key, value] of prev) {
          if (now - value.timestamp < oneHour) {
            newCache.set(key, value);
          }
        }
        return newCache;
      });
    }, 10 * 60 * 1000); // Clean every 10 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // State
    products,
    loading,
    error,
    categories,
    
    // Basic operations
    fetchAllProducts,
    getProductById,
    refreshProducts,
    clearError,
    
    // Filtering and searching
    filterByCategory,
    filterByCategories,
    searchProducts,
    sortProducts,
    getFilteredProducts,
    
    // State management
    addProductToState,
    updateProductInState,
    removeProductFromState,
    
    // Computed properties
    productCount: products.length,
    hasProducts: products.length > 0,
    isEmpty: products.length === 0,
    lastUpdated: lastFetch,
    
    // Cache info
    cacheSize: cache.size
  }), [
    products,
    loading,
    error,
    categories,
    fetchAllProducts,
    getProductById,
    refreshProducts,
    clearError,
    filterByCategory,
    filterByCategories,
    searchProducts,
    sortProducts,
    getFilteredProducts,
    addProductToState,
    updateProductInState,
    removeProductFromState,
    lastFetch,
    cache.size
  ]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;