// src/components/contact/ContactForm.jsx
import React, { useState } from 'react';
import FormField from './FormField';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import CountryCodeSelect from './CountryCodeSelect';
import SubjectSelect from './SubjectSelect';

const ContactForm = ({
  values,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
  submitError
}) => {
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Remove all non-digits
    value = value.replace(/\D/g, '');
    
    // Format as XXX-XXX-XXXX
    if (value.length >= 6) {
      value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
    } else if (value.length >= 3) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }
    
    onChange({
      target: {
        name: 'phone',
        value: value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('Form already submitting, preventing duplicate submission');
      return;
    }
    
    onSubmit(e);
  };

  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <FormField
          label="Full Name"
          id="name"
          error={errors.name}
          required
        >
          <Input
            type="text"
            name="name"
            id="name"
            value={values.name}
            onChange={onChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            error={errors.name}
            maxLength={50}
            required
            disabled={isSubmitting}
          />
        </FormField>

        {/* Email Field */}
        <FormField
          label="Email Address"
          id="email"
          error={errors.email}
          required
        >
          <Input
            type="email"
            name="email"
            id="email"
            value={values.email}
            onChange={onChange}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            error={errors.email}
            required
            disabled={isSubmitting}
          />
        </FormField>

        {/* Phone Field */}
        <FormField
          label="Phone Number"
          id="phone"
          error={errors.phone}
          required
        >
          <div className="flex w-full">
            <CountryCodeSelect
              value={values.countryCode || '+234'}
              onChange={onChange}
              disabled={isSubmitting}
            />
            <Input
              type="tel"
              name="phone"
              id="phone"
              value={values.phone}
              onChange={handlePhoneChange}
              placeholder="555-014-0983"
              className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors border-l-0"
              error={errors.phone}
              maxLength={12}
              required
              disabled={isSubmitting}
            />
          </div>
        </FormField>

        {/* Subject Field */}
        <FormField
          label="Subject"
          id="subject"
          error={errors.subject}
          required
          showCharCount={isCustomSubject}
          currentLength={values.subject.length}
          maxLength={100}
        >
          <SubjectSelect
            value={values.subject}
            onChange={onChange}
            error={errors.subject}
            isCustomSubject={isCustomSubject}
            onCustomSubjectToggle={setIsCustomSubject}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Message Field */}
        <FormField
          label="Message"
          id="message"
          error={errors.message}
          required
          showCharCount
          currentLength={values.message.length}
          maxLength={1000}
        >
          <textarea
            id="message"
            name="message"
            value={values.message}
            onChange={onChange}
            placeholder="Tell us how we can help you..."
            rows={6}
            maxLength={1000}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-y min-h-[120px] ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            aria-describedby={errors.message ? "message-error" : "message-count"}
            required
          />
        </FormField>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6">
          {/* Use a native button instead of custom Button component to ensure proper disabled handling */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed opacity-75' 
                : 'bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 active:bg-pink-800'
            }`}
            style={{ 
              pointerEvents: isSubmitting ? 'none' : 'auto' 
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Message...
              </div>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;