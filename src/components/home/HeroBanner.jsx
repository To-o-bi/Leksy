import React, { useEffect } from 'react';
import HeroTitle from './banner/HeroTitle';
import HeroCards from './banner/HeroCards';
import ScrollIndicator from './banner/ScrollIndicator';
import SocialMediaWidget from './banner/SocialMediaWidget';

const HeroBanner = () => {
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

      sr.reveal('.scroll-indicator', { 
        origin: 'bottom', 
        delay: 900,
        duration: 800 
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
    <section className="relative h-screen bg-white overflow-hidden flex flex-col font-sans">
      
      {/* Background Blur Images */}
      <div className="absolute inset-0 z-0">
        {/* Main/Right blur image */}
        <img 
          src="/assets/images/hero/blur-1.png" 
          alt="" 
          className="hero-bg-main w-full h-full object-cover"
          loading="lazy" 
        />
        
        {/* Left blur image */}
        <img 
          src="/assets/images/hero/blur-1.png" 
          alt="" 
          className="hero-bg-left absolute top-0 left-0 w-1/2 h-full object-cover opacity-70"
          loading="lazy" 
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col h-full">
        {/* Hero Title Section */}
        <HeroTitle />
        
        {/* Hero Cards Section */}
        <HeroCards />

        {/* Scroll Indicator */}
        <ScrollIndicator />

        {/* Social Media Widget */}
        <SocialMediaWidget />
      </div>
    </section>
  );
};

export default HeroBanner;