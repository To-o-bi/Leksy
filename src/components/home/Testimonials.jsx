import React, { useState, useEffect, useRef } from 'react';

const TestimonialSection = () => {
  const testimonials = [
    {
      id: 1,
      content: "The shopping experience was smooth, and my order arrived quickly. Plus, the packaging is so beautiful! I'm definitely coming back for more.",
      author: 'Sandra O.',
      title: 'Banker',
      avatar: '/assets/images/avatars/avatar-1.jpg',
      rating: 5,
    },
    {
      id: 2,
      content: "I love how personalized the consultations are! The expert advice helped me build the perfect skincare routine. My skin has never looked better!",
      author: 'Chioma A.',
      title: 'Model',
      avatar: '/assets/images/avatars/avatar-2.jpg',
      rating: 5,
    },
    {
      id: 3,
      content: "Finally, a skincare brand that understands my sensitive skin! Leksy's products are soothing and leave my skin feeling soft and hydrated.",
      author: 'Jennifer L.',
      title: 'Makeup Artist',
      avatar: '/assets/images/avatars/avatar-1.jpg',
      rating: 5,
    },
    {
      id: 4,
      content: "Never found products that work this well for my oily skin. The customer service team was also incredibly helpful with recommendations.",
      author: 'Michael T.',
      title: 'Photographer',
      avatar: '/assets/images/avatars/avatar-4.jpg',
      rating: 5,
    },
    {
      id: 5,
      content: "As someone with sensitive skin, finding the right products has been life-changing. My rosacea has calmed down significantly!",
      author: 'Rebecca K.',
      title: 'Teacher',
      avatar: '/assets/images/avatars/avatar-5.jpg',
      rating: 5,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mouseStartX = useRef(0);
  const autoScrollRef = useRef(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  // Total number of possible positions (accounting for responsive views)
  const totalSlides = Math.max(1, testimonials.length - (itemsPerView - 1));

  // Set up responsive behavior with more breakpoints
  useEffect(() => {
    const handleResize = () => {
      let newItemsPerView;
      if (window.innerWidth < 640) {
        newItemsPerView = 1;
      } else if (window.innerWidth < 1024) {
        newItemsPerView = 2;
      } else {
        newItemsPerView = 3;
      }
      
      setItemsPerView(newItemsPerView);
      
      // Adjust active index if needed when screen size changes
      if (activeIndex > testimonials.length - newItemsPerView) {
        setActiveIndex(Math.max(0, testimonials.length - newItemsPerView));
      }
    };

    // Initial setup
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, testimonials.length]);

  // Improved auto-scroll functionality with pause/resume
  useEffect(() => {
    const startAutoScroll = () => {
      if (isAutoScrollEnabled) {
        autoScrollRef.current = setInterval(() => {
          nextSlide();
        }, 6000); // Auto-scroll every 6 seconds
      }
    };

    const stopAutoScroll = () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };

    // Clear any existing interval before setting a new one
    stopAutoScroll();
    
    if (!isDragging && isAutoScrollEnabled) {
      startAutoScroll();
    }

    return () => stopAutoScroll();
  }, [activeIndex, isDragging, isAutoScrollEnabled]);

  // Navigation functions with smooth transitions
  const goToSlide = (index) => {
    // Ensure the index is within valid range
    const validIndex = Math.max(0, Math.min(index, testimonials.length - itemsPerView));
    setActiveIndex(validIndex);
    setDragOffset(0);
  };

  const nextSlide = () => {
    const maxIndex = testimonials.length - itemsPerView;
    setActiveIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      return nextIndex > maxIndex ? 0 : nextIndex;
    });
    setDragOffset(0);
  };

  const prevSlide = () => {
    const maxIndex = testimonials.length - itemsPerView;
    setActiveIndex(prevIndex => {
      const nextIndex = prevIndex - 1;
      return nextIndex < 0 ? maxIndex : nextIndex;
    });
    setDragOffset(0);
  };

  // Enhanced touch event handlers with better edge behavior
  const handleTouchStart = (e) => {
    // Pause auto-scroll during user interaction
    setIsAutoScrollEnabled(false);
    
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // Initialize end position too
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    touchEndX.current = e.touches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    
    // Add resistance at the edges with improved feel
    if ((activeIndex === 0 && diff > 0) || 
        (activeIndex >= testimonials.length - itemsPerView && diff < 0)) {
      setDragOffset(diff * 0.2); // Stronger resistance
    } else {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    // Resume auto-scroll after a delay
    setTimeout(() => setIsAutoScrollEnabled(true), 3000);
    
    const difference = touchStartX.current - touchEndX.current;
    const containerWidth = containerRef.current?.offsetWidth || 1000;
    const slideWidth = containerWidth / itemsPerView;
    
    // Determine if we should navigate based on swipe distance with improved threshold
    if (Math.abs(difference) > slideWidth * 0.15) { // 15% threshold for better UX
      if (difference > 0 && activeIndex < testimonials.length - itemsPerView) {
        // Swiped left - go to next
        nextSlide();
      } else if (difference < 0 && activeIndex > 0) {
        // Swiped right - go to previous
        prevSlide();
      } else {
        // Edge case - just reset
        setDragOffset(0);
      }
    } else {
      // If swipe wasn't far enough, animate back to original position
      setDragOffset(0);
    }
    
    setIsDragging(false);
  };

  // Enhanced mouse event handlers for desktop
  const handleMouseDown = (e) => {
    // Prevent default to avoid text selection during drag
    e.preventDefault();
    
    // Pause auto-scroll during user interaction
    setIsAutoScrollEnabled(false);
    
    setIsDragging(true);
    mouseStartX.current = e.clientX;
    
    // Change cursor to grabbing when mouse down
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const diff = e.clientX - mouseStartX.current;
    
    // Add resistance at the edges with improved feel
    if ((activeIndex === 0 && diff > 0) || 
        (activeIndex >= testimonials.length - itemsPerView && diff < 0)) {
      setDragOffset(diff * 0.2); // Stronger resistance
    } else {
      setDragOffset(diff);
    }
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    
    // Resume auto-scroll after a delay
    setTimeout(() => setIsAutoScrollEnabled(true), 3000);
    
    const difference = mouseStartX.current - e.clientX;
    const containerWidth = containerRef.current?.offsetWidth || 1000;
    const slideWidth = containerWidth / itemsPerView;
    
    // Reset cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
    
    // Determine if we should navigate based on drag distance with improved threshold
    if (Math.abs(difference) > slideWidth * 0.15) { // 15% threshold for better UX
      if (difference > 0 && activeIndex < testimonials.length - itemsPerView) {
        // Dragged left - go to next
        nextSlide();
      } else if (difference < 0 && activeIndex > 0) {
        // Dragged right - go to previous
        prevSlide();
      } else {
        // Edge case - just reset
        setDragOffset(0);
      }
    } else {
      // If drag wasn't far enough, animate back to original position
      setDragOffset(0);
    }
    
    setIsDragging(false);
  };

  // Handle mouse leaving the container with improved behavior
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
      
      // Resume auto-scroll after a delay
      setTimeout(() => setIsAutoScrollEnabled(true), 3000);
      
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    }
  };

  // Improved calculation for translation with spring effect
  const getTranslateValue = () => {
    if (!containerRef.current) return '0px';
    
    const containerWidth = containerRef.current.offsetWidth;
    const slideWidth = containerWidth / itemsPerView;
    
    // Calculate base translation
    const baseTranslation = -(activeIndex * slideWidth);
    
    // Add drag offset if currently dragging
    const dragTranslation = isDragging ? dragOffset : 0;
    
    return `${baseTranslation + dragTranslation}px`;
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Improved Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">What our Clients Say</h2>
          <div className="flex justify-center items-center mt-3 mb-6">
            <div className="w-3 h-1 bg-pink-200 rounded-full"></div>
            <div className="w-6 sm:w-8 h-1 bg-pink-500 rounded-full mx-1"></div>
            <div className="w-3 h-1 bg-pink-200 rounded-full"></div>
          </div>
          <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Discover why our customers love our products and services
          </p>
        </div>
        
        {/* Improved Slider Container */}
        <div className="relative px-2 sm:px-6 md:px-8">
          {/* Navigation arrows with improved positioning and responsiveness */}
          <button
            onClick={prevSlide}
            disabled={activeIndex === 0}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-opacity-50
              ${activeIndex === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white hover:bg-gray-50 text-gray-700 cursor-pointer'}`}
            aria-label="Previous testimonials"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            disabled={activeIndex >= testimonials.length - itemsPerView}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full shadow-lg flex items-center justify-center transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-opacity-50
              ${activeIndex >= testimonials.length - itemsPerView
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 text-white cursor-pointer'}`}
            aria-label="Next testimonials"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Improved Testimonials slider */}
          <div 
            className="overflow-hidden"
            ref={containerRef}
          >
            <div 
              className="flex cursor-grab select-none touch-pan-y"
              style={{ 
                transform: `translateX(${getTranslateValue()})`,
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1.0)'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="flex-shrink-0 px-2 sm:px-3 md:px-4"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full flex flex-col">
                    {/* Quote icon */}
                    <div className="text-pink-200 text-4xl sm:text-5xl md:text-6xl mb-1 sm:mb-2">"</div>
                    
                    {/* Content with better sizing */}
                    <p className="text-gray-700 text-sm sm:text-base flex-grow italic mb-4 sm:mb-6">{testimonial.content}</p>
                    
                    {/* Author info with improved layout */}
                    <div className="flex items-center mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                      <img 
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 border-2 border-pink-50 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/api/placeholder/48/48'; // Fallback image
                        }}
                      />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">{testimonial.author}</p>
                        <p className="text-gray-500 text-xs sm:text-sm">{testimonial.title}</p>
                      </div>
                      <div className="ml-auto">
                        <div className="flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Improved pagination indicators */}
        <div className="flex justify-center mt-6 sm:mt-8 md:mt-10">
          <div className="flex space-x-2 sm:space-x-3">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 sm:h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  index === activeIndex ? 'w-6 sm:w-8 bg-pink-500' : 'w-2 sm:w-3 bg-pink-200 hover:bg-pink-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;