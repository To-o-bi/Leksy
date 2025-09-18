import React from 'react';
import { Link } from 'react-router-dom';

const HeroTitle = () => {
  return (
    <div className="text-center max-w-4xl mx-auto pt-8 pb-4 flex-shrink-0 relative">
      <h1 className="hero-title invisible relative z-10 text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight text-gray-800 flex items-center justify-center gap-x-2">
        Your <span className="text-pink-500">Beauty,</span> Our Priority           
      </h1>
      
      <p className="hero-subtitle invisible relative z-10 text-sm md:text-base lg:text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
        Shop our best-selling skincare & cosmetics, designed for radiant, flawless skin.
      </p>
      
      <div className="hero-buttons invisible relative flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
        <Link 
          to="/shop" 
          className="relative z-10 group bg-pink-500 text-white py-2.5 px-6 rounded-full font-semibold text-sm hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
        >
          Explore Products
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        
        <Link 
          to="/consultation" 
          className="relative z-10 group border-2 border-pink-500 text-pink-500 py-2.5 px-6 rounded-full font-semibold text-sm hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
        >
          Book Consultation
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0v1m0-1h6m-6 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default HeroTitle;