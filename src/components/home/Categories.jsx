import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../assets/dummy/data'; // Import categories from data.js

const Categories = () => {
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [showArrows, setShowArrows] = useState(false);
  
  // Category colors and styles mapping - enhanced with gradients
  const categoryStyles = [
    { bgColor: 'bg-gradient-to-br from-pink-50 to-pink-100', hoverColor: 'hover:from-pink-100 hover:to-pink-200', borderColor: 'border-pink-200' },
    { bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100', hoverColor: 'hover:from-amber-100 hover:to-amber-200', borderColor: 'border-amber-200' },
    { bgColor: 'bg-gradient-to-br from-green-50 to-green-100', hoverColor: 'hover:from-green-100 hover:to-green-200', borderColor: 'border-green-200' },
    { bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100', hoverColor: 'hover:from-purple-100 hover:to-purple-200', borderColor: 'border-purple-200' },
    { bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', hoverColor: 'hover:from-blue-100 hover:to-blue-200', borderColor: 'border-blue-200' },
    { bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100', hoverColor: 'hover:from-rose-100 hover:to-rose-200', borderColor: 'border-rose-200' },
  ];

  // Map our categories to include styling
  const categoriesWithStyles = categories.map((category, index) => ({
    ...category,
    path: `/shop?category=${encodeURIComponent(category.name)}`,
    bgColor: categoryStyles[index % categoryStyles.length].bgColor,
    hoverColor: categoryStyles[index % categoryStyles.length].hoverColor,
    borderColor: categoryStyles[index % categoryStyles.length].borderColor,
  }));

  // Responsive breakpoints handler
  const updateLayout = useCallback(() => {
    const width = window.innerWidth;
    let newItemsPerView;
    
    if (width < 480) {
      newItemsPerView = 1;
    } else if (width < 640) {
      newItemsPerView = 2;
    } else if (width < 768) {
      newItemsPerView = 3;
    } else if (width < 1024) {
      newItemsPerView = 4;
    } else if (width < 1280) {
      newItemsPerView = 5;
    } else {
      newItemsPerView = 6;
    }
    
    setItemsPerView(newItemsPerView);
    setShowArrows(categoriesWithStyles.length > newItemsPerView);
    
    // Reset to first slide if current index is out of bounds
    const maxIndex = Math.max(0, categoriesWithStyles.length - newItemsPerView);
    if (currentIndex > maxIndex) {
      setCurrentIndex(0);
    }
  }, [currentIndex, categoriesWithStyles.length]);

  useEffect(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [updateLayout]);

  // Navigation functions
  const maxIndex = Math.max(0, categoriesWithStyles.length - itemsPerView);
  
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
  }, [maxIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
  }, [maxIndex]);

  // Auto-slide functionality
  useEffect(() => {
    if (!showArrows) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [goToNext, showArrows]);

  // Optimized image error handling
  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ij48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIj48L3BvbHlsaW5lPjwvc3ZnPg==';
  }, []);

  // Navigation arrows
  const NextArrow = ({ onClick, disabled }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${showArrows ? 'block' : 'hidden'}`}
      aria-label="Next slide"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  );

  const PrevArrow = ({ onClick, disabled }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${showArrows ? 'block' : 'hidden'}`}
      aria-label="Previous slide"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  );

  // Custom line indicator component - enhanced
  const CustomIndicator = () => {
    if (!showArrows || maxIndex === 0) return null;
    
    return (
      <div className="flex justify-center mt-8">
        <div className="bg-gray-200 h-1 w-24 rounded-full relative overflow-hidden">
          <div 
            className="absolute bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%`
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 md:py-16 bg-gray-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Categories</h2>
          <div className="flex justify-center items-center mt-4">
            <div className="w-4 h-1 bg-pink-200 rounded"></div>
            <div className="w-8 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded mx-1"></div>
            <div className="w-4 h-1 bg-pink-200 rounded"></div>
          </div>
        </div>
        
        {/* Desktop view - hidden on mobile and tablet */}
        <div className="hidden lg:grid grid-cols-6 gap-6">
          {categoriesWithStyles.map((category) => (
            <Link 
              key={category.id} 
              to={category.path} 
              className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded-lg"
            >
              <div className={`w-20 h-20 xl:w-24 xl:h-24 rounded-full border-2 ${category.borderColor} ${category.bgColor} ${category.hoverColor} flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-12 h-12 xl:w-16 xl:h-16 object-contain transition-transform duration-300 group-hover:scale-110" 
                  onError={handleImageError} 
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium text-gray-800 text-center group-hover:text-pink-600 transition-colors duration-200">{category.name}</span>
              <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">{category.productCount} Products</span>
            </Link>
          ))}
        </div>
        
        {/* Mobile and Tablet slider */}
        <div className="lg:hidden relative">
          <div 
            ref={containerRef}
            className="overflow-hidden"
          >
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
                width: `${(categoriesWithStyles.length * 100) / itemsPerView}%`
              }}
            >
              {categoriesWithStyles.map((category) => (
                <div
                  key={category.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / categoriesWithStyles.length}%` }}
                >
                  <Link 
                    to={category.path} 
                    className="flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 rounded-lg"
                  >
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 ${category.borderColor} ${category.bgColor} ${category.hoverColor} flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain transition-transform duration-300 group-hover:scale-110" 
                        onError={handleImageError} 
                        loading="lazy"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-800 text-center line-clamp-1 group-hover:text-pink-600 transition-colors duration-200">{category.name}</span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">{category.productCount} Products</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <PrevArrow 
            onClick={goToPrevious} 
            disabled={currentIndex === 0}
          />
          <NextArrow 
            onClick={goToNext} 
            disabled={currentIndex >= maxIndex}
          />

          {/* Custom Indicator */}
          <CustomIndicator />
        </div>
      </div>
    </section>
  );
};

export default Categories;