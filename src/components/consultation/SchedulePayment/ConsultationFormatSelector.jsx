// components/ConsultationFormatSelector.js
import React from 'react';

const ConsultationFormatSelector = ({ register, errors, consultationFormats, selectedConsultationFormatId }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Consultation Format</label>
      <div className="space-y-2 sm:space-y-3">
        {consultationFormats.map((format) => (
          <label 
            key={format.id} 
            className={`flex items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:bg-pink-50 hover:border-pink-200 transition-colors ${
              selectedConsultationFormatId === format.id 
                ? 'border-pink-500 bg-pink-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center flex-1 min-w-0">
              <input
                type="radio"
                {...register('consultationFormat', { required: 'Please select a format' })}
                value={format.id}
                className="h-4 w-4 text-pink-500 focus:ring-pink-500 flex-shrink-0"
              />
              <span className="ml-3 font-medium text-sm sm:text-base leading-snug">
                {format.name}
              </span>
            </div>
            <span className="text-base sm:text-lg font-bold text-pink-600 flex-shrink-0 ml-2">
              {format.displayPrice}
            </span>
          </label>
        ))}
      </div>
      {errors.consultationFormat && (
        <span className="text-red-500 text-xs sm:text-sm block mt-2">
          {errors.consultationFormat.message}
        </span>
      )}
    </div>
  );
};

export default ConsultationFormatSelector;