// src/contexts/ProductContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as productService from '../api/services/productService';

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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Cache for API responses
  const productsCache = useRef({
    allProducts: null,
    categorizedProducts: {}
  });
  
  // Flag to track initial load
  const initialLoadComplete = useRef(false);

  // Load all products only once on initial mount or when retry count changes
  useEffect(() => {
    if (!initialLoadComplete.current || retryCount > 0) {
      fetchAllProducts();
      initialLoadComplete.current = true;
    }
  }, [retryCount]);

  // Get all distinct categories from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product.category))].filter(Boolean);
      setCategories(uniqueCategories);
    }
  }, [products]);

  const fetchAllProducts = async () => {
    // If we have cached data and not retrying, use it
    if (productsCache.current.allProducts && retryCount === 0) {
      console.log('Using cached products data');
      setProducts(productsCache.current.allProducts);
      return productsCache.current.allProducts;
    }
    
    setLoading(true);
    try {
      console.log('Fetching all products from API');
      const productList = await productService.getAllProducts();
      setProducts(productList || []);
      setError(null);
      
      // Cache the response
      productsCache.current.allProducts = productList;
      return productList;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load products. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryFilter) => {
    // If we have cached data for this category and not retrying, use it
    if (productsCache.current.categorizedProducts[categoryFilter] && retryCount === 0) {
      console.log(`Using cached products data for category: ${categoryFilter}`);
      setProducts(productsCache.current.categorizedProducts[categoryFilter]);
      return productsCache.current.categorizedProducts[categoryFilter];
    }
    
    setLoading(true);
    try {
      console.log(`Fetching products for category: ${categoryFilter}`);
      const productList = await productService.getAllProducts({ 
        category: categoryFilter
      });
      setProducts(productList || []);
      setError(null);
      
      // Cache the response
      productsCache.current.categorizedProducts[categoryFilter] = productList;
      return productList;
    } catch (err) {
      console.error('Failed to fetch products by category:', err);
      setError(err.message || 'Failed to load products. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (productId) => {
    // Try to find the product in the cache first
    if (productsCache.current.allProducts) {
      const cachedProduct = productsCache.current.allProducts.find(
        p => p.product_id === productId || p.id === productId
      );
      
      if (cachedProduct) {
        console.log(`Found product ${productId} in cache`);
        return cachedProduct;
      }
    }
    
    // If not in cache, fetch it
    setLoading(true);
    try {
      console.log(`Fetching product with ID: ${productId}`);
      const product = await productService.getProductById(productId);
      setError(null);
      return product;
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      setError(err.message || 'Failed to load product details. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByIds = async (productIds) => {
    // If we have all products cached, filter from cache
    if (productsCache.current.allProducts) {
      const cachedProducts = productsCache.current.allProducts.filter(product => 
        productIds.includes(product.product_id) || productIds.includes(product.id)
      );
      
      if (cachedProducts.length === productIds.length) {
        console.log('Found all requested products in cache');
        return cachedProducts;
      }
    }
    
    setLoading(true);
    try {
      const allProducts = productsCache.current.allProducts || 
                         await productService.getAllProducts();
                         
      const filteredProducts = allProducts.filter(product => 
        productIds.includes(product.product_id) || productIds.includes(product.id)
      );
      
      // Cache all products if not already cached
      if (!productsCache.current.allProducts) {
        productsCache.current.allProducts = allProducts;
      }
      
      return filteredProducts || [];
    } catch (err) {
      console.error('Failed to fetch products by IDs:', err);
      setError(err.message || 'Failed to load specific products. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRelatedProducts = async (productId, category, limit = 4) => {
    // If we have products for this category cached, use them
    if (productsCache.current.categorizedProducts[category]) {
      const cachedProducts = productsCache.current.categorizedProducts[category].filter(
        p => p.product_id !== productId && p.id !== productId
      ).slice(0, limit);
      
      console.log(`Found related products for ${category} in cache`);
      return cachedProducts;
    } else if (productsCache.current.allProducts) {
      // Try filtering from all products cache
      const cachedProducts = productsCache.current.allProducts
        .filter(p => p.category === category && p.product_id !== productId && p.id !== productId)
        .slice(0, limit);
        
      if (cachedProducts.length > 0) {
        console.log(`Found related products for ${category} in all products cache`);
        return cachedProducts;
      }
    }
    
    try {
      console.log(`Fetching related products for category ${category}`);
      const data = await productService.getRelatedProducts(category, productId, limit);
      
      // Cache for this category if not already cached
      if (!productsCache.current.categorizedProducts[category]) {
        productsCache.current.categorizedProducts[category] = 
          productsCache.current.allProducts?.filter(p => p.category === category) || data;
      }
      
      return data;
    } catch (err) {
      console.error('Failed to fetch related products:', err);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };
  
  const handleRetry = () => {
    clearError();
    // Clear cache on retry
    productsCache.current = {
      allProducts: null,
      categorizedProducts: {}
    };
    setRetryCount(prev => prev + 1);
  };
  
  // Clear cache method (useful for admin sections after products are modified)
  const clearCache = () => {
    productsCache.current = {
      allProducts: null,
      categorizedProducts: {}
    };
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        loading,
        error,
        fetchAllProducts,
        fetchProductsByCategory,
        fetchProductById,
        fetchProductsByIds,
        getRelatedProducts,
        clearError,
        handleRetry,
        clearCache
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};