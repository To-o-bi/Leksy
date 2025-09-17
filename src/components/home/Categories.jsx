import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';

const Categories = () => {
  const containerRef = useRef(null);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [itemWidth, setItemWidth] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const autoScrollRef = useRef(null);
  const isManualNavigationRef = useRef(false);
  
  // Get dynamic categories and loading state from the context
  const { categories, loading } = useProducts();

  // Create duplicated categories for infinite loop
  const duplicatedCategories = categories.length > 0 ? [
    ...categories,
    ...categories,
    ...categories // Triple the categories for smooth infinite scrolling
  ] : [];

  // Responsive breakpoints handler
  const updateLayout = useCallback(() => {
    const width = window.innerWidth;
    let newItemsPerView;
    
    if (width < 480) newItemsPerView = 1;
    else if (width < 640) newItemsPerView = 2;
    else if (width < 768) newItemsPerView = 3;
    else if (width < 1024) newItemsPerView = 4;
    else if (width < 1280) newItemsPerView = 5;
    else newItemsPerView = 6;
    
    setItemsPerView(newItemsPerView);
    
    // Calculate item width based on container and items per view
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newItemWidth = containerWidth / newItemsPerView;
      setItemWidth(newItemWidth);
      
      // Reset position when layout changes
      if (categories.length > 0 && isInitialized) {
        const initialPosition = -(categories.length * newItemWidth);
        setCurrentTranslate(initialPosition);
      }
    }
  }, [categories.length, isInitialized]);

  // Clear auto-scroll interval
  const clearAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // Start auto-scroll with better error handling
  const startAutoScroll = useCallback(() => {
    // Don't start if conditions aren't met
    if (categories.length === 0 || itemWidth === 0 || !isInitialized) {
      return;
    }
    
    clearAutoScroll(); // Clear any existing interval
    
    autoScrollRef.current = setInterval(() => {
      // Check if manual navigation is in progress
      if (isManualNavigationRef.current) {
        return;
      }
      
      setCurrentTranslate(prev => {
        const newTranslate = prev - itemWidth;
        const maxTranslate = -(categories.length * 2 * itemWidth);
        
        // Reset to middle position when we've scrolled through two full sets
        if (newTranslate <= maxTranslate) {
          return -(categories.length * itemWidth);
        }
        
        return newTranslate;
      });
    }, 3000);
  }, [categories.length, itemWidth, isInitialized, clearAutoScroll]);

  // Handle resize events
  useEffect(() => {
    updateLayout();
    
    const handleResize = () => {
      clearAutoScroll();
      updateLayout();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearAutoScroll();
    };
  }, [updateLayout, clearAutoScroll]);

  // Initialize position when ready
  useEffect(() => {
    if (categories.length > 0 && itemWidth > 0 && !isInitialized) {
      const initialPosition = -(categories.length * itemWidth);
      setCurrentTranslate(initialPosition);
      setIsInitialized(true);
    }
  }, [categories.length, itemWidth, isInitialized]);

  // Start auto-scroll when everything is ready
  useEffect(() => {
    if (isInitialized && itemWidth > 0 && categories.length > 0) {
      // Small delay to ensure everything is settled
      const timer = setTimeout(() => {
        startAutoScroll();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        clearAutoScroll();
      };
    }
  }, [isInitialized, itemWidth, categories.length, startAutoScroll, clearAutoScroll]);

  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = '/assets/images/placeholder.jpg';
  }, []);

  // Navigation functions with improved logic
  const goToPrevious = useCallback(() => {
    if (categories.length === 0 || itemWidth === 0 || !isInitialized) return;
    
    // Set manual navigation flag
    isManualNavigationRef.current = true;
    
    // Stop auto-scroll
    clearAutoScroll();
    
    setCurrentTranslate(prev => {
      const newTranslate = prev + itemWidth;
      const minTranslate = -(categories.length * itemWidth);
      
      // If we've scrolled back to the beginning of middle set, jump to end of first set
      if (newTranslate > minTranslate) {
        return -(categories.length * 2 * itemWidth) + itemWidth;
      }
      
      return newTranslate;
    });
    
    // Restart auto-scroll after delay and clear manual flag
    setTimeout(() => {
      isManualNavigationRef.current = false;
      startAutoScroll();
    }, 4000); // Longer delay for manual interaction
  }, [categories.length, itemWidth, isInitialized, clearAutoScroll, startAutoScroll]);

  const goToNext = useCallback(() => {
    if (categories.length === 0 || itemWidth === 0 || !isInitialized) return;
    
    // Set manual navigation flag
    isManualNavigationRef.current = true;
    
    // Stop auto-scroll
    clearAutoScroll();
    
    setCurrentTranslate(prev => {
      const newTranslate = prev - itemWidth;
      const maxTranslate = -(categories.length * 2 * itemWidth);
      
      // If we've reached the end of the second set, jump back to middle set
      if (newTranslate <= maxTranslate) {
        return -(categories.length * itemWidth);
      }
      
      return newTranslate;
    });
    
    // Restart auto-scroll after delay and clear manual flag
    setTimeout(() => {
      isManualNavigationRef.current = false;
      startAutoScroll();
    }, 4000); // Longer delay for manual interaction
  }, [categories.length, itemWidth, isInitialized, clearAutoScroll, startAutoScroll]);

  // Pause auto-scroll on hover
  const handleMouseEnter = useCallback(() => {
    clearAutoScroll();
  }, [clearAutoScroll]);

  const handleMouseLeave = useCallback(() => {
    if (!isManualNavigationRef.current && isInitialized) {
      startAutoScroll();
    }
  }, [startAutoScroll, isInitialized]);

  // Loading Skeleton UI
  if (loading && categories.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-gray-50/30">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded-md mx-auto mb-12"></div>
            <div className="hidden lg:grid grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mb-3"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded-md mt-2"></div>
                </div>
              ))}
            </div>
            <div className="lg:hidden h-40 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </section>
    );
  }

  // No Categories to show
  if (categories.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-gray-50/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">No categories found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Categories</h2>
          <div className="flex justify-center items-center mt-4">
            <div className="w-4 h-1 bg-pink-200 rounded"></div>
            <div className="w-8 h-1 bg-gradient-to-r from-pink-500 to-pink-500 rounded mx-1"></div>
            <div className="w-4 h-1 bg-pink-200 rounded"></div>
          </div>
        </div>
        
        {/* Main Content */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div ref={containerRef} className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${currentTranslate}px)`,
                width: `${duplicatedCategories.length * (100 / itemsPerView)}%`
              }}
            >
              {duplicatedCategories.map((category, index) => (
                <div
                  key={`${category.id}-${Math.floor(index / categories.length)}`}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / duplicatedCategories.length}%` }}
                >
                  <Link 
                    to={category.path} 
                    className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded-lg py-2"
                  >
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-200 ${category.bgColor || 'bg-gray-100'} ${category.hoverColor || 'hover:bg-gray-200'} flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      <img 
                        src={category.image || '/assets/images/placeholder.jpg'} 
                        alt={`${category.name} category`} 
                        className={`${category.imageSize || 'w-12 h-12 sm:w-16 sm:h-16'} object-contain transition-transform duration-300 group-hover:scale-110`}
                        onError={handleImageError} 
                        loading="lazy"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-800 text-center line-clamp-1 group-hover:text-pink-600 transition-colors duration-200 capitalize">
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                      {category.productCount} Product{category.productCount !== 1 ? 's' : ''}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {categories.length > itemsPerView && isInitialized && (
            <>
              <button 
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label="Next slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;