import React, { useState, useEffect } from 'react';

const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for all resources to load
    const handleLoad = () => {
      // Add a small delay to ensure everything is truly ready
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    // Check if already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => window.removeEventListener('load', handleLoad);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-spin-slow"></div>

          {/* Inner pulsing circle */}
          <div className="absolute inset-4 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full animate-pulse"></div>

          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <img
              src="/assets/images/icons/leksy-white.png"
              alt="Leksy Cosmetics"
              className="w-full h-full object-contain animate-bounce-slow"
            />
          </div>
        </div>

        {/* Loading text */}
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2 animate-fade-in">
          Leksy Cosmetics
        </h2>
        <p className="text-sm text-gray-500 animate-fade-in-delay">
          Preparing your beauty experience...
        </p>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
