import React from 'react'

const HowItworks = () => {
  return (
    <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8 md:mb-0">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Book Consultation</h3>
            <p className="text-gray-600 max-w-xs">
              Fill out our form with your skin concerns and schedule a convenient time.
            </p>
          </div>
          
          <div className="hidden md:block w-24 h-0.5 bg-pink-200"></div>
          
          <div className="flex flex-col items-center text-center mb-8 md:mb-0">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Skin Analysis</h3>
            <p className="text-gray-600 max-w-xs">
              Our specialist will analyze your skin and discuss your goals during the consultation.
            </p>
          </div>
          
          <div className="hidden md:block w-24 h-0.5 bg-pink-200"></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Routine</h3>
            <p className="text-gray-600 max-w-xs">
              Receive a personalized skincare routine and product recommendations.
            </p>
          </div>
        </div>
      </div>
  )
}

export default HowItworks
