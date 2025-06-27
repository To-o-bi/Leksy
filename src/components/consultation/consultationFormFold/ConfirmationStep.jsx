// src/components/consultation/ConfirmationStep.js
import React from 'react';

const ConfirmationStep = () => {
  return (
    <div className="max-w-2xl mx-auto text-center bg-white rounded-xl shadow-lg p-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Consultation Request Submitted!</h2>
      <p className="text-gray-600 mb-6">
        Thank you for booking a consultation with Leksy Cosmetics. We've received your request and will confirm your appointment shortly via email.
      </p>
      <div className="border-t border-b border-gray-200 py-6 my-6">
        <h3 className="font-medium text-gray-700 mb-2">What to expect next:</h3>
        <ul className="text-gray-600 text-left max-w-md mx-auto space-y-2">
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>You'll receive a confirmation email within 24 hours</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Our specialist will prepare for your session based on your skin concerns</span>
          </li>
          <li className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>You'll get a reminder 24 hours before your scheduled consultation</span>
          </li>
        </ul>
      </div>
      <button 
        onClick={() => window.location.href = '/shop'}
        className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default ConfirmationStep;