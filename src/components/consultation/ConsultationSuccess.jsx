import React, { useState, useEffect } from 'react';

const ConsultationSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  const consultationId = urlParams.get('consultation_id') || urlParams.get('order_id');

  useEffect(() => {
    if (message || consultationId) {
      setLoading(false);
    } else {
      setError('No booking information found');
      setLoading(false);
    }
  }, [message, consultationId]);

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const handleBookAnother = () => {
    window.location.href = '/consultation';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleReturnHome();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Booking Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={handleReturnHome}
            className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-8">
          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-6">
            <svg 
              className="w-8 h-8 text-pink-600" 
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
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 mb-4">
              Your consultation has been booked successfully.
            </p>
            
            {/* Booking Details */}
            {(message || consultationId) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">Payment Successful</span>
                </div>
                {consultationId && (
                  <p className="text-xs text-green-600 mt-1">
                    ID: <span className="font-mono">{consultationId}</span>
                  </p>
                )}
              </div>
            )}

            {/* What's Next */}
            <div className="text-left mb-4">
              <h3 className="font-semibold text-gray-800 mb-2 text-center">What happens next?</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="w-4 h-4 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5 flex-shrink-0">1</span>
                  <p>You will get a Confirmation email within minutes</p>
                </div>
                <div className="flex items-start">
                  <span className="w-4 h-4 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5 flex-shrink-0">2</span>
                  <p>We'll contact you 24 hours before your consultation date</p>
                </div>
                <div className="flex items-start">
                  <span className="w-4 h-4 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5 flex-shrink-0">3</span>
                  <p>Join your consultation session</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-4">
            <button 
              className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors font-medium"
              onClick={handleBookAnother}
              type="button"
            >
              Book Another Consultation
            </button>
            <button 
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              onClick={handleReturnHome}
              type="button"
            >
              Back to Home
            </button>
          </div>

          {/* Quick Contact */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Need help?{' '}
              <a href="mailto:support@leksycosmetics.com" className="text-pink-600 hover:text-pink-700">
                Email
              </a>{' '}or{' '}
              <a href="http://wa.me/2349014425540" className="text-pink-600 hover:text-pink-700">
                WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSuccess;