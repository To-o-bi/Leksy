import React from 'react';
import { Link } from 'react-router-dom';

const HeroBanner = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background bubbles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-24 h-24 bg-pink-100 rounded-full opacity-50"></div>
        <div className="absolute top-10 right-20 w-16 h-16 bg-pink-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-pink-100 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-pink-100 rounded-full opacity-60"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Where Every <span className="text-pink-500">Skincare</span> <br />
              Moment Counts
            </h1>
            <p className="text-gray-600 mb-8 max-w-lg">
              At Leksy Cosmetics, we believe that everyone will look and feel their best with proper, it well-cared-for skin.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link to="/shop" className="bg-pink-500 text-white py-3 px-6 rounded-full font-medium hover:bg-pink-600 transition-colors flex items-center justify-center">
                Explore our Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/consultation" className="border border-pink-500 text-pink-500 py-3 px-6 rounded-full font-medium hover:bg-pink-50 transition-colors flex items-center justify-center">
                Book Consultation
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <img 
              src="/assets/images/hero-product.png" 
              alt="Skincare Products" 
              className="max-w-full"
            />
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center">
            <span className="text-xs text-gray-500">Shop directly from the source</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-2 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;