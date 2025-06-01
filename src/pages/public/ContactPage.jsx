// src/pages/public/ContactPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
// Uncomment these when you have the actual implementations
// import { sendContactMessage } from '../../api/services/userService';
// import { validateEmail, validatePhone } from '../../utils/validators';

// Placeholder validators until you uncomment the actual ones
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^\d{3}-\d{3}-\d{4}$/;
  return re.test(phone);
};

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  
  const initialValues = {
    name: '',
    email: '',
    phone: '',
    message: '',
    countryCode: '+234'
  };

  // Auto-sliding functionality for cards - updated to match design (15 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const validate = (values) => {
    const errors = {};
    
    if (!values.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!values.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!validatePhone(values.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!values.message.trim()) {
      errors.message = 'Message is required';
    }
    
    return errors;
  };

  // Placeholder sendContactMessage function until you uncomment the actual one
  const sendContactMessage = async (formData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      await sendContactMessage(values);
      setSubmitSuccess(true);
      reset();
    } catch (error) {
      setSubmitError('Failed to send message. Please try again later.');
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { values, errors, handleChange, handleSubmit: validateAndSubmit, reset } = useForm(
    initialValues,
    handleSubmit,
    validate
  );

  // Sliding cards data - simplified to match design exactly
  const slides = [
    {
      id: 1,
      imageUrl: "/assets/images/contact/frame-1.png"
    },
    {
      id: 2,
      imageUrl: "/assets/images/contact/frame-2.png"
    },
    {
      id: 3,
      imageUrl: "/assets/images/contact/frame-3.png"
    },
    {
      id: 4,
      imageUrl: "/assets/images/contact/frame-4.png"
    }
  ];

  return (
    <div className="w-full bg-white">
      {/* Header section - bento-style layout with exact spacing from design */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Contact Form - Set exact height to match right column */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="mb-6">
              <p className="text-sm text-gray-500">Get in Touch</p>
              <h1 className="text-3xl font-bold text-pink-500 mt-1">Need Help? Let's Make Your Skin Smile</h1>
              <p className="text-gray-600 mt-3">
                Have questions, feedback or requests? We're here to help. Send us a message and we'll respond within 24 hours
              </p>
            </div>

            <div className="flex-grow">
              {submitSuccess ? (
                <div className="bg-green-50 p-6 rounded-lg text-center h-full flex flex-col justify-center">
                  <h3 className="text-green-600 font-medium text-lg">Message Sent Successfully!</h3>
                  <p className="text-green-600 mt-2">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button 
                    className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors mx-auto"
                    onClick={() => setSubmitSuccess(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={validateAndSubmit} className="space-y-4 h-full flex flex-col">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Alexa Blessing"
                      error={errors.name}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      error={errors.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="flex">
                      <div className="relative">
                        <select
                          name="countryCode"
                          value={values.countryCode}
                          onChange={handleChange}
                          className="appearance-none pl-3 pr-8 py-3 border border-gray-300 rounded-l-lg bg-white"
                        >
                          <option value="+234">🇳🇬 +234</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={values.phone}
                        onChange={handleChange}
                        placeholder="555-014-0983"
                        error={errors.phone}
                        className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  
                  
                  <div className="flex-grow">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={values.message}
                      onChange={handleChange}
                      placeholder="Leave us a message"
                      className={`w-full px-4 py-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-pink-500 focus:border-pink-500 h-full min-h-[120px]`}
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  
                  {submitError && (
                    <div className="text-red-500 text-sm py-2">{submitError}</div>
                  )}
                  
                  <div className="mt-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 bg-pink-500 text-white font-medium rounded-full hover:bg-pink-600 transition-colors"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
          
          {/* Right Column - Sliding Cards and Contact Info - Bento grid style */}
          <div className="lg:col-span-5 flex flex-col h-full">
            {/* Sliding Cards - Fixed height with proper aspect ratio */}
            <div className="rounded-lg overflow-hidden bg-gray-100 h-64 mb-4">
              <div className="h-full relative">
                <div 
                  className="flex transition-transform duration-1000 h-full" 
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {slides.map((slide) => (
                    <div key={slide.id} className="min-w-full h-full flex-shrink-0">
                      <img
                        src={slide.imageUrl}
                        alt={`Slide ${slide.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Slide indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`w-2 h-2 rounded-full ${
                        activeSlide === index ? 'bg-pink-500' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Contact Info Cards - Using remaining space */}
            <div className="grid grid-cols-1 gap-4 flex-grow">
              <div className="bg-pink-50 bg-opacity-40 rounded-lg p-4 flex items-center space-x-4">
                <div className="text-pink-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-500 font-medium">Email</h3>
                  <a href="mailto:help@leksycosmetics.com" className="text-gray-700 hover:text-pink-500 transition-colors">
                    help@leksycosmetics.com
                  </a>
                </div>
              </div>
              
              <div className="bg-pink-50 bg-opacity-40 rounded-lg p-4 flex items-center space-x-4">
                <div className="text-pink-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-500 font-medium">Phone</h3>
                  <a href="tel:+2345550140983" className="text-gray-700 hover:text-pink-500 transition-colors">
                    (+234) 555-014-0983
                  </a>
                </div>
              </div>
              
              <div className="bg-pink-50 bg-opacity-40 rounded-lg p-4 flex items-center space-x-4">
                <div className="text-pink-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-gray-500 font-medium">Location</h3>
                  <address className="text-gray-700 not-italic">
                    VGC- 344, Victoria Island, Ikoyi,<br />
                    Lagos, Nigeria
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;