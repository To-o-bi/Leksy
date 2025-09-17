import React, { useState, useEffect, useRef, useCallback } from 'react';

const Card = React.memo(({ 
  index, 
  cardImage, 
  cardVideo, 
  centerCardAnimated,
  isAnimating, 
  activeCardIndex,
  className,
  style
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
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-0 ${shouldShowVideo ? 'opacity-0 scale-105' : 'opacity-100'}`}
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

  const sequentialTimerRef = useRef(null);

  const cardData = [
    { image: "/assets/images/hero/card-1.jpg", video: "/assets/images/hero/type-1.mp4" },
    { image: "/assets/images/hero/card-2.jpg", video: "/assets/images/hero/type-2.mp4" },
    { image: "/assets/images/hero/card-3.jpg", video: "/assets/images/hero/type-3.mp4" },
    { image: "/assets/images/hero/card-4.jpg", video: "/assets/images/hero/type-4.mp4" },
    { image: "/assets/images/hero/card-5.jpg", video: "/assets/images/hero/type-5.mp4" }
  ];

  const playSequentialCards = useCallback(() => {
    // Don't start if we've already completed a full cycle
    if (hasCompletedCycle) return;
    
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
        // Mark as completed after first full cycle
        setHasCompletedCycle(true);
        setActiveCardIndex(null);
      }
    };
    
    playNext();
  }, [cardData.length, hasCompletedCycle]);

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

  return (
    <div className="flex-grow relative flex items-start justify-center pt-2">
      <div className="flex items-center justify-center space-x-[-1.5rem] sm:space-x-[-1rem]">
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
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCards;