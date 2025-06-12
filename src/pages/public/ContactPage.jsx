// src/pages/ContactPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { sendContactMessage } from '../../api/services/contactService';
import { validateEmail, validatePhone } from '../../utils/validators';
import ContactHeader from '../../components/contact/ContactHeader';
import ContactSuccessMessage from '../../components/contact/ContactSuccessMessage';
import ContactForm from '../../components/contact/ContactForm';
import ImageCarousel from '../../components/contact/ImageCarousel';
import ContactInfo from '../../components/contact/ContactInfo';

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const initialValues = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    countryCode: '+234'
  };

  const validate = (values) => {
    const errors = {};
    
    if (!values.name.trim()) {
      errors.name = 'Name is required';
    } else if (values.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (values.name.trim().length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }
    
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!values.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(values.phone)) {
      errors.phone = 'Please enter a valid phone number (format: 555-014-0983)';
    }
    
    if (!values.subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (values.subject.trim().length < 3) {
      errors.subject = 'Subject must be at least 3 characters';
    } else if (values.subject.trim().length > 100) {
      errors.subject = 'Subject must be less than 100 characters';
    }
    
    if (!values.message.trim()) {
      errors.message = 'Message is required';
    } else if (values.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (values.message.trim().length > 1000) {
      errors.message = 'Message must be less than 1000 characters';
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Prepare data for API - matching the backend API format
      const cleanPhone = values.phone.replace(/\D/g, ''); // Remove all non-digits
      const contactData = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: `${values.countryCode}${cleanPhone}`, // Clean phone number and add country code
        subject: values.subject.trim(),
        message: values.message.trim()
      };

      console.log('Submitting contact data:', contactData);

      const response = await sendContactMessage(contactData);
      
      if (response.success) {
        setSubmitSuccess(true);
        reset();
        
        // Optional: Track successful submission
        if (window.gtag) {
          window.gtag('event', 'contact_form_submit', {
            event_category: 'engagement',
            event_label: 'contact_page'
          });
        }
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      
      // Handle different types of errors
      if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        setSubmitError('Network error. Please check your connection and try again.');
      } else if (error.message.includes('429')) {
        setSubmitError('Too many requests. Please wait a moment before trying again.');
      } else if (error.message.includes('422')) {
        setSubmitError('Please check your information and try again.');
      } else if (error.message.includes('500')) {
        setSubmitError('Server error. Please try again later.');
      } else {
        setSubmitError(error.message || 'Failed to send message. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const { values, errors, handleChange, handleSubmit: validateAndSubmit, reset } = useForm(
    initialValues,
    handleSubmit,
    validate
  );

  // Reset success state after 5 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Contact Form */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <ContactHeader />
            
            <div className="bg-white shadow-lg rounded-lg p-8 flex-grow">
              {submitSuccess ? (
                <ContactSuccessMessage 
                  onSendAnother={() => setSubmitSuccess(false)} 
                />
              ) : (
                <ContactForm
                  values={values}
                  errors={errors}
                  onChange={handleChange}
                  onSubmit={validateAndSubmit}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                />
              )}
            </div>
          </div>
          
          {/* Right Column - Image Carousel and Contact Info */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <ImageCarousel />
            <ContactInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;