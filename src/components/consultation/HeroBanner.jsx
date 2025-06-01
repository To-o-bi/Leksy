import React from 'react'

const HeroBanner = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative py-8 sm:py-12 md:py-16 h-[40vh] sm:h-[45vh] md:h-[50vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center sm:bg-[center_10%] transform scale-105 transition-transform duration-700 hover:scale-110"
            style={{
              backgroundImage: "url('/assets/images/banners/fine.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-pink-400 to-purple-500 opacity-50 sm:opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          
          {/* Floating Bubbles - Reduced for compact design */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Mobile: Fewer, smaller bubbles */}
            <div className="block sm:hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={`mobile-${i}`}
                  className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-float"
                  style={{
                    width: `${Math.random() * 30 + 15}px`,
                    height: `${Math.random() * 30 + 15}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${Math.random() * 4 + 3}s`
                  }}
                ></div>
              ))}
            </div>
            
            {/* Tablet and up: Moderate bubbles */}
            <div className="hidden sm:block">
              {[...Array(8)].map((_, i) => (
                <div
                  key={`desktop-${i}`}
                  className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-float"
                  style={{
                    width: `${Math.random() * 60 + 25}px`,
                    height: `${Math.random() * 60 + 25}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${Math.random() * 5 + 4}s`
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Decorative Elements - Smaller for compact design */}
          <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white/20 animate-pulse"></div>
          </div>
          <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/10 animate-ping"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
            {/* Main Heading - Reduced size for internal page */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white leading-tight">
              <span className="inline-block animate-fade-in-up">Personalized</span>{' '}
              <span className="inline-block animate-fade-in-up animation-delay-200">Skincare</span>{' '}
              <span className="inline-block animate-fade-in-up animation-delay-400 bg-gradient-to-r from-pink-200 to-purple-200 bg-clip-text text-transparent">
                Consultation
              </span>
            </h1>
            
            {/* Subtitle - More concise for internal page */}
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 leading-relaxed animate-fade-in-up animation-delay-600 max-w-xl mx-auto">
              Get expert advice tailored to your unique skin needs and concerns.
            </p>            
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(120deg); }
          66% { transform: translateY(8px) rotate(240deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  )
}

export default HeroBanner