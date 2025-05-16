import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';  
import ProductCard from '../product/ProductCard';
import { BestSellers as getBestSellers } from '../../assets/dummy/data'; // Import from the same data file

const BestSellers = () => {
  const products = getBestSellers(); // Get products from the imported function
  
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const totalSlides = products.length;
  
  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && scrollContainerRef.current) {
        const nextIndex = (activeIndex + 1) % totalSlides;
        scrollToProduct(nextIndex);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex, isDragging, totalSlides]);

  // Calculate which product is currently in view
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current && !isDragging) {
        const scrollPosition = scrollContainerRef.current.scrollLeft;
        const itemWidth = scrollContainerRef.current.querySelector('.product-card-container').offsetWidth;
        const newIndex = Math.round(scrollPosition / itemWidth);
        
        if (newIndex !== activeIndex && newIndex < totalSlides) {
          setActiveIndex(newIndex);
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex, isDragging, totalSlides]);

  const scrollToProduct = (index) => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.querySelector('.product-card-container').offsetWidth;
      const newScrollPosition = index * itemWidth;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
      
      setActiveIndex(index);
    }
  };

  // Mouse and touch event handlers for manual scrolling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.querySelector('.product-card-container').offsetWidth;
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const newIndex = Math.round(scrollPosition / itemWidth);
      
      scrollToProduct(newIndex < totalSlides ? newIndex : totalSlides - 1);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Best Selling Products</h2>
            <Link to="/shop" className="text-sm text-pink-500 flex items-center hover:text-pink-600">
            See all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            </Link>
        </div>
        
        {/* Carousel container */}
        <div className="relative">
          {/* Left arrow */}
          <button 
            className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 cursor-pointer hover:bg-pink-100"
            onClick={() => scrollToProduct(activeIndex > 0 ? activeIndex - 1 : totalSlides - 1)}
            aria-label="Previous product"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Scrollable container with products */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            onMouseDown={handleMouseDown}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={handleDragEnd}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleDragEnd}
            onTouchMove={handleTouchMove}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="product-card-container flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-3 first:pl-0 last:pr-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          {/* Right arrow */}
          <button 
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-pink-100 cursor-pointer"
            onClick={() => scrollToProduct((activeIndex + 1) % totalSlides)}
            aria-label="Next product"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Line indicators */}
        <div className="flex justify-center items-center mt-8">
          <div className="flex space-x-2">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToProduct(index)}
                className={`h-1 transition-all duration-300 rounded-full ${
                  index === activeIndex ? 'w-8 bg-pink-500' : 'w-4 bg-gray-300'
                }`}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;