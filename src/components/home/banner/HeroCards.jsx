import React, { useState, useEffect, useRef, useCallback } from 'react';

const Card = React.memo(({ 
  index, 
  cardImage, 
  cardVideo, 
  centerCardAnimated,
  isAnimating, 
  activeCardIndex,
  className,
  style,
  isMobile
}) => {
  const shouldShowVideo = activeCardIndex === index;
  
  return (
    <div className={`group transform transition-all duration-1000 ease-out cursor-pointer hover:z-40 ${className}`}
         style={style}>
      <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-50 to-white p-1 shadow-2xl hover:shadow-pink-200/50">
        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner relative">
          <img
            src={cardImage}
            alt="Beauty product showcase"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-0 ${shouldShowVideo ? 'opacity-0 scale-105' : 'opacity-100'}`}
            loading="lazy"
          />
          <video
            src={cardVideo}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 ${shouldShowVideo ? 'opacity-100 scale-105' : 'opacity-0'}`}
            preload="none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 to-pink-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        {shouldShowVideo && (
          <>
            <div className="absolute top-2 right-2 w-3 h-3 bg-pink-400 rounded-full opacity-60 animate-ping"></div>
            <div className="absolute bottom-4 left-3 w-2 h-2 bg-pink-300 rounded-full opacity-40 animate-pulse"></div>
          </>
        )}
      </div>
    </div>
  );
});

