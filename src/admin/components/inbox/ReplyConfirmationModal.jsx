import React from 'react';
import { LogIn, X } from 'lucide-react';

const ReplyConfirmationModal = ({ isOpen, onClose, onConfirm, email }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-pink-200/60 transform scale-100 transition-transform duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-100/70 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Confirm Action</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
            You will be redirected to Gmail. Please ensure you are logged into <span className="font-semibold text-pink-600">
              {email}
            </span> to send the reply from the correct account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={onClose}
              className="w-full sm:w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="w-full sm:w-1/2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Continue to Gmail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyConfirmationModal;
