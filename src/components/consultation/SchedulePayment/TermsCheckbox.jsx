// components/TermsCheckbox.js
import React from 'react';

const TermsCheckbox = ({ register, errors }) => {
  return (
    <div>
      <div className="flex items-start">
        <input
          type="checkbox"
          id="termsAgreed"
          {...register('termsAgreed', { required: 'You must agree to the terms' })}
          className="h-4 w-4 text-pink-500 focus:ring-pink-500 mt-0.5 flex-shrink-0"
        />
        <label htmlFor="termsAgreed" className="ml-2 block text-xs sm:text-sm text-gray-700 leading-relaxed">
          I agree to the{' '}
          <a href="#" className="text-pink-500 underline">terms and conditions</a>
          {' '}and{' '}
          <a href="#" className="text-pink-500 underline">privacy policy</a>
        </label>
      </div>
      {errors.termsAgreed && (
        <span className="text-red-500 text-xs sm:text-sm block mt-1">
          {errors.termsAgreed.message}
        </span>
      )}
    </div>
  );
};

export default TermsCheckbox;