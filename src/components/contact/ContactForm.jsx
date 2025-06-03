import React, { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import FormField from './FormField';
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

  // Format phone number as user types
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format as XXX-XXX-XXXX
    if (value.length >= 6) {
      value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    }
    
    onChange({
      target: {
        name: 'phone',
        value: value
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 h-full flex flex-col" noValidate>
      <FormField label="Full Name" id="name" error={errors.name} required>
        <Input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={onChange}
          placeholder="Enter your full name"
          error={errors.name}
          maxLength={50}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
          aria-describedby={errors.name ? "name-error" : undefined}
          required
        />
      </FormField>
      
      <FormField label="Email Address" id="email" error={errors.email} required>
        <Input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={onChange}
          placeholder="your.email@example.com"
          error={errors.email}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
          aria-describedby={errors.email ? "email-error" : undefined}
          required
          autoComplete="email"
        />
      </FormField>
      
      <FormField label="Phone Number" id="phone" error={errors.phone} required>
        <div className="flex">
          <CountryCodeSelect 
            value={values.countryCode} 
            onChange={onChange} 
          />
          <input
            id="phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handlePhoneChange}
            placeholder="555-014-0983"
            maxLength={12}
            className={`flex-1 px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors`}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            required
            autoComplete="tel"
          />
        </div>
      </FormField>
      
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
        />
      </FormField>
      
      <FormField 
        label="Message" 
        id="message" 
        error={errors.message} 
        required
        showCharCount={true}
        currentLength={values.message.length}
        maxLength={1000}
      >
        <textarea
          id="message"
          name="message"
          rows="6"
          value={values.message}
          onChange={onChange}
          placeholder="Tell us how we can help you..."
          maxLength={1000}
          className={`flex-1 w-full px-4 py-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none min-h-[120px]`}
          aria-describedby={errors.message ? "message-error" : "message-count"}
          required
        />
      </FormField>
      
      {submitError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg" role="alert">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 text-sm">{submitError}</span>
          </div>
        </div>
      )}
      
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full sm:w-auto px-8 py-3 font-medium rounded-full transition-all duration-200 ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-pink-500 hover:bg-pink-600 focus:ring-4 focus:ring-pink-200'
          } text-white`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;