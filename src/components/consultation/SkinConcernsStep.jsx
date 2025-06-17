// SkinConcernsStep.js
import React from 'react';
import { SKIN_CONCERNS, SKIN_TYPES } from './constants';

const SkinConcernsStep = ({ register, errors, watch }) => {
  // Watch the selected skin concerns to limit selection
  const selectedSkinConcerns = watch('skin_concerns') || [];
  const MAX_CONCERNS = 3;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">Your Skin Concerns</h2>
      
      {/* Skin Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">What is your skin type?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {SKIN_TYPES.map((type) => (
            <label key={type} className="flex items-center p-3 sm:p-4 border rounded-md cursor-pointer hover:bg-pink-50 transition-colors">
              <input
                type="radio"
                {...register('skin_type', { required: 'Please select a skin type' })}
                value={type.toLowerCase().replace(/\s+/g, '_')}
                className="h-4 w-4 text-pink-500 focus:ring-pink-500"
              />
              <span className="ml-2 sm:ml-3 text-sm sm:text-base">{type}</span>
            </label>
          ))}
        </div>
        {errors.skin_type && (
          <span className="text-red-500 text-xs sm:text-sm block mt-2">
            {errors.skin_type.message}
          </span>
        )}
      </div>

      {/* Skin Concerns Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Select your primary skin concerns (select up to {MAX_CONCERNS})
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {SKIN_CONCERNS.map((concern) => (
            <label 
              key={concern.id} 
              className={`flex items-center p-3 sm:p-4 border rounded-md cursor-pointer hover:bg-pink-50 transition-colors ${
                !selectedSkinConcerns.includes(concern.id) && selectedSkinConcerns.length >= MAX_CONCERNS 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              <input
                type="checkbox"
                {...register('skin_concerns', {
                  required: 'Please select at least one skin concern',
                  validate: value => {
                    if (!value || value.length === 0) {
                      return 'Please select at least one skin concern';
                    }
                    if (value.length > MAX_CONCERNS) {
                      return `Please select no more than ${MAX_CONCERNS} concerns`;
                    }
                    return true;
                  }
                })}
                value={concern.id}
                className="h-4 w-4 text-pink-500 focus:ring-pink-500 flex-shrink-0"
                disabled={!selectedSkinConcerns.includes(concern.id) && selectedSkinConcerns.length >= MAX_CONCERNS}
              />
              <span className="ml-2 sm:ml-3 text-sm sm:text-base leading-snug">
                {concern.name}
              </span>
            </label>
          ))}
        </div>
        {errors.skin_concerns && (
          <span className="text-red-500 text-xs sm:text-sm block mt-2">
            {errors.skin_concerns.message}
          </span>
        )}
      </div>

      {/* Current Skincare Products */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Current skincare products you're using (optional)
        </label>
        <textarea
          {...register('current_skincare_products')}
          rows="3"
          placeholder="Tell us about the skincare products you currently use..."
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base resize-none"
        />
      </div>

      {/* Additional Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Additional details about your skin concerns (optional)
        </label>
        <textarea
          {...register('additional_details')}
          rows="3"
          placeholder="Any additional information about your skin concerns, sensitivity, or specific issues you'd like to discuss..."
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base resize-none"
        />
      </div>
    </div>
  );
};

export default SkinConcernsStep;