// src/contexts/ProductContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Load all products on initial mount or when retry count changes
  useEffect(() => {
    fetchAllProducts();
  }, [retryCount]);

  // Get all distinct categories from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product.category))].filter(Boolean);
      setCategories(uniqueCategories);
    }
  }, [products]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const productList = await productService.getAllProducts();
      setProducts(productList || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryFilter) => {
    setLoading(true);
    try {
      const productList = await productService.getAllProducts({ 
        category: categoryFilter
      });
      setProducts(productList || []);
      setError(null);
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
    setLoading(true);
    try {
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
    setLoading(true);
    try {
      // Since there's no direct API to fetch by IDs,
      // we'll fetch all and filter by ID
      const allProducts = await productService.getAllProducts();
      const filteredProducts = allProducts.filter(product => 
        productIds.includes(product.product_id) || productIds.includes(product.id)
      );
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
    try {
      const data = await productService.getRelatedProducts(category, productId, limit);
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
    setRetryCount(prev => prev + 1);
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
        handleRetry
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};