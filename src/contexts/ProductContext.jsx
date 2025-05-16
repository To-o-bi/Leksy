import React, { createContext, useContext, useState, useEffect } from 'react';
import { productService } from '../services/apiService';

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

  // Load all products on initial mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Get all distinct categories from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product.category))];
      setCategories(uniqueCategories);
    }
  }, [products]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchProducts();
      setProducts(response.products || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryFilter) => {
    setLoading(true);
    try {
      const response = await productService.fetchProducts({ 
        filter: Array.isArray(categoryFilter) ? categoryFilter : [categoryFilter] 
      });
      setProducts(response.products || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products by category:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (productId) => {
    setLoading(true);
    try {
      const response = await productService.fetchProduct(productId);
      return response.product;
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      setError('Failed to load product details. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByIds = async (productIds) => {
    setLoading(true);
    try {
      const response = await productService.fetchProducts({ productIds });
      return response.products || [];
    } catch (err) {
      console.error('Failed to fetch products by IDs:', err);
      setError('Failed to load specific products. Please try again later.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  const addProduct = async (productData) => {
    setLoading(true);
    try {
      const response = await productService.addProduct(productData);
      // Refresh products list after adding
      await fetchAllProducts();
      return response;
    } catch (err) {
      console.error('Failed to add product:', err);
      setError('Failed to add product. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId, productData) => {
    setLoading(true);
    try {
      const response = await productService.updateProduct(productId, productData);
      // Refresh products list after updating
      await fetchAllProducts();
      return response;
    } catch (err) {
      console.error('Failed to update product:', err);
      setError('Failed to update product. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    setLoading(true);
    try {
      const response = await productService.deleteProduct(productId);
      // Refresh products list after deleting
      await fetchAllProducts();
      return response;
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = async (sortBy) => {
    setLoading(true);
    try {
      const response = await productService.fetchProducts({ sort: sortBy });
      setProducts(response.products || []);
      setError(null);
    } catch (err) {
      console.error('Failed to sort products:', err);
      setError('Failed to sort products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
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
        addProduct,
        updateProduct,
        deleteProduct,
        sortProducts,
        clearError
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};