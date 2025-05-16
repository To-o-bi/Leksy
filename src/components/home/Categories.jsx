import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { categories } from '../../assets/dummy/data'; // Import categories from data.js

const Categories = () => {
  const sliderRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);
  
  // Category colors and styles mapping
  const categoryStyles = [
    { bgColor: 'bg-pink-100', hoverColor: 'hover:bg-pink-200' },
    { bgColor: 'bg-amber-50', hoverColor: 'hover:bg-amber-100' },
    { bgColor: 'bg-green-50', hoverColor: 'hover:bg-green-100' },
    { bgColor: 'bg-purple-100', hoverColor: 'hover:bg-purple-200' },
  ];

  // Map our categories to include styling
  const categoriesWithStyles = categories.map((category, index) => ({
    ...category,
    path: `/shop?category=${encodeURIComponent(category.name)}`,
    bgColor: categoryStyles[index % categoryStyles.length].bgColor,
    hoverColor: categoryStyles[index % categoryStyles.length].hoverColor,
  }));

  // Calculate total slides based on the current slidesToShow value
  const totalSlides = Math.ceil(categoriesWithStyles.length / slidesToShow);

  // Update slidesToShow based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setSlidesToShow(1);
      } else if (width < 768) {
        setSlidesToShow(3);
      } else {
        setSlidesToShow(3);
      }
      
      // Reset slider to first slide and refresh on resize
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(0);
        // Use refresh() instead of slickRefresh() which was causing the error
        sliderRef.current.refresh && sliderRef.current.refresh();
      }
    };

    // Set initial value
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        sliderRef.current.slickNext();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [activeSlide]);

  // Slider settings with dynamic configuration
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    // Fix boolean attributes by converting to strings or removing quotes
    centerMode: slidesToShow === 1,
    centerPadding: slidesToShow === 1 ? '40px' : '0',
    beforeChange: (current, next) => setActiveSlide(next),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerMode: false,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '40px',
        }
      }
    ]
  };

  // Custom line indicator component
  const CustomIndicator = ({ activeSlide, totalSlides }) => (
    <div className="flex justify-center mt-8">
      <div className="bg-gray-200 h-1 w-24 rounded relative">
        <div 
          className="absolute bg-pink-500 h-1 rounded transition-all duration-300" 
          style={{ 
            width: `${100 / totalSlides}%`, 
            left: `${(100 / totalSlides) * activeSlide}%` 
          }}
        ></div>
      </div>
    </div>
  );

  // Optimized image error handling
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ij48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIj48L3BvbHlsaW5lPjwvc3ZnPg==';
  };

  // Navigation buttons for mobile
  const NextArrow = (props) => {
    const { onClick } = props;
    return (
      <button 
        onClick={onClick} 
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-800 focus:outline-none md:hidden"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
  };

  const PrevArrow = (props) => {
    const { onClick } = props;
    return (
      <button 
        onClick={onClick} 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-800 focus:outline-none md:hidden"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
  };

  // Update slider settings with custom arrows
  const sliderSettingsWithArrows = {
    ...sliderSettings,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl font-bold mb-2">Categories</h2>
          <div className="flex justify-center items-center mt-4">
            <div className="w-4 h-1 bg-pink-200 rounded"></div>
            <div className="w-8 h-1 bg-pink-500 rounded mx-1"></div>
            <div className="w-4 h-1 bg-pink-200 rounded"></div>
          </div>
        </div>
        
        {/* Desktop view with optimized layout */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-0">
          {categoriesWithStyles.map((category) => (
            <Link 
              key={category.id} 
              to={category.path} 
              className="flex flex-col items-center group"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full ${category.bgColor} ${category.hoverColor} flex items-center justify-center mb-3 transition-colors duration-300`}>
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-contain" 
                  onError={handleImageError} 
                />
              </div>
              <span className="text-sm font-medium text-gray-800 text-center">{category.name}</span>
              <span className="text-xs text-gray-500">{category.productCount} Products</span>
            </Link>
          ))}
        </div>
        
        {/* Mobile slider with enhanced performance */}
        <div className="md:hidden relative">
          <Slider ref={sliderRef} {...sliderSettingsWithArrows}>
            {categoriesWithStyles.map((category) => (
              <div key={category.id} className="px-2">
                <Link to={category.path} className="flex flex-col items-center group">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${category.bgColor} ${category.hoverColor} flex items-center justify-center mb-3 transition-colors duration-300`}>
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain" 
                      onError={handleImageError} 
                      loading="lazy"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center line-clamp-1">{category.name}</span>
                  <span className="text-xs text-gray-500">{category.productCount} Products</span>
                </Link>
              </div>
            ))}
          </Slider>
          <CustomIndicator activeSlide={activeSlide} totalSlides={totalSlides} />
        </div>
      </div>
    </section>
  );
};

export default Categories;