import React from 'react';

const BusParkModal = ({ 
  isOpen, 
  onCancel, 
  onConfirm, 
  isPendingSelection 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">Bus Park Delivery Notice</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              <strong>Important:</strong> When you choose bus park delivery, you will be contacted to arrange and negotiate the delivery fee directly with the bus driver. 
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Once your items are handed over to the driver, the responsibility for the safety and handling of your goods will rest entirely with you. We cannot be held liable for any damage, loss, or delay that may occur during transit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-white bg-pink-600 hover:bg-pink-700 rounded-md font-medium transition-colors duration-200"
            >
              {isPendingSelection ? 'I Understand' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusParkModal;