// SubmissionSuccess.js
import React from 'react';

const SubmissionSuccess = () => (
  <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 text-center">
    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Payment Successful!</h2>
    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
      Thank you for booking a consultation with Leksy Cosmetics. Your payment has been processed successfully and we'll confirm your appointment shortly via email.
    </p>
    <div className="border-t border-b border-gray-200 py-4 sm:py-6 my-4 sm:my-6">
      <h3 className="font-medium text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">What to expect next:</h3>
      <ul className="text-gray-600 text-left space-y-2 sm:space-y-3 text-xs sm:text-sm">
        {[
          "You'll receive a confirmation email with meeting details within 24 hours",
          "Our specialist will prepare for your session based on your skin concerns",
          "You'll get a reminder 24 hours before your scheduled consultation"
        ].map((item, index) => (
          <li key={index} className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
      <button
        onClick={() => window.location.href = '/shop'}
        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 text-sm sm:text-base font-medium transition-colors"
      >
        Continue Shopping
      </button>
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm sm:text-base font-medium transition-colors"
      >
        View Dashboard
      </button>
    </div>
  </div>
);

export default SubmissionSuccess;