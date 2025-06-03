import React from 'react';

const ContactSuccessMessage = ({ onSendAnother }) => {
  return (
    <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center h-full flex flex-col justify-center">
      <div className="text-green-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-green-700 font-semibold text-xl mb-2">
        Message Sent Successfully!
      </h3>
      <p className="text-green-600 mb-4">
        Thank you for reaching out. We'll get back to you within 24 hours.
      </p>
      <button 
        className="bg-pink-500 text-white px-6 py-3 rounded-full hover:bg-pink-600 transition-colors mx-auto font-medium"
        onClick={onSendAnother}
        type="button"
      >
        Send Another Message
      </button>
    </div>
  );
};

export default ContactSuccessMessage;   