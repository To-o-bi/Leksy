import React from 'react';

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
           <div className="flex items-center justify-center space-x-2">
                {/* Card 1 */}
                <div className="transform rotate-[-15deg] translate-y-8 z-0 w-48 h-56 sm:w-56 sm:h-64 rounded-2xl bg-white shadow-xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:rotate-[-12deg] hover:z-30">
                    <img src="https://images.unsplash.com/photo-1556228852-6d45a7ae2673?w=400&h=500&fit=crop" alt="Woman with face mask" className="w-full h-full object-cover"/>
                </div>
                {/* Card 2 */}
                <div className="transform rotate-[-5deg] -translate-y-4 z-10 w-48 h-56 sm:w-56 sm:h-64 rounded-2xl bg-white shadow-xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:rotate-[-3deg] hover:z-30">
                    <img src="https://images.unsplash.com/photo-1614748839853-f724249a5b3a?w=400&h=500&fit=crop" alt="Woman applying cream" className="w-full h-full object-cover"/>
                </div>
                {/* Card 3 */}
                <div className="transform rotate-[5deg] -translate-y-4 z-20 w-48 h-56 sm:w-56 sm:h-64 rounded-2xl bg-white shadow-xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:rotate-[3deg] hover:z-30">
                    <img src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=500&fit=crop" alt="Woman applying skincare in mirror" className="w-full h-full object-cover"/>
                </div>
                {/* Card 4 */}
                <div className="transform rotate-[15deg] translate-y-8 z-10 w-48 h-56 sm:w-56 sm:h-64 rounded-2xl bg-white shadow-xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:rotate-[12deg] hover:z-30">
                    <img src="https://images.unsplash.com/photo-1590393431327-5154e1a0c00a?w=400&h=500&fit=crop" alt="Relaxing woman with eyes closed" className="w-full h-full object-cover"/>
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

