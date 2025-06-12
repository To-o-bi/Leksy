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

  return (
    <div className="bg-white">
      <form onSubmit={onSubmit} className="space-y-6">
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
          />
        </FormField>

        {/* Phone Field */}
        <FormField
          label="Phone Number"
          id="phone"
          error={errors.phone}
          required
        >
          <div className="flex">
            <CountryCodeSelect
              value={values.countryCode}
              onChange={onChange}
            />
            <Input
              type="tel"
              name="phone"
              id="phone"
              value={values.phone}
              onChange={handlePhoneChange}
              placeholder="555-014-0983"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors border-l-0"
              error={errors.phone}
              maxLength={12}
              required
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
            className={`w-full px-4 py-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-y min-h-[120px]`}
            aria-describedby={errors.message ? "message-error" : "message-count"}
            required
          />
        </FormField>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSubmitting}
          className="mt-6"
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
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;