const HeroCards = () => {
  const [centerCardAnimated, setCenterCardAnimated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [hasCompletedCycle, setHasCompletedCycle] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const sequentialTimerRef = useRef(null);
  const autoPlayRef = useRef(null);

  const cardData = [
    { image: "/assets/images/hero/card-1.jpg", video: "/assets/images/hero/type-1.mp4" },
    { image: "/assets/images/hero/card-2.jpg", video: "/assets/images/hero/type-2.mp4" },
    { image: "/assets/images/hero/card-3.jpg", video: "/assets/images/hero/type-3.mp4" },
    { image: "/assets/images/hero/card-4.jpg", video: "/assets/images/hero/type-4.mp4" },
    { image: "/assets/images/hero/card-5.jpg", video: "/assets/images/hero/type-5.mp4" }
  ];

  // Check if mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-play for mobile carousel
  useEffect(() => {
    if (isMobile && centerCardAnimated) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % cardData.length);
      }, 4000);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isMobile, centerCardAnimated, cardData.length]);

  const playSequentialCards = useCallback(() => {
    if (hasCompletedCycle || isMobile) return;
    
    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex < cardData.length) {
        setActiveCardIndex(currentIndex);
        
        sequentialTimerRef.current = setTimeout(() => {
          setActiveCardIndex(null);
          
          setTimeout(() => {
            currentIndex++;
            playNext();
          }, 500);
        }, 3000);
      } else {
        setHasCompletedCycle(true);
        setActiveCardIndex(null);
      }
    };
    
    playNext();
  }, [cardData.length, hasCompletedCycle, isMobile]);

  useEffect(() => {
    const centerCardTimer = setTimeout(() => {
      setCenterCardAnimated(true);
    }, 500);

    const animationTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 1500);

    const sequentialStartTimer = setTimeout(() => {
      playSequentialCards();
    }, 3500);

    return () => {
      clearTimeout(centerCardTimer);
      clearTimeout(animationTimer);
      clearTimeout(sequentialStartTimer);
      clearTimeout(sequentialTimerRef.current);
    };
  }, [playSequentialCards]);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % cardData.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + cardData.length) % cardData.length);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    clearInterval(autoPlayRef.current);
  };

  const cardConfigs = [
    {
      className: `w-44 h-60 sm:w-52 sm:h-72 ${
        isAnimating 
          ? 'rotate-[-18deg] translate-y-12 translate-x-0 z-0 opacity-100' 
          : 'rotate-[2deg] -translate-y-6 translate-x-32 z-0 opacity-0'
      } hover:scale-110 hover:rotate-[-10deg]`,
      style: { transitionDelay: isAnimating ? '200ms' : '0ms' }
    },
    {
      className: `w-44 h-60 sm:w-52 sm:h-72 ${
        isAnimating 
          ? 'rotate-[-8deg] -translate-y-2 translate-x-0 z-10 opacity-100' 
          : 'rotate-[2deg] -translate-y-6 translate-x-16 z-10 opacity-0'
      } hover:scale-110 hover:rotate-[-2deg]`,
      style: { transitionDelay: isAnimating ? '300ms' : '0ms' }
    },
    {
      className: `w-48 h-64 sm:w-56 sm:h-76 ${
        centerCardAnimated 
          ? 'rotate-[2deg] -translate-y-6 translate-x-0 z-20 opacity-100' 
          : 'rotate-[2deg] translate-y-8 translate-x-0 z-20 opacity-0'
      } hover:scale-110 hover:rotate-[1deg]`,
      style: { transitionDelay: centerCardAnimated ? '100ms' : '0ms', transitionDuration: '1200ms' }
    },
    {
      className: `w-44 h-60 sm:w-52 sm:h-72 ${
        isAnimating 
          ? 'rotate-[8deg] -translate-y-2 translate-x-0 z-10 opacity-100' 
          : 'rotate-[2deg] -translate-y-6 -translate-x-16 z-10 opacity-0'
      } hover:scale-110 hover:rotate-[2deg]`,
      style: { transitionDelay: isAnimating ? '300ms' : '0ms' }
    },
    {
      className: `w-44 h-60 sm:w-52 sm:h-72 ${
        isAnimating 
          ? 'rotate-[18deg] translate-y-12 translate-x-0 z-0 opacity-100' 
          : 'rotate-[2deg] -translate-y-6 -translate-x-32 z-0 opacity-0'
      } hover:scale-110 hover:rotate-[10deg] hover:-translate-y-6 hover:shadow-2xl`,
      style: { transitionDelay: isAnimating ? '200ms' : '0ms' }
    }
  ];

  if (isMobile) {
    return (
      <div className="flex-grow relative flex items-center justify-center px-4">
        <div 
          className="relative w-full max-w-sm mx-auto overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel Container */}
          <div className="relative h-80">
            {cardData.map((card, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  index === currentSlide 
                    ? 'opacity-100 translate-x-0 scale-100 z-10' 
                    : index < currentSlide 
                    ? 'opacity-0 -translate-x-full scale-95 z-0' 
                    : 'opacity-0 translate-x-full scale-95 z-0'
                }`}
              >
                <Card
                  index={index}
                  cardImage={card.image}
                  cardVideo={card.video}
                  centerCardAnimated={centerCardAnimated}
                  isAnimating={false}
                  activeCardIndex={currentSlide === index ? index : null}
                  className="w-full h-full"
                  style={{}}
                  isMobile={true}
                />
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {cardData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide 
                    ? 'w-8 h-2 bg-pink-500' 
                    : 'w-2 h-2 bg-pink-200 hover:bg-pink-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Swipe Hint */}
          {centerCardAnimated && currentSlide === 0 && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-sm flex items-center gap-2 animate-pulse">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span>Swipe to explore</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop view (original fanned layout)
  return (
    <div className="flex-grow relative flex items-start justify-center pt-8 md:pt-12 lg:pt-16">
      <div className="flex items-center justify-center space-x-[-1.5rem] xl:space-x-[-1rem]">
        {cardData.map((card, index) => (
          <Card
            key={index}
            index={index}
            cardImage={card.image}
            cardVideo={card.video}
            centerCardAnimated={centerCardAnimated}
            isAnimating={isAnimating}
            activeCardIndex={activeCardIndex}
            className={cardConfigs[index].className}
            style={cardConfigs[index].style}
            isMobile={false}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCards;