import React, { useState, useEffect } from 'react';

const ConsultationSuccess = () => {
  const [consultationDetails, setConsultationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get URL parameters manually
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  const consultationId = urlParams.get('consultation_id') || urlParams.get('order_id');

  useEffect(() => {
    // If we have a consultation ID, we could fetch more details
    // For now, we'll just show the success message
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Booking Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleReturnHome}
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors duration-200"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-6 text-center">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-pink-100">Your consultation has been successfully booked</p>
        </div>

        {/* Booking Details */}
        <div className="px-8 py-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-green-800">Payment Successful</span>
            </div>
            <p className="text-sm text-green-700">
              {message || 'Your consultation has been booked and payment processed successfully!'}
            </p>
            {consultationId && (
              <p className="text-xs text-green-600 mt-1">
                Booking ID: <span className="font-mono font-medium">{consultationId}</span>
              </p>
            )}
          </div>

          {/* What's Next Section */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">What happens next?</h3>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-pink-600">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Confirmation Email</h4>
                <p className="text-sm text-gray-600">You'll receive a confirmation email with all the details within the next few minutes.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-pink-600">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Pre-Consultation Contact</h4>
                <p className="text-sm text-gray-600">Our team will reach out 24 hours before your appointment with session details.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-medium text-pink-600">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Your Consultation</h4>
                <p className="text-sm text-gray-600">Join your personalized skincare consultation at the scheduled time.</p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Important Notes:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Please have your current skincare products ready for the consultation</li>
                  <li>• Make sure you have a stable internet connection (for video calls)</li>
                  <li>• Prepare any specific questions about your skin concerns</li>
                  <li>• Check your email for the consultation link</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Need Help Section */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Need to reschedule or have questions?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Contact our support team and we'll be happy to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a 
                href="mailto:support@leksycosmetics.com" 
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Support
              </a>
              <a 
                href="http://wa.me/2349014425540" 
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReturnHome}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Return to Homepage
            </button>
            <button
              onClick={handleBookAnother}
              className="flex-1 bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors duration-200 font-medium"
            >
              Book Another Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSuccess;