import React from 'react'

const CTA = () => {
  return (
    <div className="relative py-16 bg-gradient-to-r from-pink-500 to-pink-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-pink-500 opacity-75"></div>
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-white opacity-10"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`
                }}
              ></div>
            ))}
          </div>
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
  )
}

export default CTA
