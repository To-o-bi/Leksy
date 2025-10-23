import React, { useEffect, useState } from 'react';
import HeroTitle from './banner/HeroTitle';
import HeroCards from './banner/HeroCards';
import ScrollIndicator from './banner/ScrollIndicator';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Slide images configuration
  const desktopSlides = [
    '/assets/images/slide/big-1.jpg',
    '/assets/images/slide/big-2.jpg',
    '/assets/images/slide/big-3.jpg',
    '/assets/images/slide/big-4.jpg',
  ];

  const mobileSlides = [
    '/assets/images/slide/small-1.jpg',
    '/assets/images/slide/small-2.jpg',
    '/assets/images/slide/small-3.jpg',
    '/assets/images/slide/small-4.jpg',
    '/assets/images/slide/small-5.jpg',
  ];

  // Total slides including the hero content (index 0)
  const totalSlides = Math.max(desktopSlides.length, mobileSlides.length) + 1;

  // Auto-carousel effect - 10s for hero content, 7s for image slides
  useEffect(() => {
    const delay = currentSlide === 0 ? 10000 : 7000; // 10s for hero, 7s for images

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
        setIsTransitioning(false);
      }, 500);
    }, delay);

    return () => clearInterval(interval);
  }, [currentSlide, totalSlides]);

  useEffect(() => {
    const ScrollReveal = window.ScrollReveal;
    if (ScrollReveal) {
      const sr = ScrollReveal({
        distance: '60px',
        duration: 1000,
        delay: 200,
        reset: false,
        viewFactor: 0.2,
      });

      sr.reveal('.hero-title', {
        origin: 'top',
        delay: 300,
        duration: 1200
      });

      sr.reveal('.hero-subtitle', {
        origin: 'top',
        delay: 500,
        duration: 1000
      });

      sr.reveal('.hero-buttons', {
        origin: 'bottom',
        delay: 700,
        duration: 1000
      });

      sr.reveal('.hero-cards', {
        origin: 'bottom',
        delay: 900,
        duration: 1000
      });

      // Animate background images after all other elements
      sr.reveal('.hero-bg-main', {
        origin: 'top',
        delay: 1200,
        duration: 1000
      });

      sr.reveal('.hero-bg-left', {
        origin: 'top',
        delay: 1400,
        duration: 1000
      });
    }
  }, []);

  return (
    <section
      className={`relative bg-white overflow-hidden flex flex-col font-sans transition-all duration-500 ${
        currentSlide === 0 ? 'h-screen' : 'h-[90vh] md:h-screen'
      }`}
    >

      {/* Carousel Container */}
      <div className="absolute inset-0">
        {/* Slide 0: Original Hero Content with Background Blur */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            currentSlide === 0
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-full pointer-events-none'
          }`}
        >
          {/* Background Blur Images */}
          <div className="absolute inset-0 z-0">
            {/* Main/Right blur image */}
            <img
              src="/assets/images/hero/blur-1.png"
              alt=""
              className="hero-bg-main w-full h-full object-cover"
              loading="lazy"
              style={{ visibility: 'hidden' }}
            />

            {/* Left blur image */}
            <img
              src="/assets/images/hero/blur-1.png"
              alt=""
              className="hero-bg-left absolute top-0 left-0 w-1/2 h-full object-cover"
              loading="lazy"
              style={{ visibility: 'hidden', opacity: 0.7 }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10 flex flex-col h-full">
            {/* Hero Title Section */}
            <HeroTitle />

            {/* Hero Cards Section */}
            <HeroCards />

            {/* Scroll Indicator */}
            <ScrollIndicator />
          </div>
        </div>

        {/* Image Slides (Desktop) */}
        {desktopSlides.map((slide, index) => (
          <div
            key={`desktop-${index}`}
            className={`hidden md:block absolute inset-0 transition-all duration-500 ${
              currentSlide === index + 1
                ? 'opacity-100 translate-x-0'
                : currentSlide < index + 1
                ? 'opacity-0 translate-x-full'
                : 'opacity-0 -translate-x-full'
            }`}
          >
            <img
              src={slide}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}

        {/* Image Slides (Mobile) */}
        {mobileSlides.map((slide, index) => (
          <div
            key={`mobile-${index}`}
            className={`flex md:hidden absolute inset-0 transition-all duration-500 items-start ${
              currentSlide === index + 1
                ? 'opacity-100 translate-x-0'
                : currentSlide < index + 1
                ? 'opacity-0 translate-x-full'
                : 'opacity-0 -translate-x-full'
            }`}
          >
            <img
              src={slide}
              alt={`Slide ${index + 1}`}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Carousel Indicators - Desktop Only */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentSlide(index);
                setIsTransitioning(false);
              }, 500);
            }}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === index
                ? 'bg-pink-500 w-8 h-2'
                : 'bg-white/50 w-2 h-2 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;