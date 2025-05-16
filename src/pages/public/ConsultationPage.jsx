import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
// import Button from '../components/common/Button';

const ConsultationPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  
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

  const onSubmit = (data) => {
    console.log(data);
    setSubmitted(true);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-[center_10%]"
          style={{
            backgroundImage: "url('public/assets/images/banners/fine.jpg')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-60"></div>
        
        {/* Floating Bubbles */}
         {<div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-pink-200 opacity-20"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`
              }}
            ></div>
          ))}
        </div>} 
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Personalized Skincare Consultation
          </h1>
          <p className="text-lg text-white mb-8">
            Get expert advice tailored to your unique skin needs and concerns.
            Our specialists will create a customized routine just for you.
          </p>
        </div>
      </div>
    </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {!submitted ? (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Progress Indicator */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex items-center justify-between max-w-md mx-auto">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= num ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {num}
                    </div>
                    <span className="text-xs mt-1 text-gray-500">
                      {num === 1 ? 'About You' : num === 2 ? 'Skin Concerns' : 'Schedule'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-center mb-8">Tell Us About Yourself</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        {...register('firstName', { required: 'First name is required' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      />
                      {errors.firstName && (
                        <span className="text-red-500 text-sm">{errors.firstName.message}</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        {...register('lastName', { required: 'Last name is required' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      />
                      {errors.lastName && (
                        <span className="text-red-500 text-sm">{errors.lastName.message}</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-sm">{errors.email.message}</span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone number is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                    {errors.phone && (
                      <span className="text-red-500 text-sm">{errors.phone.message}</span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age Range
                    </label>
                    <select
                      {...register('ageRange', { required: 'Age range is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
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
                      <span className="text-red-500 text-sm">{errors.ageRange.message}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Skin Concerns */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-center mb-8">Your Skin Concerns</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What is your skin type?
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'].map((type) => (
                        <label key={type} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-pink-50">
                          <input
                            type="radio"
                            {...register('skinType', { required: 'Please select a skin type' })}
                            value={type.toLowerCase()}
                            className="h-4 w-4 text-pink-500 focus:ring-pink-500"
                          />
                          <span className="ml-2">{type}</span>
                        </label>
                      ))}
                    </div>
                    {errors.skinType && (
                      <span className="text-red-500 text-sm block mt-1">{errors.skinType.message}</span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select your primary skin concerns (select up to 3)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {skinConcerns.map((concern) => (
                        <label key={concern.id} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-pink-50">
                          <input
                            type="checkbox"
                            {...register('skinConcerns', { 
                              required: 'Please select at least one concern'
                            })}
                            value={concern.id}
                            className="h-4 w-4 text-pink-500 focus:ring-pink-500"
                          />
                          <span className="ml-2">{concern.name}</span>
                        </label>
                      ))}
                    </div>
                    {errors.skinConcerns && (
                      <span className="text-red-500 text-sm block mt-1">{errors.skinConcerns.message}</span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Do you currently use any skincare products?
                    </label>
                    <textarea
                      {...register('currentProducts')}
                      rows="3"
                      placeholder="Please list the products you currently use in your routine"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Any additional details about your skin concerns?
                    </label>
                    <textarea
                      {...register('additionalInfo')}
                      rows="3"
                      placeholder="Please share any other information that might help our specialist"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-center mb-8">Schedule Your Consultation</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Consultation Date
                    </label>
                    <input
                      type="date"
                      {...register('consultationDate', { required: 'Please select a date' })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                    {errors.consultationDate && (
                      <span className="text-red-500 text-sm">{errors.consultationDate.message}</span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Time Slot
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {timeSlots.map((time) => (
                        <label key={time} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-pink-50">
                          <input
                            type="radio"
                            {...register('timeSlot', { required: 'Please select a time slot' })}
                            value={time}
                            className="h-4 w-4 text-pink-500 focus:ring-pink-500"
                          />
                          <span className="ml-2">{time}</span>
                        </label>
                      ))}
                    </div>
                    {errors.timeSlot && (
                      <span className="text-red-500 text-sm block mt-1">{errors.timeSlot.message}</span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Consultation Format
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['Video Call (Zoom or Google meet)', 'Whatsapp'].map((format) => (
                        <label key={format} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-pink-50">
                          <input
                            type="radio"
                            {...register('consultationFormat', { required: 'Please select a format' })}
                            value={format.toLowerCase().replace(' ', '-')}
                            className="h-4 w-4 text-pink-500 focus:ring-pink-500"
                          />
                          <span className="ml-2">{format}</span>
                        </label>
                      ))}
                    </div>
                    {errors.consultationFormat && (
                      <span className="text-red-500 text-sm block mt-1">{errors.consultationFormat.message}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="termsAgreed"
                      {...register('termsAgreed', { required: 'You must agree to the terms' })}
                      className="h-4 w-4 text-pink-500 focus:ring-pink-500"
                    />
                    <label htmlFor="termsAgreed" className="ml-2 block text-sm text-gray-700">
                      I agree to the <a href="#" className="text-pink-500 underline">terms and conditions</a> and <a href="#" className="text-pink-500 underline">privacy policy</a>
                    </label>
                  </div>
                  {errors.termsAgreed && (
                    <span className="text-red-500 text-sm block">{errors.termsAgreed.message}</span>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="ml-auto px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
                  >
                    Book Consultation
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          // Success message after submission
          <div className="max-w-2xl mx-auto text-center bg-white rounded-xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Consultation Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for booking a consultation with Leksy Cosmetics. We've received your request and will confirm your appointment shortly via email.
            </p>
            <div className="border-t border-b border-gray-200 py-6 my-6">
              <h3 className="font-medium text-gray-700 mb-2">What to expect next:</h3>
              <ul className="text-gray-600 text-left max-w-md mx-auto space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>You'll receive a confirmation email within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Our specialist will prepare for your session based on your skin concerns</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>You'll get a reminder 24 hours before your scheduled consultation</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.href = '/shop'}
              className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Why Choose Our Consultation Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Skincare Consultation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg-pink">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Specialists</h3>
              <p className="text-gray-600">
                Our licensed skincare specialists have years of experience and stay updated with the latest skincare science.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Approach</h3>
              <p className="text-gray-600">
                We analyze your unique skin condition and create a customized skincare routine that targets your specific concerns.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ongoing Support</h3>
              <p className="text-gray-600">
                Receive follow-up support to track your progress and make adjustments to your routine as your skin evolves.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8 md:mb-0">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Book Consultation</h3>
            <p className="text-gray-600 max-w-xs">
              Fill out our form with your skin concerns and schedule a convenient time.
            </p>
          </div>
          
          <div className="hidden md:block w-24 h-0.5 bg-pink-200"></div>
          
          <div className="flex flex-col items-center text-center mb-8 md:mb-0">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Skin Analysis</h3>
            <p className="text-gray-600 max-w-xs">
              Our specialist will analyze your skin and discuss your goals during the consultation.
            </p>
          </div>
          
          <div className="hidden md:block w-24 h-0.5 bg-pink-200"></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Routine</h3>
            <p className="text-gray-600 max-w-xs">
              Receive a personalized skincare routine and product recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">What products does Leksy Cosmetics offer?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                We offer a wide range of beauty and skincare products including facial creams, body lotions, oils, soaps, serums, and more—carefully selected to enhance and protect your skin.
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">How can I book a consultation?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Click on the “Book a Consultation” button on our homepage. You can choose your preferred date, time, and consultation type. Payments are made securely online during booking.
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Is there a fee for the consultation?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  Yes, there is a consultation fee of ₦5,000, which is fully redeemable against product purchases made within 30 days of your consultation. This ensures our specialists can dedicate quality time to addressing your specific needs.
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Do you offer international shipping?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Yes, we do! Leksy Cosmetics offers international shipping to selected countries. Shipping fees and delivery times vary based on your location. At checkout, you will see available options for your region.
                </div>
              </details>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">How long does delivery take?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Orders within Lagos are typically delivered in 1–2 business days, while orders to other states take 3–5 business days. You'll receive tracking details once your order ships.
                </div>
              </details>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Can I return or exchange a product?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Yes, you can return or exchange products within 7 days of delivery if they are unopened and in their original condition. Please read our Return Policy for more details.
                </div>
              </details>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Will I need to purchase products during or after the consultation?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  There is absolutely no obligation to purchase products during or after your consultation. Our specialists will provide recommendations based on your skin needs, but the decision to purchase is entirely yours.
                </div>
              </details>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">How can I contact Leksy Cosmetics?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                You can reach us via the Contact Us page, send an email to support@leksycosmetics.com, or DM us on snapchat @lexie_luya or Instagram @leksycosmetics.
                </div>
              </details>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6">
                  <h3 className="text-lg font-medium">Do you offer discounts or promotions?</h3>
                  <span className="ml-6 flex-shrink-0 text-gray-400 group-open:transform group-open:rotate-180">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                Yes! Follow us on social media and subscribe to our newsletter to stay updated on our exclusive deals, giveaways, and seasonal promos.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 bg-gradient-to-r from-pink-500 to-pink-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-pink-500 opacity-75"></div>
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-white opacity-10"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Skincare Routine?
            </h2>
            <p className="text-white text-lg mb-8">
              Book your personalized consultation today and take the first step towards healthier, more radiant skin.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-3 bg-white text-pink-600 text-lg font-medium rounded-md hover:bg-pink-50 transition-colors"
            >
              Book Your Consultation Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;