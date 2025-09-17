import React, { useCallback } from 'react';

const ScrollIndicator = () => {
  const handleScrollDown = useCallback(() => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }, []);

  return (
    <div className="scroll-indicator invisible absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-full text-center">
      <div className="inline-block cursor-pointer group" onClick={handleScrollDown}>
        <div className="relative w-8 h-16 border-2 border-gray-300 rounded-full flex items-end justify-center pb-2 mb-3 group-hover:border-pink-400 transition-colors duration-300 bg-white/50">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-4 h-4 text-gray-400 group-hover:text-pink-400 transition-colors duration-300 animate-bounce" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2.5}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 5v14m0 0l7-7m-7 7l-7-7" 
            />
          </svg>
          <div className="absolute inset-0 rounded-full border-2 border-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
      </div>
      <p className="mt-1 text-gray-500 text-sm tracking-widest font-light">
        Your Skincare Journey Starts Here
      </p>
    </div>
  );
};

export default ScrollIndicator;