import React, { useState, useEffect } from 'react';

const ImageCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      imageUrl: "/assets/images/contact/frame-1.png",
      alt: "Leksy Cosmetics skincare products showcase"
    },
    {
      id: 2,
      imageUrl: "/assets/images/contact/frame-2.png",
      alt: "Natural skincare ingredients and products"
    },
    {
      id: 3,
      imageUrl: "/assets/images/contact/frame-3.png",
      alt: "Happy customer using Leksy Cosmetics products"
    },
    {
      id: 4,
      imageUrl: "/assets/images/contact/frame-4.png",
      alt: "Premium skincare collection display"
    }
  ];

  // Auto-sliding functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="rounded-lg overflow-hidden bg-gray-100 mb-6 relative h-48 sm:h-56 md:h-64 lg:h-72">
      <div className="h-full relative">
        <div
          className="flex transition-transform duration-1000 h-full"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full flex-shrink-0">
              <img
                src={slide.imageUrl}
                alt={slide.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-colors ${
                activeSlide === index ? 'bg-pink-500' : 'bg-white bg-opacity-60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;