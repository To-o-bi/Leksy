import React, { useState } from 'react';

const CTA = () => {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  // GIF URL
  const gifUrl = "/assets/video/skincare-1.gif";

  // Fallback image if GIF fails to load
  const fallbackImageUrl = "/assets/images/skincare-consultation-bg.jpg";

  // Handle media load success
  const handleMediaLoaded = () => {
    setMediaLoaded(true);
  };

  // Handle media load error
  const handleMediaError = () => {
    setMediaError(true);
  };

  return (
    <div className="relative py-16 overflow-hidden">
      {/* GIF Background with Fallback */}
      {!mediaError ? (
        <img
          src={gifUrl}
          alt=""
          className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleMediaLoaded}
          onError={handleMediaError}
        />
      ) : (
        <div
          className="absolute top-0 left-0 w-full h-full bg-center bg-cover z-0"
          style={{ backgroundImage: `url(${fallbackImageUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-5">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/70 to-pink-500/60"></div>
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Skincare Routine?
          </h2>
          <p className="text-white text-lg mb-8">
            Book your personalized consultation today and take the first step towards healthier, more radiant skin.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-3 bg-white text-pink-600 text-lg font-medium rounded-md hover:bg-pink-50 transition-colors"
          >
            Book Your Consultation Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default CTA;
