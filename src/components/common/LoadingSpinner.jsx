import React from 'react';

const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizes = {
    small: 'w-16 h-16',
    default: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  const logoSizes = {
    small: 'w-6 h-6',
    default: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Animated Logo */}
      <div className={`relative ${sizes[size]} mx-auto mb-4`}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-spin-slow"></div>

        {/* Inner pulsing circle */}
        <div className="absolute inset-2 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full animate-pulse"></div>

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <img
            src="/assets/images/icons/leksy-white.png"
            alt="Leksy"
            className={`${logoSizes[size]} object-contain animate-bounce-slow`}
          />
        </div>
      </div>

      {/* Loading text */}
      {text && (
        <p className="text-sm text-gray-600 animate-fade-in">
          {text}
        </p>
      )}

      {/* Custom animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fade-in {
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
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
