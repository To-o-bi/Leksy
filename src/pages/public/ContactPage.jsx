import React, { useState } from 'react';
import { contactService } from '../../api';
import ContactHeader from '../../components/contact/ContactHeader';
import ContactSuccessMessage from '../../components/contact/ContactSuccessMessage';
import ContactForm from '../../components/contact/ContactForm';
import ImageCarousel from '../../components/contact/ImageCarousel';
import ContactInfo from '../../components/contact/ContactInfo';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Phone must be at least 10 digits';
    
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    else if (formData.subject.trim().length < 5) newErrors.subject = 'Subject must be at least 5 characters';
    
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Format phone number
      const cleanPhone = formData.phone.replace(/\D/g, '');
      let phone = formData.phone.trim();
      
      // Add Nigerian country code if needed
      if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
        phone = `+234${cleanPhone.slice(1)}`;
      } else if (cleanPhone.length === 10) {
        phone = `+234${cleanPhone}`;
      }

      // Prepare data
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone,
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };

      console.log('Submitting:', contactData);

      // Submit to API
      const response = await contactService.submit(contactData);
      
      if (response && response.code === 200) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response?.message || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('Submit error:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.message.includes('Network')) {
        errorMessage = 'Network error. Check your connection.';
      } else if (error.message.includes('Validation')) {
        errorMessage = 'Please check your information.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset success state
  const handleSendAnother = () => {
    setSubmitSuccess(false);
    setSubmitError('');
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Contact Form */}
          <div className="lg:col-span-7">
            <ContactHeader />
            
            <div className="bg-white shadow-lg rounded-lg p-8">
              {submitSuccess ? (
                <ContactSuccessMessage onSendAnother={handleSendAnother} />
              ) : (
                <ContactForm
                  values={formData}
                  errors={errors}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                />
              )}
            </div>
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <ImageCarousel />
            </div>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <ContactInfo />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ContactPage;