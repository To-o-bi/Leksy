import React, { useState, useEffect } from 'react';

// This is the main component for the application.
// I've recreated the hero banner with the requested arc design for the images.
const App = () => {
  return (
    <main className="bg-white">
      <HeroBanner />
    </main>
  );
};

const HeroBanner = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-screen bg-white overflow-hidden flex flex-col font-sans">
      {/* Decorative floating petals */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 bg-pink-200 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-10 h-10 bg-pink-100 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-60 left-1/4 w-4 h-4 bg-pink-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-60 right-1/4 w-6 h-6 bg-pink-300 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-32 right-1/3 w-5 h-5 bg-pink-200 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute top-1/3 left-1/2 w-6 h-6 bg-pink-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-pink-100 rounded-full opacity-40 animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 flex flex-col h-full">
        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto pt-8 pb-6 flex-shrink-0">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 leading-tight text-gray-800 flex items-center justify-center gap-x-2">
            Your <span className="text-pink-500">Beauty,</span> Our Priority
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Shop our best-selling skincare & cosmetics, designed for radiant, flawless skin.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-2">
            <button 
              className="group bg-pink-500 text-white py-3 px-8 rounded-full font-semibold text-base hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              Explore our Products
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              className="group border-2 border-pink-500 text-pink-500 py-3 px-8 rounded-full font-semibold text-base hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              Book Consultation
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0v1m0-1h6m-6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Image Card Section in Arc */}
        <div className="flex-grow relative flex items-center justify-center -mt-8 sm:-mt-12">
           <div className="flex items-center justify-center space-x-[-1.5rem] sm:space-x-[-1rem]">
                {/* Card 1 - Slides from center to left */}
                <div className={`group transform transition-all duration-1000 ease-out w-44 h-60 sm:w-52 sm:h-72 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[-18deg] translate-y-12 translate-x-0 z-0 opacity-100' 
                    : 'rotate-[2deg] -translate-y-6 translate-x-32 z-0 opacity-0'
                } hover:scale-110 hover:rotate-[-10deg] hover:z-40`} 
                style={{ transitionDelay: isAnimating ? '800ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-50 to-white p-1 shadow-2xl hover:shadow-pink-200/50">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-1.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 to-pink-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    </div>
                </div>
                
                {/* Card 2 - Slides from center to left */}
                <div className={`group transform transition-all duration-1000 ease-out w-44 h-60 sm:w-52 sm:h-72 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[-8deg] -translate-y-2 translate-x-0 z-10 opacity-100' 
                    : 'rotate-[2deg] -translate-y-6 translate-x-16 z-10 opacity-0'
                } hover:scale-110 hover:rotate-[-2deg] hover:z-40`}
                style={{ transitionDelay: isAnimating ? '600ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-100 to-white p-1 shadow-2xl hover:shadow-pink-300/60">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-2.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-400/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-300 to-pink-500 rounded-3xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
                    </div>
                </div>
                
                {/* Card 3 - Center (Featured) - First to animate */}
                <div className={`group transform transition-all duration-1800 ease-in-out w-48 h-64 sm:w-56 sm:h-76 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[2deg] -translate-y-6 translate-x-0 z-20 opacity-100' 
                    : 'rotate-[2deg] translate-y-8 translate-x-0 z-20 opacity-0'
                } hover:scale-110 hover:rotate-[1deg] hover:z-40`}
                style={{ transitionDelay: isAnimating ? '200ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-200 to-pink-50 p-1.5 shadow-2xl hover:shadow-pink-400/70">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-3.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-400 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                        {/* Sparkle effect for center card */}
                        <div className="absolute top-2 right-2 w-3 h-3 bg-pink-400 rounded-full opacity-60 animate-ping"></div>
                        <div className="absolute bottom-4 left-3 w-2 h-2 bg-pink-300 rounded-full opacity-40 animate-pulse"></div>
                    </div>
                </div>
                
                {/* Card 4 - Slides from center to right */}
                <div className={`group transform transition-all duration-1000 ease-out w-44 h-60 sm:w-52 sm:h-72 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[8deg] -translate-y-2 translate-x-0 z-10 opacity-100' 
                    : 'rotate-[2deg] -translate-y-6 -translate-x-16 z-10 opacity-0'
                } hover:scale-110 hover:rotate-[2deg] hover:z-40`}
                style={{ transitionDelay: isAnimating ? '600ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-100 to-white p-1 shadow-2xl hover:shadow-pink-300/60">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-4.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-400/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-pink-300 rounded-3xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
                    </div>
                </div>
                
                {/* Card 5 - Slides from center to right */}
                <div className={`group transform transition-all duration-1000 ease-out w-44 h-60 sm:w-52 sm:h-72 cursor-pointer ${
                  isAnimating 
                    ? 'rotate-[18deg] translate-y-12 translate-x-0 z-0 opacity-100' 
                    : 'rotate-[2deg] -translate-y-6 -translate-x-32 z-0 opacity-0'
                } hover:scale-110 hover:rotate-[10deg] hover:z-40`}
                style={{ transitionDelay: isAnimating ? '800ms' : '0ms' }}>
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-pink-50 to-white p-1 shadow-2xl hover:shadow-pink-200/50">
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                            <img src="/assets/images/hero/card-5.jpg" alt="Woman with face mask" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-pink-400 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="relative z-10 text-center pb-8 flex-shrink-0">
            <div className="inline-block p-1 border-2 border-gray-400 rounded-full animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
            </div>
            <p className="mt-2 text-gray-500 text-sm tracking-widest">Your Skincare Journey Starts Here</p>
        </div>
      </div>
    </section>
  );
};

export default App;