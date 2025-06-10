// components/PriceDisplay.js
import React from 'react';

const PriceDisplay = ({ selectedConsultationFormatId, getSelectedPriceDisplay }) => {
  if (!selectedConsultationFormatId) return null;

  return (
    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-700 text-sm sm:text-base">Total Amount:</span>
        <span className="text-lg sm:text-xl font-bold text-pink-600">
          {getSelectedPriceDisplay()}
        </span>
      </div>
    </div>
  );
};

export default PriceDisplay;    