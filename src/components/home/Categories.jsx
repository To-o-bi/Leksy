import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';

const Categories = () => {
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [showArrows, setShowArrows] = useState(false);
  
  // Get dynamic categories and loading state from the context
  const { categories, loading } = useProducts();

  // Responsive breakpoints handler
  const updateLayout = useCallback(() => {
    const width = window.innerWidth;
    let newItemsPerView;
    
    if (width < 480) newItemsPerView = 1;
    else if (width < 640) newItemsPerView = 2; // Fixed typo: was newItemsperView
    else if (width < 768) newItemsPerView = 3;
    else if (width < 1024) newItemsPerView = 4;
    else if (width < 1280) newItemsPerView = 5;
    else newItemsPerView = 6;
    
    setItemsPerView(newItemsPerView);
    setShowArrows(categories.length > newItemsPerView);
    
    const maxIndex = Math.max(0, categories.length - newItemsPerView);
    if (currentIndex > maxIndex) {
      setCurrentIndex(0);
    }
  }, [currentIndex, categories.length]);

  useEffect(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [updateLayout]);

  // Navigation functions
  const maxIndex = Math.max(0, categories.length - itemsPerView);
  
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
  }, [maxIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
  }, [maxIndex]);

  // Auto-slide functionality
  useEffect(() => {
    if (!showArrows || categories.length <= itemsPerView) return;
    const interval = setInterval(() => goToNext(), 3000);
    return () => clearInterval(interval);
  }, [goToNext, showArrows, categories.length, itemsPerView]);

  const handleImageError = useCallback((e) => {
    console.log('Image failed to load:', e.target.src); // Debug log
    e.target.onerror = null;
    e.target.src = '/assets/images/placeholder.jpg'; // Updated path
  }, []);

  // Debug: Log categories to see what we're getting
  useEffect(() => {
    if (categories.length > 0) {
      console.log('Categories data:', categories);
    }
  }, [categories]);

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
        <div className="relative">
          <div ref={containerRef} className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
                width: `${Math.max(100, (categories.length / itemsPerView) * 100)}%`
              }}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / Math.max(categories.length, itemsPerView)}%` }}
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
          {showArrows && categories.length > itemsPerView && (
            <>
              <button 
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center transition hover:scale-105 disabled:opacity-50"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={goToNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center transition hover:scale-105 disabled:opacity-50"
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