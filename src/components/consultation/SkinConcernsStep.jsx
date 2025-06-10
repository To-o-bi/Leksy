// SkinConcernsStep.js
import React from 'react';
import { SKIN_CONCERNS, SKIN_TYPES } from './constants';

const SkinConcernsStep = ({ register, errors, watch }) => {
  // For limiting checkbox selection (optional, RHF can also do this with validate)
  const selectedSkinConcerns = watch('skinConcerns') || [];
  const MAX_CONCERNS = 3;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">Your Skin Concerns</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">What is your skin type?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {SKIN_TYPES.map((type) => (
            <label key={type} className="flex items-center p-3 sm:p-4 border rounded-md cursor-pointer hover:bg-pink-50 transition-colors">
              <input
                type="radio"
                {...register('skinType', { required: 'Please select a skin type' })}
                value={type.toLowerCase()}
                className="h-4 w-4 text-pink-500 focus:ring-pink-500"
              />
              <span className="ml-2 sm:ml-3 text-sm sm:text-base">{type}</span>
            </label>
          ))}
        </div>
        {errors.skinType && <span className="text-red-500 text-xs sm:text-sm block mt-2">{errors.skinType.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Select your primary skin concerns (select up to {MAX_CONCERNS})
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {SKIN_CONCERNS.map((concern) => (
            <label key={concern.id} className="flex items-center p-3 sm:p-4 border rounded-md cursor-pointer hover:bg-pink-50 transition-colors">
              <input
                type="checkbox"
                {...register('skinConcerns', {
                  required: 'Please select at least one concern',
                  validate: value => (value && value.length <= MAX_CONCERNS) || `Please select no more than ${MAX_CONCERNS} concerns.`
                })}
                value={concern.id}
                className="h-4 w-4 text-pink-500 focus:ring-pink-500 flex-shrink-0"
                disabled={!selectedSkinConcerns.includes(concern.id) && selectedSkinConcerns.length >= MAX_CONCERNS}
              />
              <span className="ml-2 sm:ml-3 text-sm sm:text-base leading-snug">{concern.name}</span>
            </label>
          ))}
        </div>
        {errors.skinConcerns && <span className="text-red-500 text-xs sm:text-sm block mt-2">{errors.skinConcerns.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Do you have sensitive skin?</label>
        <textarea
          {...register('additionalInfo')}
          rows="3"
          placeholder="Please let us know about your skin sensitivity"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base resize-none"
        ></textarea>
      </div>
    </div>
  );
};

export default SkinConcernsStep;