import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { useProducts } from '../../contexts/ProductContext';

const NewArrivals = () => {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);
  
  const { 
    products: productsList, 
    loading, 
    error, 
    refreshProducts
  } = useProducts();

  // Error message formatter
  const formatErrorMessage = (error) => {
    if (!error) return null;
    const errorString = typeof error === 'string' ? error : error.message || error.toString();
    const lowerError = errorString.toLowerCase();
    
    if (lowerError.includes('timeout') || lowerError.includes('exceeded')) {
      return 'Connection timeout. Please try again.';
    }
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return 'Connection failed. Check your internet.';
    }
    if (lowerError.includes('server') || lowerError.includes('500')) {
      return 'Server temporarily unavailable.';
    }
    
    return 'Unable to load new arrivals. Please try again.';
  };

  // Helper function to determine if a product is truly new (within last 30 days)
  const isProductNew = (product) => {
    if (!product.created_at && !product.date_added) return true; // Default to new if no date
    
    const productDate = new Date(product.created_at || product.date_added);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return productDate > thirtyDaysAgo;
  };

  useEffect(() => {
    if (!productsList || productsList.length === 0) {
      setNewArrivals([]);
      return;
    }
    
    // Filter products and get the most recent 8
    const latestProducts = [...productsList]
      .filter(product => product && (product.product_id !== undefined && product.product_id !== null))
      .slice(0, 8); 

    // Add isNew flag based on actual date and ensure uniqueId
    const formattedProducts = latestProducts.map((product, index) => ({
      ...product,
      isNew: isProductNew(product), // More intelligent new detection
      showNewBadge: true, // Always show badge in new arrivals section
      uniqueId: product.product_id || `new-arrival-${index}`
    }));

    setNewArrivals(formattedProducts);
  }, [productsList]);

  const handleRetry = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  const handleSeeAll = useCallback(() => {
    navigate('/shop');
  }, [navigate]);

  // Format error for display
  const displayError = error ? formatErrorMessage(error) : null;

  if (loading && newArrivals.length === 0) {
    return (
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex justify-between items-center mb-6 sm:mb-8 lg:mb-10">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">New Arrivals</h2>
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="h-5 w-12 sm:h-6 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={`new-arrivals-skeleton-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse relative">
                <div className="h-32 xs:h-40 sm:h-48 bg-gray-200 relative">
                  <div className="absolute top-2 left-2 w-12 h-5 bg-gray-300 rounded"></div>
                </div>
                <div className="p-2 sm:p-3 md:p-4">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded mb-2 sm:mb-3 w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state - Simple and clean
  if (displayError && newArrivals.length === 0) {
    return (
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">New Arrivals</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6">Discover our latest beauty essentials</p>
            </div>
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {displayError}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-500 text-white rounded-full hover:from-pink-600 hover:to-pink-600 transition-all duration-300 text-sm sm:text-base touch-manipulation"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && newArrivals.length === 0) {
    return (
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">New Arrivals</h2>
            <div className="flex justify-center items-center mt-3 sm:mt-4">
              <div className="w-3 h-1 bg-pink-200 rounded"></div>
              <div className="w-6 sm:w-8 h-1 bg-gradient-to-r from-pink-500 to-pink-500 rounded mx-1"></div>
              <div className="w-3 h-1 bg-pink-200 rounded"></div>
            </div>
            <p className="text-gray-600 text-sm md:text-base mt-3">Discover our latest beauty essentials</p>
          </div>
          <div className="text-center py-8 sm:py-12">
            <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">✨</div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2 px-4">No new arrivals yet</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">Check back soon for the latest products</p>
            <button 
              onClick={handleRetry}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-pink-500 text-white rounded-full hover:from-pink-600 hover:to-pink-600 transition-all duration-300 text-sm sm:text-base touch-manipulation"
            >
              Refresh Products
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-1 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">New Arrivals</h2>
          <div className="flex justify-center items-center mt-3 sm:mt-4">
            <div className="w-3 h-1 bg-pink-200 rounded"></div>
            <div className="w-6 sm:w-8 h-1 bg-gradient-to-r from-pink-500 to-pink-500 rounded mx-1"></div>
            <div className="w-3 h-1 bg-pink-200 rounded"></div>
          </div>
          <p className="text-gray-600 text-sm md:text-base mt-3">Discover our latest beauty essentials</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          {newArrivals.map((product, index) => (
            <ProductCard 
              key={`new-arrival-${product.uniqueId}`} 
              product={product} 
            />
          ))}
        </div>

        {/* See All Button at bottom - centered */}
        <div className="text-center mt-8 sm:mt-10">
          <button 
            onClick={handleSeeAll}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span>See All Products</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Simple error indicator for partial failures */}
        {displayError && newArrivals.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={handleRetry}
              className="text-sm text-gray-500 hover:text-pink-600 transition-colors"
            >
              Refresh products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;