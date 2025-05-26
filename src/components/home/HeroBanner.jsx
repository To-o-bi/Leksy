import React from 'react';

const HeroBanner = () => {
  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Decorative floating petals */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 bg-pink-200 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-10 h-10 bg-pink-100 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-60 left-1/4 w-4 h-4 bg-pink-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-60 right-1/4 w-6 h-6 bg-pink-300 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-32 right-1/3 w-5 h-5 bg-pink-200 rounded-full opacity-50 animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto pt-16 pb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Your <span className="text-pink-500 relative">
              Beauty
              <span className="absolute -top-1 -right-1 text-pink-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
                  <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
                </svg>
              </span>
            </span>,
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-gray-800">
            Our Priority{' '}
            <span className="inline-flex items-center">
              <span className="text-pink-500 mr-2">💖</span>
              <span className="text-pink-400">💕</span>
            </span>
          </h2>
          
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Shop our best-selling skincare & cosmetics, designed for radiant, flawless skin.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={() => window.location.href = '/shop'}
              className="group bg-pink-500 text-white py-4 px-8 rounded-full font-semibold text-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              Explore our Products
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              onClick={() => window.location.href = '/consultation'}
              className="group border-2 border-pink-500 text-pink-500 py-4 px-8 rounded-full font-semibold text-lg hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              Book Consultation
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0v1m0-1h6m-6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Hero Models Image - Full height, no cropping */}
        <div className="w-full max-w-6xl mx-auto relative">
          <img 
            src="/assets/images/avatars/models.png" 
            alt="Beautiful women showcasing radiant, flawless skin"
            className="w-full h-auto object-contain"
          />
          {/* Subtle blur gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
          
          {/* Scroll indicator positioned over the image */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center">
            <div className="flex flex-col items-center animate-bounce">
              {/* White layer blur effect container */}
              <div 
                className="px-6 py-4 rounded-2xl flex flex-col items-center cursor-pointer hover:bg-white/70 transition-all duration-300"
                onClick={() => {
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                  });
                }}
              >
                {/* Oval outline shape */}
                <div className="w-12 h-20 border-2 border-gray-500 rounded-full flex items-center justify-center mb-3 bg-transparent">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-gray-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                {/* Text */}
                <p className="text-sm text-gray-700 font-medium text-center">
                  Your Skincare Journey Starts Here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;