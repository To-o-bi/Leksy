import { useState, useEffect, useCallback } from 'react';

// Mock data instead of importing productService
const mockProducts = [
  { id: 1, name: 'Premium Headphones', price: 199.99, category: 'Electronics', featured: true, bestseller: true, newArrival: false, imageUrl: '/api/placeholder/300/300', description: 'High-quality noise-cancelling headphones with superior sound.' },
  { id: 2, name: 'Wireless Mouse', price: 49.99, category: 'Electronics', featured: false, bestseller: true, newArrival: false, imageUrl: '/api/placeholder/300/300', description: 'Ergonomic wireless mouse with long battery life.' },
  { id: 3, name: 'Smart Watch', price: 299.99, category: 'Electronics', featured: true, bestseller: false, newArrival: true, imageUrl: '/api/placeholder/300/300', description: 'Track your fitness and stay connected with this stylish smart watch.' },
  { id: 4, name: 'Laptop Backpack', price: 79.99, category: 'Accessories', featured: false, bestseller: false, newArrival: true, imageUrl: '/api/placeholder/300/300', description: 'Water-resistant backpack with dedicated laptop compartment.' },
  { id: 5, name: 'Bluetooth Speaker', price: 129.99, category: 'Electronics', featured: true, bestseller: true, newArrival: true, imageUrl: '/api/placeholder/300/300', description: 'Portable speaker with impressive sound quality.' },
];

const mockCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Accessories' },
  { id: 3, name: 'Clothing' },
  { id: 4, name: 'Home & Kitchen' },
];

export const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Get all products with filters
  const getProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Apply filters to mock data
      let filteredProducts = [...mockProducts];
      
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      
      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice);
      }
      
      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }
      
      setProducts(filteredProducts);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get single product by ID
  const getProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const product = mockProducts.find(p => p.id === parseInt(id));
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (err) {
      setError(err.message || 'Failed to load product details.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load categories
  const getCategories = useCallback(async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      setCategories(mockCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);
  
  useEffect(() => {
    getCategories();
  }, [getCategories]);
  
  // Get featured products
  const getFeaturedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    try {
      const featuredProducts = mockProducts.filter(p => p.featured);
      return featuredProducts;
    } catch (err) {
      setError('Failed to load featured products.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get bestsellers
  const getBestsellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    try {
      const bestsellers = mockProducts.filter(p => p.bestseller);
      return bestsellers;
    } catch (err) {
      setError('Failed to load bestsellers.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get new arrivals
  const getNewArrivals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    try {
      const newArrivals = mockProducts.filter(p => p.newArrival);
      return newArrivals;
    } catch (err) {
      setError('Failed to load new arrivals.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    products,
    loading,
    error,
    categories,
    getProducts,
    getProductById,
    getFeaturedProducts,
    getBestsellers,
    getNewArrivals
  };
};

export default useProduct;