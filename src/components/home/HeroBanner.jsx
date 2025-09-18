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
    }
  }, []);

  return (
    <section className="relative h-screen bg-white overflow-hidden flex flex-col font-sans">
      
      {/* Background Blur Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/images/hero/blur-1.png" 
          alt="" 
          className="w-full h-full object-cover"
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