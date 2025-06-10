// ProgressIndicator.js
import React from 'react';

const STEPS_CONFIG = [
  { number: 1, title: 'About You' },
  { number: 2, title: 'Skin Concerns' },
  { number: 3, title: 'Schedule & Pay' },
];

const ProgressIndicator = ({ currentStep }) => (
  <div className="bg-gray-50 px-4 sm:px-6 py-4 sm:py-6 border-b">
    <div className="flex items-center justify-between max-w-xs sm:max-w-md mx-auto">
      {STEPS_CONFIG.map((stepConfig) => (
        <div key={stepConfig.number} className="flex flex-col items-center flex-1">
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
            currentStep >= stepConfig.number ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {stepConfig.number}
          </div>
          <span className="text-xs mt-1 sm:mt-2 text-gray-500 text-center leading-tight max-w-16 sm:max-w-none">
            {stepConfig.title}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default ProgressIndicator;