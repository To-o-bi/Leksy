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
      
      {/* Background Cloud Decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/assets/images/hero/cloud.png" alt="" className="absolute -top-20 -left-40 w-[32rem] h-[32rem] opacity-20 animate-pulse" style={{ animationDuration: '8s' }} loading="lazy" />
        <img src="/assets/images/hero/cloud.png" alt="" className="absolute top-1/4 -right-32 w-[36rem] h-[36rem] opacity-15 animate-pulse" style={{ animationDelay: '-2s', animationDuration: '10s' }} loading="lazy" />
        <img src="/assets/images/hero/cloud.png" alt="" className="absolute bottom-0 -left-20 w-[28rem] h-[28rem] opacity-25 animate-pulse" style={{ animationDelay: '-4s', animationDuration: '9s' }} loading="lazy" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col h-full">
        {/* Hero Title Section */}
        <HeroTitle />
        
        {/* Hero Cards Section */}
        <HeroCards />

        {/* Scroll Indicator */}
        <ScrollIndicator />

        {/* Additional Background Cloud Decorations */}
        <div className="absolute inset-0 z-25 pointer-events-none overflow-hidden">
          <img src="/assets/images/hero/cloud.png" alt="" className="absolute bottom-1/4 -left-32 w-[28rem] h-[28rem] opacity-30 animate-pulse" style={{ animationDelay: '-1s', animationDuration: '11s' }} loading="lazy" />
          <img src="/assets/images/hero/cloud.png" alt="" className="absolute bottom-10 -right-40 w-[36rem] h-[36rem] opacity-25 animate-pulse" style={{ animationDelay: '-3s', animationDuration: '12s' }} loading="lazy" />
        </div>

        {/* Social Media Widget */}
        <SocialMediaWidget />
      </div>
    </section>
  );
};

export default HeroBanner;