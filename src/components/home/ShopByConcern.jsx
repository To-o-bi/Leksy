import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, useInView, useMotionValue, animate } from 'framer-motion';

const ShopByConcern = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  const [cardWidth, setCardWidth] = useState(350);
  const [isMobile, setIsMobile] = useState(false);

  // Using a motion value is more performant for animations
  const x = useMotionValue(0);

  const concerns = [
    { id: 1, title: 'Acne and Blemishes', image: '/assets/images/concerns/acne.png', concern: 'Acne' },
    { id: 2, title: 'Dry Skin', image: '/assets/images/concerns/dry-skin.png', concern: 'Dry Skin' },
    { id: 3, title: 'Anti-Aging and Wrinkles', image: '/assets/images/concerns/anti-aging.png', concern: 'Anti-Aging' },
    { id: 4, title: 'Hyperpigmentation', image: '/assets/images/concerns/hyperpigmentation.png', concern: 'Hyperpigmentation' },
    { id: 5, title: 'Oily Skin', image: '/assets/images/concerns/oily-skin.png', concern: 'Oily Skin' },
    { id: 6, title: 'Sensitive Skin', image: '/assets/images/concerns/dry-skin.png', concern: 'Sensitive Skin' },
    // Duplicates are essential for the seamless loop effect
    { id: 7, title: 'Acne and Blemishes', image: '/assets/images/concerns/acne.png', concern: 'Acne' },
    { id: 8, title: 'Dry Skin', image: '/assets/images/concerns/dry-skin.png', concern: 'Dry Skin' },
    { id: 9, title: 'Anti-Aging and Wrinkles', image: '/assets/images/concerns/anti-aging.png', concern: 'Anti-Aging' },
    { id: 10, title: 'Hyperpigmentation', image: '/assets/images/concerns/hyperpigmentation.png', concern: 'Hyperpigmentation' },
    { id: 11, title: 'Oily Skin', image: '/assets/images/concerns/oily-skin.png', concern: 'Oily Skin' },
    { id: 12, title: 'Sensitive Skin', image: '/assets/images/concerns/dry-skin.png', concern: 'Sensitive Skin' },
  ];

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  useEffect(() => {
    const updateCarouselProperties = () => {
      const isMobileView = window.innerWidth < 768; // md breakpoint
      setIsMobile(isMobileView);

      if (window.innerWidth < 640) setCardWidth(250); // sm
      else if (window.innerWidth < 768) setCardWidth(280); // md
      else if (window.innerWidth < 1024) setCardWidth(300); // lg
      else setCardWidth(350);
    };

    updateCarouselProperties();
    window.addEventListener('resize', updateCarouselProperties);
    return () => window.removeEventListener('resize', updateCarouselProperties);
  }, []);

  // Autoscroll & Seamless Loop Animation
  useEffect(() => {
    let animation;

    const startAnimation = () => {
      stopAnimation(); // Stop any existing animation
      animation = animate(x, [-carouselRef.current.scrollWidth / 2, 0], {
        ease: 'linear',
        duration: 30, // Adjust duration for speed
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
      });
    };

    const stopAnimation = () => {
      animation?.stop();
    };

    // Start animation only when we have the width
    if (carouselRef.current?.scrollWidth) {
      startAnimation();
    }

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', stopAnimation);
      container.addEventListener('mouseleave', startAnimation);
    }

    return () => {
      stopAnimation();
      if (container) {
        container.removeEventListener('mouseenter', stopAnimation);
        container.removeEventListener('mouseleave', startAnimation);
      }
    };
  }, [x, cardWidth]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk0YTNiOCI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
  };

  const handleConcernClick = (concern, e) => {
    // Framer motion's drag detection is more reliable
    const wasDragged = x.getVelocity() !== 0;
    if (wasDragged) {
      e.preventDefault();
      return;
    }
    navigate('/shop', { state: { filterByConcern: true, concerns: [concern] } });
  };

  const handleNavClick = (direction) => {
    const cardAndGapWidth = cardWidth + 24; // card width + md:gap-6
    let currentX = x.get();
    // Snap to the nearest card in the chosen direction
    const targetX = direction === 'next'
      ? Math.floor(currentX / cardAndGapWidth) * cardAndGapWidth - cardAndGapWidth
      : Math.ceil(currentX / cardAndGapWidth) * cardAndGapWidth + cardAndGapWidth;

    const finalX = Math.max(-carouselRef.current.scrollWidth + carouselRef.current.offsetWidth, Math.min(0, targetX));

    animate(x, finalX, { type: 'spring', stiffness: 400, damping: 40 });
  };

  const containerVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } } };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gray-50 overflow-hidden" ref={containerRef}>
      <motion.div className="container mx-auto px-4" initial="hidden" animate={controls} variants={containerVariants}>
        <motion.div className="text-center mb-4 sm:mb-6" variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>
          <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Shop by Concern</h2>
          <div className="flex justify-center items-center mt-3 mb-4 sm:mt-4 sm:mb-6 md:mb-8">
            <div className="w-3 sm:w-4 h-1 bg-pink-200 rounded"></div>
            <div className="w-6 sm:w-8 h-1 bg-pink-500 rounded mx-1"></div>
            <div className="w-3 sm:w-4 h-1 bg-pink-200 rounded"></div>
          </div>
          <p className="text-gray-600 max-w-2xl text-center mx-auto text-sm sm:text-base md:text-lg">
            We know how frustrating it can be to find the right skincare products. <span className="hidden sm:inline"><br /></span> That's why we've made it easier for you! 💖
          </p>
        </motion.div>

        <div className="w-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-12 sm:w-16 md:w-24 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 h-full w-12 sm:w-16 md:w-24 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

          {/* --- Hide navigation buttons on mobile/tablet --- */}
          {!isMobile && (
            <>
              <button className="absolute left-2 sm:left-3 md:left-5 top-1/2 -translate-y-1/2 rounded-full p-2 sm:p-3 bg-white shadow-md hover:bg-pink-100 transition-colors z-20" onClick={() => handleNavClick('prev')} aria-label="Previous items">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="absolute right-2 sm:right-3 md:right-5 top-1/2 -translate-y-1/2 rounded-full p-2 sm:p-3 bg-white shadow-md hover:bg-pink-100 transition-colors z-20" onClick={() => handleNavClick('next')} aria-label="Next items">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          <motion.div
            ref={carouselRef}
            className="flex gap-3 sm:gap-4 md:gap-6 py-4 px-2 sm:px-4 cursor-grab"
            style={{ x }}
            drag="x"
            dragConstraints={{ right: 0, left: -(carouselRef.current?.scrollWidth - carouselRef.current?.offsetWidth || 0) }}
            whileTap={{ cursor: "grabbing" }}
          >
            {concerns.map((concern) => (
              <motion.div
                key={concern.id}
                className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-lg select-none"
                style={{ minWidth: `${cardWidth}px` }}
                whileHover={{ scale: 1.025, transition: { duration: 0.3 } }}
              >
                <div className="block h-full w-full" onClick={(e) => handleConcernClick(concern.concern, e)}>
                  <div className="relative h-full w-full overflow-hidden">
                    <motion.img src={concern.image} alt={concern.title} className="w-full h-full object-cover pointer-events-none" onError={handleImageError} whileHover={{ scale: 1.05 }} transition={{ duration: 0.5 }} />
                    <motion.div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-3 sm:p-4 md:p-6" initial={{ opacity: 0.8 }} whileHover={{ opacity: 1 }}>
                      <div className="flex justify-between items-center w-full">
                        <motion.div>
                          <h3 className="text-white text-base sm:text-lg md:text-xl font-semibold">{concern.title}</h3>
                          <p className="text-white/80 text-xs sm:text-sm mt-1">Discover solutions</p>
                        </motion.div>
                        <motion.div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group" whileHover={{ scale: 1.1, backgroundColor: "#ec4899", transition: { duration: 0.2 } }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="7" y1="17" x2="17" y2="7"></line>
                            <polyline points="7 7 17 7 17 17"></polyline>
                          </svg>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mt-4 sm:mt-6 text-center text-gray-400 text-xs sm:text-sm md:hidden">
          <span>Swipe to explore more concerns →</span>
        </div>
      </motion.div>
    </section>
  );
};

export default ShopByConcern;