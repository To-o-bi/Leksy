// src/hooks/useProduct.js
import { useState, useCallback } from 'react';
import * as productService from '../api/services/productService';

export const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Clear any existing error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Get all products with filters
  const getProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching products with filters:', filters);
      const data = await productService.getAllProducts(filters);
      setProducts(data || []);
      
      // Extract unique categories from products
      if (data && data.length > 0) {
        const uniqueCategories = [...new Set(data.map(p => p.category))].filter(Boolean);
        setCategories(uniqueCategories);
      }
      
      return data;
    } catch (err) {
      console.error('Error in getProducts:', err);
      const errorMessage = err.message || 'Failed to load products. Please try again.';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get single product by ID
  const getProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching product with ID: ${id}`);
      const product = await productService.getProductById(id);
      return product;
    } catch (err) {
      console.error('Error in getProductById:', err);
      const errorMessage = err.message || 'Failed to load product details.';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get featured products - we'll use a filter on the main product list
  const getFeaturedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all products and filter for featured
      const allProducts = await productService.getAllProducts();
      const featuredProducts = allProducts.filter(p => p.featured);
      return featuredProducts;
    } catch (err) {
      console.error('Error in getFeaturedProducts:', err);
      const errorMessage = err.message || 'Failed to load featured products.';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get bestseller products
  const getBestsellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all products and filter for bestsellers
      const allProducts = await productService.getAllProducts();
      const bestsellers = allProducts.filter(p => p.bestseller);
      return bestsellers;
    } catch (err) {
      console.error('Error in getBestsellers:', err);
      const errorMessage = err.message || 'Failed to load bestsellers.';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get new arrivals
  const getNewArrivals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all products and filter for new arrivals
      const allProducts = await productService.getAllProducts();
      const newArrivals = allProducts.filter(p => p.newArrival);
      return newArrivals;
    } catch (err) {
      console.error('Error in getNewArrivals:', err);
      const errorMessage = err.message || 'Failed to load new arrivals.';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get related products
  const getRelatedProducts = useCallback(async (productId, category, limit = 4) => {
    setLoading(true);
    setError(null);
    
    try {
      const relatedProducts = await productService.getRelatedProducts(category, productId, limit);
      return relatedProducts;
    } catch (err) {
      console.error('Error in getRelatedProducts:', err);
      const errorMessage = err.message || 'Failed to load related products.';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Retry mechanism for failed requests
  const retry = useCallback(async (operation, ...args) => {
    clearError();
    return operation(...args);
  }, [clearError]);
  
  return {
    products,
    loading,
    error,
    categories,
    getProducts,
    getProductById,
    getFeaturedProducts,
    getBestsellers,
    getNewArrivals,
    getRelatedProducts,
    clearError,
    retry
  };
};

export default useProduct;