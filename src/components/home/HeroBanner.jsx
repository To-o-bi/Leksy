import React from 'react';

const HeroBanner = () => {
  return (
    <section className="relative h-screen bg-white overflow-hidden flex flex-col">
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
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
            Your <span className="text-pink-500 relative">
              Beauty
              <span className="absolute -top-2 -right-2 text-pink-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
                  <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
                </svg>
              </span>
            </span>,
          </h1>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
            Our Priority{' '}
            <span className="inline-flex items-center">
              <span className="text-pink-500 mr-2">💖</span>
              <span className="text-pink-400">💕</span>
            </span>
          </h2>
          
          <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Shop our best-selling skincare & cosmetics, designed for radiant, flawless skin.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button 
              onClick={() => window.location.href = '/shop'}
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
              onClick={() => window.location.href = '/consultation'}
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
        
      {/* Stacked Image Cards Section */}
      {/* Curved/Fanned Image Cards Section */}
      <div className="relative h-80 md:h-96 mt-16 md:mt-20">
        <div className="absolute inset-0 flex items-center justify-center">
          
            {/* Card 1: Far Left */}
            <div className="absolute w-56 h-40 md:w-72 md:h-48 lg:w-80 lg:h-56 transform -rotate-[35deg] -translate-x-[180px] md:-translate-x-[220px] lg:-translate-x-[280px] translate-y-8 md:translate-y-12 z-10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:z-50 hover:-rotate-[30deg]">
              <img 
                src="https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=300&fit=crop&crop=face"
                alt="Woman with glowing skin after treatment"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 2: Left */}
            <div className="absolute w-56 h-40 md:w-72 md:h-48 lg:w-80 lg:h-56 transform -rotate-[15deg] -translate-x-[90px] md:-translate-x-[110px] lg:-translate-x-[140px] -translate-y-2 md:-translate-y-4 z-20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:z-50 hover:-rotate-[10deg]">
              <img 
                src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=300&fit=crop&crop=face"
                alt="Woman applying skincare in mirror"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 3: Center */}
            <div className="absolute w-45 h-80 transform rotate-0 translate-x-0 -translate-y-6 md:-translate-y-8 z-30 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-110 hover:z-50">
              <img 
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop&crop=face"
                alt="Woman relaxing during skincare treatment"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 4: Right */}
            <div className="absolute w-56 h-40 md:w-72 md:h-48 lg:w-80 lg:h-56 transform rotate-[15deg] translate-x-[90px] md:translate-x-[110px] lg:translate-x-[140px] -translate-y-2 md:-translate-y-4 z-20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:z-50 hover:rotate-[10deg]">
              <img 
                src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop&crop=face"
                alt="Woman with face mask enjoying spa treatment"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card 5: Far Right */}
            <div className="absolute w-56 h-40 md:w-72 md:h-48 lg:w-80 lg:h-56 transform rotate-[35deg] translate-x-[180px] md:translate-x-[220px] lg:translate-x-[280px] translate-y-8 md:translate-y-12 z-10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:z-50 hover:rotate-[30deg]">
              <img 
                src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400&h=300&fit=crop&crop=face"
                alt="Woman enjoying facial treatment"
                className="w-full h-full object-cover"
              />
            </div>
        </div>
      </div>
       {/* Scroll Down Indicator */}
       <div className="relative z-10 text-center mt-24 md:mt-32">
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

export default HeroBanner;