// src/components/consultation/SkinConcernsStep.js
import React from 'react';

const skinConcerns = [
  { id: 'acne', name: 'Acne and Blemishes' },
  { id: 'dryness', name: 'Dryness and Dehydration' },
  { id: 'aging', name: 'Anti-Aging and Wrinkles' },
  { id: 'sensitivity', name: 'Sensitivity and Redness' },
  { id: 'pigmentation', name: 'Hyperpigmentation' },
  { id: 'oiliness', name: 'Excess Oil and Shine' },
];

const SkinConcernsStep = ({ register, errors, watch }) => {
  const selectedConcerns = watch('skinConcerns') || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-8">Your Skin Concerns</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What is your skin type?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'].map((type) => (
            <label key={type} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-pink-50">
              <input
                type="radio"
                {...register('skinType', { required: 'Please select a skin type' })}
                value={type.toLowerCase()}
                className="h-4 w-4 text-pink-500 focus:ring-pink-500"
              />
              <span className="ml-2">{type}</span>
            </label>
          ))}
        </div>
        {errors.skinType && (
          <span className="text-red-500 text-sm block mt-1">{errors.skinType.message}</span>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select your primary skin concerns (select up to 3)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skinConcerns.map((concern) => (
            <label 
              key={concern.id} 
              className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-pink-50 ${
                !selectedConcerns.includes(concern.id) && selectedConcerns.length >= 3 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              <input
                type="checkbox"
                {...register('skinConcerns', { 
                  required: 'Please select at least one concern',
                  validate: value => {
                    if (!value || value.length === 0) {
                      return 'Please select at least one concern';
                    }
                    if (value.length > 3) {
                      return 'Please select no more than 3 concerns';
                    }
                    return true;
                  }
                })}
                value={concern.id}
                className="h-4 w-4 text-pink-500 focus:ring-pink-500"
                disabled={!selectedConcerns.includes(concern.id) && selectedConcerns.length >= 3}
              />
              <span className="ml-2">{concern.name}</span>
            </label>
          ))}
        </div>
        {errors.skinConcerns && (
          <span className="text-red-500 text-sm block mt-1">{errors.skinConcerns.message}</span>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Do you currently use any skincare products?
        </label>
        <textarea
          {...register('currentProducts')}
          rows="3"
          placeholder="Please list the products you currently use in your routine"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Any additional details about your skin concerns?
        </label>
        <textarea
          {...register('additionalInfo')}
          rows="3"
          placeholder="Please share any other information that might help our specialist"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
        ></textarea>
      </div>
    </div>
  );
};

export default SkinConcernsStep;