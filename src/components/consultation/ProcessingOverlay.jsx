// ProcessingOverlay.js
import React from 'react';

const ProcessingOverlay = ({ message = "Processing your payment..." }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-lg p-6 sm:p-8 text-center max-w-sm w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
      <p className="text-gray-600 text-sm sm:text-base">{message}</p>
    </div>
  </div>
);

export default ProcessingOverlay;