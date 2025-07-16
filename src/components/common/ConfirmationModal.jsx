import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  // Don't render the modal if it's not open
  if (!isOpen) {
    return null;
  }

  return (
    // Modal Overlay: Covers the entire screen
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md m-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-4 border-b rounded-t">
          <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mr-4 flex-shrink-0" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 space-x-3 border-t border-gray-200 rounded-b">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; // Export if in its own file