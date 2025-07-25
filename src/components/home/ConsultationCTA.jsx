import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ConsultationCTA = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const navigate = useNavigate();
  
  // Sample video URL - replace with your actual video path
  const videoUrl = "/assets/video/skincare-2.mp4";
  
  // Fallback image if video fails to load
  const fallbackImageUrl = "/assets/images/skincare-consultation-bg.jpg";

  // Handle video load success
  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  // Handle video load error
  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleConsultationClick = () => {
    // Navigate to consultation page
    navigate('/consultation');
  };

  return (
    <div>
      <section className="relative py-20 md:py-24 text-white overflow-hidden">
        {/* Video Background with Fallback */}
        {!videoError ? (
          <video 
            className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
            {/* Browser will try each source in order until one works */}
          </video>
        ) : (
          <div 
            className="absolute top-0 left-0 w-full h-full bg-center bg-cover z-0"
            style={{ backgroundImage: `url(${fallbackImageUrl})` }}
            aria-hidden="true"
          ></div>
        )}
        
        {/* Gradient Overlay for better text contrast */}
        <div className="absolute top-0 left-0 w-full h-full z-5">
          <div className="w-full h-full bg-gradient-to-r from-pink-600/70 to-pink-500/60"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30"></div>
        </div>
        
        {/* Subtle Moving Pattern Overlay */}
        <div 
          className="absolute top-0 left-0 w-full h-full z-5 opacity-10 animate-pulse" 
          style={{ 
            backgroundImage: 'url(/assets/images/pattern-dots.png)',
            backgroundSize: '30px 30px'
          }}
        ></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4">
              Personalized Skincare
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Skincare Routine?
            </h2>
            
            <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Book your personalized consultation today and take the first step towards healthier, more radiant skin with our expert aestheticians.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleConsultationClick}
                className="px-8 py-3 bg-white text-pink-600 text-lg font-medium rounded-full hover:bg-pink-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Book Your Consultation
              </button>
            </div>
            
            {/* Optional: Add social proof */}
            <div className="mt-10 flex flex-wrap justify-center items-center gap-2">
              <span className="text-white/80 text-sm">Trusted by</span>
              <div className="flex gap-3 items-center">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded text-xs font-medium">2,500+ clients</span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded text-xs font-medium">⭐️ 4.9/5 rating</span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded text-xs font-medium">Certified experts</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes moveBackground {
            0% { background-position: 0 0; }
            100% { background-position: 100px 100px; }
          }
          .animate-moving-bg {
            animation: moveBackground 30s linear infinite;
          }
        `
      }} />
    </div>
  );
};

export default ConsultationCTA;