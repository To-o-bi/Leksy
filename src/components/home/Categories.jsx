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
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showGridView, setShowGridView] = useState(false);
  
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
    
    // Check if mobile
    const mobile = width < 768;
    setIsMobile(mobile);
    
    if (width < 375) newItemsPerView = 2;
    else if (width < 640) newItemsPerView = 3;
    else if (width < 768) newItemsPerView = 4;
    else if (width < 1024) newItemsPerView = 5;
    else if (width < 1280) newItemsPerView = 6;
    else newItemsPerView = 7;
    
    setItemsPerView(newItemsPerView);
    
    // Calculate item width based on container and items per view
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newItemWidth = containerWidth / newItemsPerView;
      setItemWidth(newItemWidth);
      
      // Reset position when layout changes (desktop only)
      if (categories.length > 0 && isInitialized && !mobile) {
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

  // Start auto-scroll (desktop only)
  const startAutoScroll = useCallback(() => {
    // Only start auto-scroll on desktop
    if (categories.length === 0 || itemWidth === 0 || !isInitialized || isMobile) {
      return;
    }
    
    clearAutoScroll();
    
    autoScrollRef.current = setInterval(() => {
      if (isManualNavigationRef.current) {
        return;
      }
      
      setCurrentTranslate(prev => {
        const newTranslate = prev - itemWidth;
        const maxTranslate = -(categories.length * 2 * itemWidth);
        
        if (newTranslate <= maxTranslate) {
          return -(categories.length * itemWidth);
        }
        
        return newTranslate;
      });
    }, 3000);
  }, [categories.length, itemWidth, isInitialized, isMobile, clearAutoScroll]);

  // Mobile scroll handler
  const handleMobileScroll = useCallback(() => {
    if (!containerRef.current || !isMobile) return;
    
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    
    // Calculate progress (based on position within the middle set)
    const singleSetWidth = scrollWidth / 3;
    const positionInMiddleSet = (scrollLeft % singleSetWidth) / singleSetWidth;
    setScrollProgress(positionInMiddleSet * 100);
  }, [isMobile]);

  // Initialize mobile scroll position
  useEffect(() => {
    if (isMobile && containerRef.current && categories.length > 0 && isInitialized) {
      const container = containerRef.current;
      const singleSetWidth = container.scrollWidth / 3;
      container.scrollLeft = singleSetWidth;
    }
  }, [isMobile, categories.length, isInitialized]);

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
      if (!isMobile) {
        const initialPosition = -(categories.length * itemWidth);
        setCurrentTranslate(initialPosition);
      }
      setIsInitialized(true);
    }
  }, [categories.length, itemWidth, isInitialized, isMobile]);

  // Start auto-scroll when everything is ready (desktop only)
  useEffect(() => {
    if (isInitialized && itemWidth > 0 && categories.length > 0 && !isMobile) {
      const timer = setTimeout(() => {
        startAutoScroll();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        clearAutoScroll();
      };
    }
  }, [isInitialized, itemWidth, categories.length, isMobile, startAutoScroll, clearAutoScroll]);

  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = '/assets/images/placeholder.jpg';
  }, []);

  // Navigation functions (desktop only)
  const goToPrevious = useCallback(() => {
    if (categories.length === 0 || itemWidth === 0 || !isInitialized || isMobile) return;
    
    isManualNavigationRef.current = true;
    clearAutoScroll();
    
    setCurrentTranslate(prev => {
      const newTranslate = prev + itemWidth;
      const minTranslate = -(categories.length * itemWidth);
      
      if (newTranslate > minTranslate) {
        return -(categories.length * 2 * itemWidth) + itemWidth;
      }
      
      return newTranslate;
    });
    
    setTimeout(() => {
      isManualNavigationRef.current = false;
      startAutoScroll();
    }, 4000);
  }, [categories.length, itemWidth, isInitialized, isMobile, clearAutoScroll, startAutoScroll]);

  const goToNext = useCallback(() => {
    if (categories.length === 0 || itemWidth === 0 || !isInitialized || isMobile) return;
    
    isManualNavigationRef.current = true;
    clearAutoScroll();
    
    setCurrentTranslate(prev => {
      const newTranslate = prev - itemWidth;
      const maxTranslate = -(categories.length * 2 * itemWidth);
      
      if (newTranslate <= maxTranslate) {
        return -(categories.length * itemWidth);
      }
      
      return newTranslate;
    });
    
    setTimeout(() => {
      isManualNavigationRef.current = false;
      startAutoScroll();
    }, 4000);
  }, [categories.length, itemWidth, isInitialized, isMobile, clearAutoScroll, startAutoScroll]);

  // Pause auto-scroll on hover (desktop only)
  const handleMouseEnter = useCallback(() => {
    if (!isMobile) clearAutoScroll();
  }, [isMobile, clearAutoScroll]);

  const handleMouseLeave = useCallback(() => {
    if (!isManualNavigationRef.current && isInitialized && !isMobile) {
      startAutoScroll();
    }
  }, [isMobile, startAutoScroll, isInitialized]);

  // Loading Skeleton UI
  if (loading && categories.length === 0) {
    return (
      <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gray-50/30">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 text-center">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-200 rounded-md mx-auto mb-8 sm:mb-12"></div>
            <div className="hidden lg:grid grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 mb-3"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded-md mt-2"></div>
                </div>
              ))}
            </div>
            <div className="lg:hidden h-32 sm:h-40 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </section>
    );
  }

  // No Categories to show
  if (categories.length === 0) {
    return (
      <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gray-50/30">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 text-center">
          <p className="text-sm sm:text-base text-gray-500">No categories found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gray-50/30">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Categories</h2>
          <div className="flex justify-center items-center mt-3 sm:mt-4">
            <div className="w-3 h-1 bg-pink-200 rounded"></div>
            <div className="w-6 sm:w-8 h-1 bg-gradient-to-r from-pink-500 to-pink-500 rounded mx-1"></div>
            <div className="w-3 h-1 bg-pink-200 rounded"></div>
          </div>
        </div>
        
        {/* Main Content */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Mobile: Free horizontal scroll with native scrolling OR Grid View */}
          {isMobile ? (
            <>
              {showGridView ? (
                /* Grid View for Mobile */
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {categories.map((category) => (
                    <Link 
                      key={category.id}
                      to={category.path} 
                      className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded-lg py-2"
                    >
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 border-2 border-gray-200 ${category.bgColor || 'bg-gray-100'} ${category.hoverColor || 'hover:bg-gray-200'} flex items-center justify-center mb-2 sm:mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`} style={{ borderRadius: '50% 0 50% 50%' }}>
                        <img 
                          src={category.image || '/assets/images/placeholder.jpg'} 
                          alt={`${category.name} category`} 
                          className={`${category.name.toLowerCase() === 'beauty' ? 'w-[4.5rem] h-[4.5rem]' : category.imageSize || 'w-10 h-10'} sm:w-14 sm:h-14 object-contain transition-transform duration-300 group-hover:scale-110`}
                          onError={handleImageError} 
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-800 text-center line-clamp-1 group-hover:text-pink-600 transition-colors duration-200 capitalize px-1">
                        {category.name}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                        {category.productCount} Product{category.productCount !== 1 ? 's' : ''}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Horizontal Scroll View */
                <>
                  <div 
                    ref={containerRef} 
                    className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
                    onScroll={handleMobileScroll}
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  >
                    <div className="flex">
                      {duplicatedCategories.map((category, index) => (
                        <div
                          key={`${category.id}-${Math.floor(index / categories.length)}`}
                          className="flex-shrink-0 px-1"
                          style={{ width: `${100 / itemsPerView}%` }}
                        >
                          <Link 
                            to={category.path} 
                            className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded-lg py-1 sm:py-2"
                          >
                            <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 border-gray-200 ${category.bgColor || 'bg-gray-100'} ${category.hoverColor || 'hover:bg-gray-200'} flex items-center justify-center mb-2 sm:mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`} style={{ borderRadius: '50% 0 50% 50%' }}>
                              <img 
                                src={category.image || '/assets/images/placeholder.jpg'} 
                                alt={`${category.name} category`} 
                                className={`${category.name.toLowerCase() === 'beauty' ? 'w-[4.5rem] h-[4.5rem]' : category.imageSize || 'w-10 h-10'} sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain transition-transform duration-300 group-hover:scale-110`}
                                onError={handleImageError} 
                                loading="lazy"
                              />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-800 text-center line-clamp-1 group-hover:text-pink-600 transition-colors duration-200 capitalize px-1">
                              {category.name}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                              {category.productCount} Product{category.productCount !== 1 ? 's' : ''}
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Progress line indicator for mobile */}
                  <div className="flex justify-center mt-4">
                    <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${scrollProgress}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
              
              {/* See All / Show Less Button for Mobile */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowGridView(!showGridView)}
                  className="px-6 py-2 text-sm font-medium text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 underline"
                >
                  {showGridView ? 'Show Less' : 'See All'}
                </button>
              </div>
            </>
          ) : (
            /* Desktop: Infinite carousel with auto-scroll */
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
                    className="flex-shrink-0 px-1 sm:px-2"
                    style={{ width: `${100 / duplicatedCategories.length}%` }}
                  >
                    <Link 
                      to={category.path} 
                      className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded-lg py-1 sm:py-2"
                    >
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 border-gray-200 ${category.bgColor || 'bg-gray-100'} ${category.hoverColor || 'hover:bg-gray-200'} flex items-center justify-center mb-2 sm:mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`} style={{ borderRadius: '50% 0 50% 50%' }}>
                        <img 
                          src={category.image || '/assets/images/placeholder.jpg'} 
                          alt={`${category.name} category`} 
                          className={`${category.imageSize || 'w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16'} object-contain transition-transform duration-300 group-hover:scale-110`}
                          onError={handleImageError} 
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-800 text-center line-clamp-1 group-hover:text-pink-600 transition-colors duration-200 capitalize px-1">
                        {category.name}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                        {category.productCount} Product{category.productCount !== 1 ? 's' : ''}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Arrows - Hide on mobile, show on tablet and up */}
          {categories.length > itemsPerView && isInitialized && !isMobile && (
            <>
              <button 
                onClick={goToPrevious}
                className="absolute -left-1 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border flex items-center justify-center transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 active:scale-95"
                aria-label="Previous slide"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={goToNext}
                className="absolute -right-1 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border flex items-center justify-center transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 active:scale-95"
                aria-label="Next slide"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default Categories;