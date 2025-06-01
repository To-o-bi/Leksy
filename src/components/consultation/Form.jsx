import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const Form = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    
    const skinConcerns = [
      { id: 'acne', name: 'Acne and Blemishes' },
      { id: 'dryness', name: 'Dryness and Dehydration' },
      { id: 'aging', name: 'Anti-Aging and Wrinkles' },
      { id: 'sensitivity', name: 'Sensitivity and Redness' },
      { id: 'pigmentation', name: 'Hyperpigmentation' },
      { id: 'oiliness', name: 'Excess Oil and Shine' },
    ];
  
    const timeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', 
      '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];

    const consultationFormats = [
      { 
        id: 'video', 
        name: 'Video Call (Zoom or Google Meet)', 
        price: 35000,
        displayPrice: '₦35,000'
      },
      { 
        id: 'whatsapp', 
        name: 'WhatsApp Consultation', 
        price: 15000,
        displayPrice: '₦15,000'
      }
    ];

    // Watch the consultation format to get price
    const selectedFormat = watch('consultationFormat');
    const getSelectedPrice = () => {
      const format = consultationFormats.find(f => f.id === selectedFormat);
      return format ? format.price : 0;
    };

    const getSelectedPriceDisplay = () => {
      const format = consultationFormats.find(f => f.id === selectedFormat);
      return format ? format.displayPrice : '';
    };

    // Initialize Paystack payment
    const initializePayment = async (formData) => {
      try {
        setIsProcessing(true);
        
        const paymentData = {
          email: formData.email,
          amount: getSelectedPrice() * 100, // Paystack expects amount in kobo
          metadata: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            consultationType: selectedFormat,
            consultationDate: formData.consultationDate,
            timeSlot: formData.timeSlot
          },
          callback_url: `${window.location.origin}/consultation/callback`,
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
        };

        // Call your backend to initialize payment
        const response = await fetch('/api/consultation/initialize-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...paymentData,
            consultationData: formData
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Redirect to Paystack payment page
          window.location.href = result.data.authorization_url;
        } else {
          throw new Error(result.message || 'Payment initialization failed');
        }
      } catch (error) {
        console.error('Payment initialization error:', error);
        alert('Failed to initialize payment. Please try again.');
        setIsProcessing(false);
      }
    };

    // Handle form submission
    const onSubmit = async (data) => {
      if (step < 3) {
        nextStep();
        return;
      }

      // Final step - process payment
      await initializePayment(data);
    };

    // Check payment status on component mount (for callback handling)
    React.useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');
      const status = urlParams.get('status');

      if (reference && status) {
        verifyPayment(reference, status);
      }
    }, []);

    // Verify payment status
    const verifyPayment = async (reference, status) => {
      try {
        setIsProcessing(true);
        
        const response = await fetch('/api/consultation/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference, status }),
        });

        const result = await response.json();

        if (result.success && result.data.status === 'success') {
          setPaymentStatus('success');
          setSubmitted(true);
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setPaymentStatus('failed');
          alert('Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
        alert('Payment verification failed. Please contact support.');
      } finally {
        setIsProcessing(false);
      }
    };
  
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    // Loading overlay
    if (isProcessing) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 text-center max-w-sm w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Processing your payment...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto max-w-4xl">
          {!submitted ? (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
              {/* Progress Indicator */}
              <div className="bg-gray-50 px-4 sm:px-6 py-4 sm:py-6 border-b">
                <div className="flex items-center justify-between max-w-xs sm:max-w-md mx-auto">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="flex flex-col items-center flex-1">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                        step >= num ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {num}
                      </div>
                      <span className="text-xs mt-1 sm:mt-2 text-gray-500 text-center leading-tight max-w-16 sm:max-w-none">
                        {num === 1 ? 'About You' : num === 2 ? 'Skin Concerns' : 'Schedule & Pay'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">Tell Us About Yourself</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          {...register('firstName', { required: 'First name is required' })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
                        />
                        {errors.firstName && (
                          <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.firstName.message}</span>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          {...register('lastName', { required: 'Last name is required' })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
                        />
                        {errors.lastName && (
                          <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.lastName.message}</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
                      />
                      {errors.email && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.email.message}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        {...register('phone', { required: 'Phone number is required' })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
                      />
                      {errors.phone && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.phone.message}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Age Range
                      </label>
                      <select
                        {...register('ageRange', { required: 'Age range is required' })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
                      >
                        <option value="">Select age range</option>
                        <option value="under18">Under 18</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45-54">45-54</option>
                        <option value="55+">55+</option>
                      </select>
                      {errors.ageRange && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.ageRange.message}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Skin Concerns */}
                {step === 2 && (
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">Your Skin Concerns</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                        What is your skin type?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'].map((type) => (
                          <label key={type} className="flex items-center p-3 sm:p-4 border rounded-md cursor-pointer hover:bg-pink-50 transition-colors">
                            <input
                              type="radio"
                              {...register('skinType', { required: 'Please select a skin type' })}
                              value={type.toLowerCase()}
                              className="h-4 w-4 text-pink-500 focus:ring-pink-500"
                            />
                            <span className="ml-2 sm:ml-3 text-sm sm:text-base">{type}</span>
                          </label>
                        ))}
                      </div>
                      {errors.skinType && (
                        <span className="text-red-500 text-xs sm:text-sm block mt-2">{errors.skinType.message}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                        Select your primary skin concerns (select up to 3)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {skinConcerns.map((concern) => (
                          <label key={concern.id} className="flex items-center p-3 sm:p-4 border rounded-md cursor-pointer hover:bg-pink-50 transition-colors">
                            <input
                              type="checkbox"
                              {...register('skinConcerns', { 
                                required: 'Please select at least one concern'
                              })}
                              value={concern.id}
                              className="h-4 w-4 text-pink-500 focus:ring-pink-500 flex-shrink-0"
                            />
                            <span className="ml-2 sm:ml-3 text-sm sm:text-base leading-snug">{concern.name}</span>
                          </label>
                        ))}
                      </div>
                      {errors.skinConcerns && (
                        <span className="text-red-500 text-xs sm:text-sm block mt-2">{errors.skinConcerns.message}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Do you currently use any skincare products?
                      </label>
                      <textarea
                        {...register('currentProducts')}
                        rows="3"
                        placeholder="Please list the products you currently use in your routine"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base resize-none"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Any additional details about your skin concerns?
                      </label>
                      <textarea
                        {...register('additionalInfo')}
                        rows="3"
                        placeholder="Please share any other information that might help our specialist"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base resize-none"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Step 3: Schedule & Payment */}
                {step === 3 && (
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">Schedule Your Consultation</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Preferred Consultation Date
                      </label>
                      <input
                        type="date"
                        {...register('consultationDate', { required: 'Please select a date' })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base"
                      />
                      {errors.consultationDate && (
                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.consultationDate.message}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                        Preferred Time Slot
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {timeSlots.map((time) => (
                          <label key={time} className="flex items-center justify-center p-2 sm:p-3 border rounded-md cursor-pointer hover:bg-pink-50 transition-colors text-center">
                            <input
                              type="radio"
                              {...register('timeSlot', { required: 'Please select a time slot' })}
                              value={time}
                              className="sr-only"
                            />
                            <span className="text-xs sm:text-sm font-medium">{time}</span>
                          </label>
                        ))}
                      </div>
                      {errors.timeSlot && (
                        <span className="text-red-500 text-xs sm:text-sm block mt-2">{errors.timeSlot.message}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                        Consultation Format
                      </label>
                      <div className="space-y-2 sm:space-y-3">
                        {consultationFormats.map((format) => (
                          <label key={format.id} className="flex items-center justify-between p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:bg-pink-50 hover:border-pink-200 transition-colors">
                            <div className="flex items-center flex-1 min-w-0">
                              <input
                                type="radio"
                                {...register('consultationFormat', { required: 'Please select a format' })}
                                value={format.id}
                                className="h-4 w-4 text-pink-500 focus:ring-pink-500 flex-shrink-0"
                              />
                              <span className="ml-3 font-medium text-sm sm:text-base leading-snug">{format.name}</span>
                            </div>
                            <span className="text-base sm:text-lg font-bold text-pink-600 flex-shrink-0 ml-2">{format.displayPrice}</span>
                          </label>
                        ))}
                      </div>
                      {errors.consultationFormat && (
                        <span className="text-red-500 text-xs sm:text-sm block mt-2">{errors.consultationFormat.message}</span>
                      )}
                    </div>

                    {/* Price Summary */}
                    {selectedFormat && (
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700 text-sm sm:text-base">Total Amount:</span>
                          <span className="text-lg sm:text-xl font-bold text-pink-600">{getSelectedPriceDisplay()}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="termsAgreed"
                        {...register('termsAgreed', { required: 'You must agree to the terms' })}
                        className="h-4 w-4 text-pink-500 focus:ring-pink-500 mt-0.5 flex-shrink-0"
                      />
                      <label htmlFor="termsAgreed" className="ml-2 block text-xs sm:text-sm text-gray-700 leading-relaxed">
                        I agree to the <a href="#" className="text-pink-500 underline">terms and conditions</a> and <a href="#" className="text-pink-500 underline">privacy policy</a>
                      </label>
                    </div>
                    {errors.termsAgreed && (
                      <span className="text-red-500 text-xs sm:text-sm block">{errors.termsAgreed.message}</span>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm sm:text-base font-medium transition-colors order-2 sm:order-1"
                    >
                      Previous
                    </button>
                  )}
                  
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full sm:w-auto sm:ml-auto px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 text-sm sm:text-base font-medium transition-colors order-1 sm:order-2"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto sm:ml-auto px-4 sm:px-8 py-2 sm:py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 flex items-center justify-center text-sm sm:text-base font-medium transition-colors order-1 sm:order-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay {getSelectedPriceDisplay()} & Book
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Success message after payment
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
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You'll receive a confirmation email with meeting details within 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Our specialist will prepare for your session based on your skin concerns</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You'll get a reminder 24 hours before your scheduled consultation</span>
                  </li>
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
          )}
        </div>
      </div>
    );
};

export default Form;