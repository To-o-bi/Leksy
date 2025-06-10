// FormNavigation.js
import React from 'react';

const FormNavigation = ({
  step,
  onPrev,
  onNext,
  onSubmit,
  isProcessing,
  priceDisplay,
  isNextDisabled = false // Add this if you need to disable Next for validation before RHF catches up
}) => (
  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
    {step > 1 && (
      <button
        type="button"
        onClick={onPrev}
        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm sm:text-base font-medium transition-colors order-2 sm:order-1"
      >
        Previous
      </button>
    )}

    {step < 3 ? (
      <button
        type="button"
        onClick={onNext} // This button should trigger validation for the current step
        disabled={isNextDisabled}
        className="w-full sm:w-auto sm:ml-auto px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 text-sm sm:text-base font-medium transition-colors order-1 sm:order-2"
      >
        Next
      </button>
    ) : (
      <button
        type="submit" // This will be handled by the main form's handleSubmit(onSubmit)
        disabled={isProcessing || !priceDisplay}
        className="w-full sm:w-auto sm:ml-auto px-4 sm:px-8 py-2 sm:py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 flex items-center justify-center text-sm sm:text-base font-medium transition-colors order-1 sm:order-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>Pay {priceDisplay || 'N/A'} & Book</> // Handle case where priceDisplay might be empty
        )}
      </button>
    )}
  </div>
);

export default FormNavigation;