import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { useProducts } from '../../contexts/ProductContext';

const NewArrivals = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);
  
  // Use the ProductContext - same as ShopPage and Categories
  const { 
    products: productsList, 
    loading, 
    error, 
    fetchAllProducts,
    clearError,
    refreshProducts
  } = useProducts();

  // Create a stable fetchProducts function using useCallback - same pattern
  const fetchProducts = useCallback(async () => {
    clearError();
    
    try {
      // Always fetch all products, then filter for new arrivals
      await fetchAllProducts();
    } catch (err) {
      console.error('Error fetching products in NewArrivals component:', err);
    }
  }, [fetchAllProducts, clearError]);

  // Extract new arrivals from products - same pattern as Categories filtering
  useEffect(() => {
    if (!productsList || productsList.length === 0) {
      setNewArrivals([]);
      return;
    }
    
    // Get the most recent products (last 8 products or products marked as new)
    const sortedProducts = [...productsList]
      .sort((a, b) => {
        // Sort by creation date if available, otherwise by ID
        const dateA = new Date(a.created_at || a.id);
        const dateB = new Date(b.created_at || b.id);
        return dateB - dateA;
      })
      .slice(0, 8); // Get first 8 products

    // Keep the original product format for ProductCard component
    // Just add isNew flag to mark as new arrival
    const formattedProducts = sortedProducts.map(product => ({
      ...product, // Keep all original product properties
      isNew: true // Mark as new arrival
    }));

    setNewArrivals(formattedProducts);
  }, [productsList]);

  // Fetch products on component mount - same as ShopPage and Categories
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Retry handler using refreshProducts - same as other components
  const handleRetry = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Navigate to shop page
  const handleSeeAll = useCallback(() => {
    navigate('/shop');
  }, [navigate]);

  // Loading state - same pattern as other components
  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state - same pattern as other components
  if (error && newArrivals.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">New Arrivals</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // No products state
  if (newArrivals.length === 0 && !loading && !error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <button 
              onClick={handleSeeAll}
              className="text-sm text-pink-500 flex items-center hover:text-pink-600 transition-colors duration-200"
            >
              See all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No new arrivals yet</h3>
            <p className="text-gray-600 mb-6">Check back soon for the latest products</p>
            <button 
              onClick={handleRetry}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
            >
              Refresh Products
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50/30 to-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
            <p className="text-gray-600">Discover our latest beauty essentials</p>
          </div>
          <button 
            onClick={handleSeeAll}
            className="text-sm text-pink-500 flex items-center hover:text-pink-600 transition-colors duration-200 font-medium"
          >
            See all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Show refresh option if there's an error but products are still displayed */}
        {error && newArrivals.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={handleRetry}
              className="text-sm text-gray-500 hover:text-pink-600 transition-colors duration-200"
            >
              Refresh New Arrivals
            </button>
          </div>
        )}

        {/* Add visual separator */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center">
            <div className="w-4 h-1 bg-pink-200 rounded"></div>
            <div className="w-8 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded mx-1"></div>
            <div className="w-4 h-1 bg-pink-200 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;