import React from 'react';

const ContactSuccessMessage = ({ onSendAnother }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Message Sent!
          </h1>
          <p className="text-gray-600 mb-8">
            Thanks for reaching out. We'll get back to you within 24 hours.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors font-medium"
              onClick={onSendAnother}
              type="button"
            >
              Send Another Message
            </button>
            <button 
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              onClick={() => window.location.href = '/'}
              type="button"
            >
              Back to Home
            </button>
          </div>

          {/* Quick Contact */}
          <p className="text-xs text-gray-400 mt-6">
            Urgent? Call{' '}
            <a href="tel:+2348012345678" className="text-pink-600 hover:text-pink-700">
              +234 801 234 5678
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactSuccessMessage;