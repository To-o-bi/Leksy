import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from '../product/ProductCard';
import { useProducts } from '../../contexts/ProductContext';

const BestSellers = () => {
  const [bestSellers, setBestSellers] = useState([]);
  
  // Use the ProductContext - same as other components
  const { 
    products: productsList, 
    loading, 
    error, 
    fetchAllProducts,
    clearError,
    refreshProducts
  } = useProducts();
  
  // Carousel state
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Create a stable fetchProducts function using useCallback
  const fetchProducts = useCallback(async () => {
    clearError();
    
    try {
      await fetchAllProducts();
    } catch (err) {
      console.error('Error fetching products in BestSellers component:', err);
    }
  }, [fetchAllProducts, clearError]);

  // Simple best sellers extraction - just get first 8 products
  useEffect(() => {
    if (!productsList || productsList.length === 0) {
      setBestSellers([]);
      return;
    }
    
    // Filter out products without valid IDs and take first 8
    const validProducts = productsList.filter(product => 
      product && (product.id || product.product_id)
    );
    const selectedProducts = validProducts.slice(0, 8);
    setBestSellers(selectedProducts);
  }, [productsList]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Detect mobile screen
  useEffect(() => {
    const updateScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Retry handler
  const handleRetry = useCallback(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Navigate to shop page
  const handleSeeAll = useCallback(() => {
    alert('Navigate to /shop');
    // In your actual app, use: navigate('/shop');
  }, []);

  // Simple carousel controls
  const productsPerView = isMobile ? 2 : 4;
  const totalSlides = Math.ceil(bestSellers.length / productsPerView);

  const scrollToSlide = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerWidth = container.offsetWidth;
      const scrollPosition = index * containerWidth;
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      setActiveIndex(index);
    }
  };

  const handlePrevious = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : totalSlides - 1;
    scrollToSlide(newIndex);
  };

  const handleNext = () => {
    const newIndex = (activeIndex + 1) % totalSlides;
    scrollToSlide(newIndex);
  };

  // Simple touch handlers
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Helper function to get unique product ID
  const getProductId = (product, index) => {
    return product.id || product.product_id || `product-${index}`;
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Best Selling Products</h2>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
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

  // Error state
  if (error && bestSellers.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Best Selling Products</h2>
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
  if (bestSellers.length === 0 && !loading && !error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Best Selling Products</h2>
            <button 
              onClick={handleSeeAll}
              className="text-sm text-pink-500 flex items-center hover:text-pink-600 transition-colors"
            >
              See all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No products available</h3>
            <p className="text-gray-600 mb-6">Check back soon for our best selling products</p>
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Best Selling Products</h2>
          <button 
            onClick={handleSeeAll}
            className="text-sm text-pink-500 flex items-center hover:text-pink-600 transition-colors"
          >
            See all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Simple carousel container */}
        <div className="relative">
          {/* Left arrow - only show if more than one slide */}
          {!isMobile && totalSlides > 1 && (
            <button 
              className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 cursor-pointer hover:bg-pink-100 transition-colors duration-200"
              onClick={handlePrevious}
              aria-label="Previous products"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Scrollable container with products */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none'
            }}
          >
            {bestSellers.map((product, index) => {
              const productId = getProductId(product, index);
              return (
                <div 
                  key={`bestseller-${productId}`}
                  className={`flex-shrink-0 ${
                    isMobile ? 'w-1/2 px-2' : 'w-1/4 px-3'
                  }`}
                >
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
          
          {/* Right arrow - only show if more than one slide */}
          {!isMobile && totalSlides > 1 && (
            <button 
              className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-pink-100 cursor-pointer transition-colors duration-200"
              onClick={handleNext}
              aria-label="Next products"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Simple pagination indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center items-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={`pagination-dot-${index}`}
                  onClick={() => scrollToSlide(index)}
                  className={`h-1 transition-all duration-300 rounded-full ${
                    index === activeIndex ? 'w-8 bg-pink-500' : 'w-4 bg-gray-300'
                  } ${isMobile ? 'h-2' : 'h-1'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Mobile swipe instruction */}
        {isMobile && bestSellers.length > 2 && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">Swipe to see more products</p>
          </div>
        )}

        {/* Show refresh option if there's an error but products are still displayed */}
        {error && bestSellers.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={handleRetry}
              className="text-sm text-gray-500 hover:text-pink-600 transition-colors duration-200"
            >
              Refresh Best Sellers
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;