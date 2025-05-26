import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';  
import ProductCard from '../product/ProductCard';
import { BestSellers as getBestSellers } from '../../assets/dummy/data';

const BestSellers = () => {
  const products = getBestSellers();
  
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [screenSize, setScreenSize] = useState('desktop');
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect screen size and set responsive behavior
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width <= 767) {
        setScreenSize('mobile');
        setIsMobile(true);
      } else if (width <= 1023) {
        setScreenSize('tablet');
        setIsMobile(false);
      } else {
        setScreenSize('desktop');
        setIsMobile(false);
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Calculate products per view based on screen size
  const getProductsPerView = () => {
    switch (screenSize) {
      case 'mobile': return 2; // Show 2 products per slide
      case 'tablet': return 2; // Show 2-3 products, paginate by 2
      case 'desktop': return 4; // Show 4-6 products, paginate by 4
      default: return 4;
    }
  };

  const productsPerView = getProductsPerView();
  const totalSlides = Math.ceil(products.length / productsPerView);

  // Auto-scroll every 3 seconds (disabled on mobile for touch-first design)
  useEffect(() => {
    if (isMobile) return; // No auto-scroll on mobile
    
    const interval = setInterval(() => {
      if (!isDragging && scrollContainerRef.current) {
        const nextIndex = (activeIndex + 1) % totalSlides;
        scrollToSlide(nextIndex);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex, isDragging, totalSlides, isMobile]);

  // Enhanced scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current && !isDragging) {
        const container = scrollContainerRef.current;
        const scrollPosition = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        
        let newIndex;
        if (isMobile) {
          // For mobile, calculate based on single product width
          const productCard = container.querySelector('.product-card-container');
          if (productCard) {
            const itemWidth = productCard.offsetWidth;
            newIndex = Math.round(scrollPosition / itemWidth);
          }
        } else {
          // For tablet/desktop, calculate based on container width
          newIndex = Math.round(scrollPosition / containerWidth);
        }
        
        if (newIndex !== activeIndex && newIndex >= 0 && newIndex < totalSlides) {
          setActiveIndex(newIndex);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex, isDragging, totalSlides, isMobile]);

  const scrollToSlide = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      let newScrollPosition;
      
      if (isMobile) {
        // Mobile: scroll by individual product width
        const productCard = container.querySelector('.product-card-container');
        if (productCard) {
          const itemWidth = productCard.offsetWidth;
          newScrollPosition = index * itemWidth;
        }
      } else {
        // Tablet/Desktop: scroll by container width
        const containerWidth = container.offsetWidth;
        newScrollPosition = index * containerWidth;
      }
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
      
      setActiveIndex(index);
    }
  };

  // Enhanced touch and mouse handlers
  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    const x = clientX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * (isMobile ? 1 : 1.5); // Slower scroll on mobile
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollPosition = container.scrollLeft;
      let newIndex;
      
      if (isMobile) {
        const productCard = container.querySelector('.product-card-container');
        if (productCard) {
          const itemWidth = productCard.offsetWidth;
          newIndex = Math.round(scrollPosition / itemWidth);
        }
      } else {
        const containerWidth = container.offsetWidth;
        newIndex = Math.round(scrollPosition / containerWidth);
      }
      
      newIndex = Math.max(0, Math.min(newIndex, totalSlides - 1));
      scrollToSlide(newIndex);
    }
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.pageX);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    handleMove(e.pageX);
  };

  // Touch events (optimized for mobile)
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].pageX);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].pageX);
  };

  // Get CSS classes for responsive layout
  const getProductContainerClasses = () => {
    const baseClasses = "product-card-container flex-shrink-0";
    
    if (isMobile) {
      // Mobile: Show 2 products per slide
      return `${baseClasses} w-1/2 px-2 first:pl-0 last:pr-0`;
    } else if (screenSize === 'tablet') {
      // Tablet: Show 2-3 products
      return `${baseClasses} w-1/2 px-3 first:pl-0 last:pr-0`;
    } else {
      // Desktop: Show 4-6 products
      return `${baseClasses} w-1/4 px-3 first:pl-0 last:pr-0`;
    }
  };

  // Show/hide arrows based on screen size
  const showArrows = !isMobile; // Hide arrows on mobile for touch-first design

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Best Selling Products</h2>
          <Link to="/shop" className="text-sm text-pink-500 flex items-center hover:text-pink-600 transition-colors">
            See all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        {/* Carousel container */}
        <div className="relative">
          {/* Left arrow - Hidden on mobile */}
          {showArrows && (
            <button 
              className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 cursor-pointer hover:bg-pink-100 transition-colors duration-200"
              onClick={() => scrollToSlide(activeIndex > 0 ? activeIndex - 1 : totalSlides - 1)}
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
            className={`flex overflow-x-auto scrollbar-hide scroll-smooth pb-4 ${
              isMobile ? 'snap-x snap-mandatory' : ''
            }`}
            onMouseDown={handleMouseDown}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={handleEnd}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleEnd}
            onTouchMove={handleTouchMove}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className={`${getProductContainerClasses()} ${
                  isMobile ? 'snap-start' : ''
                }`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          {/* Right arrow - Hidden on mobile */}
          {showArrows && (
            <button 
              className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-pink-100 cursor-pointer transition-colors duration-200"
              onClick={() => scrollToSlide((activeIndex + 1) % totalSlides)}
              aria-label="Next products"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Pagination indicators */}
        <div className="flex justify-center items-center mt-8">
          <div className="flex space-x-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                className={`h-1 transition-all duration-300 rounded-full ${
                  index === activeIndex ? 'w-8 bg-pink-500' : 'w-4 bg-gray-300'
                } ${isMobile ? 'h-2' : 'h-1'}`} // Larger indicators on mobile
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Optional: Add swipe instruction for mobile */}
        {isMobile && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">Swipe to see more products</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;