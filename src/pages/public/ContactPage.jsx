import React, { useState, useRef } from 'react';
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
    message: '',
    countryCode: '+234' // Add missing countryCode
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Add refs to prevent duplicate submissions
  const submitTimeoutRef = useRef(null);
  const lastSubmissionRef = useRef(null);

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

  // Handle form submission with improved error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate request');
      return;
    }

    // Debounce rapid submissions (prevent submissions within 2 seconds)
    const now = Date.now();
    if (lastSubmissionRef.current && (now - lastSubmissionRef.current) < 2000) {
      console.log('Submission too soon after last attempt, ignoring');
      return;
    }
    
    if (!validateForm()) return;
    
    lastSubmissionRef.current = now;
    setIsSubmitting(true);
    setSubmitError('');
    
    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    try {
      // Format phone number - handle the formatted phone from ContactForm
      let phone = formData.phone.replace(/\D/g, ''); // Remove all non-digits
      
      // Add country code if needed
      if (phone.length === 11 && phone.startsWith('0')) {
        phone = `+234${phone.slice(1)}`;
      } else if (phone.length === 10) {
        phone = `+234${phone}`;
      } else if (phone.length === 11 && !phone.startsWith('0')) {
        phone = `+234${phone}`;
      } else {
        // Use the country code from the form if phone doesn't include country code
        phone = `${formData.countryCode}${phone}`;
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

      // Submit to API with timeout
      const response = await Promise.race([
        contactService.submit(contactData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ]);
      
      if (response && response.code === 200) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          countryCode: '+234'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response?.message || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('Submit error:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Check your connection and try again.';
      } else if (error.message.includes('Validation')) {
        errorMessage = 'Please check your information and try again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to reach server. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
      
      // Reset submission state after a delay to allow retry
      submitTimeoutRef.current = setTimeout(() => {
        lastSubmissionRef.current = null;
      }, 5000);
      
    } finally {
      // Add a small delay before allowing resubmission
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  // Reset success state
  const handleSendAnother = () => {
    setSubmitSuccess(false);
    setSubmitError('');
    lastSubmissionRef.current = null;
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

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