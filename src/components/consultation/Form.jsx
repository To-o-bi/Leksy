// Form.js - Ultimate Debug Version
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import ProcessingOverlay from './ProcessingOverlay';
import SubmissionSuccess from './SubmissionSuccess';
import ProgressIndicator from './ProgressIndicator';
import FormNavigation from './FormNavigation'; 
import PersonalInformationStep from './PersonalInformationStep';
import SkinConcernsStep from './SkinConcernsStep'; 
import SchedulePaymentStep from './SchedulePayment/SchedulePaymentStep';
import { CONSULTATION_FORMATS, mapTimeSlotToAPIRange, getAPIChannel } from './constants';
import { consultationService } from '../../api/services';

const Form = () => {
  const { register, handleSubmit, formState: { errors, touchedFields, dirtyFields }, watch, trigger, getValues, setValue } = useForm({
    mode: 'onChange',
    defaultValues: {
        name: '',
        email: '',
        phone: '',
        age_range: '',
        gender: '',
        skin_type: '',
        skin_concerns: [],
        current_skincare_products: '',
        additional_details: '',
        consultationDate: '',
        timeSlot: '',
        consultationFormat: '',
        termsAgreed: false
    }
  });

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);

  const selectedFormatId = watch('consultationFormat');
  const selectedDate = watch('consultationDate');

  const getSelectedPrice = useCallback(() => {
    const format = CONSULTATION_FORMATS.find(f => f.id === selectedFormatId);
    return format ? format.price : 0;
  }, [selectedFormatId]);

  const getSelectedPriceDisplay = useCallback(() => {
    const format = CONSULTATION_FORMATS.find(f => f.id === selectedFormatId);
    return format ? format.displayPrice : '';
  }, [selectedFormatId]);

  const fetchBookedTimes = useCallback(async (date) => {
    if (!date) return;
    
    try {
      const response = await consultationService.fetchBookedTimes(date);
      if (response.success && response.data) {
        setBookedTimes(response.data.booked_times || []);
      }
    } catch (error) {
      console.error('Error fetching booked times:', error);
      setBookedTimes([]);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchBookedTimes(selectedDate);
    }
  }, [selectedDate, fetchBookedTimes]);

  // Ultimate validation function with detailed logging
  const createConsultationPayload = (formData) => {
    console.log('🔧 STARTING PAYLOAD CREATION');
    console.log('Raw form data:', formData);
    
    // Get current form values
    const currentValues = getValues();
    console.log('Current form values from getValues():', currentValues);
    
    // Merge data
    const mergedData = { ...formData, ...currentValues };
    console.log('Merged data:', mergedData);
    
    // Create payload step by step with validation
    const payload = {};
    
    // Helper function to validate and add field
    const addField = (apiField, sourceField, isRequired = true, transform = null) => {
      let value = mergedData[sourceField];
      
      if (transform && typeof transform === 'function') {
        value = transform(value);
      }
      
      console.log(`Processing ${apiField}:`, {
        sourceField,
        rawValue: mergedData[sourceField],
        transformedValue: value,
        type: typeof value,
        isRequired,
        isEmpty: !value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)
      });
      
      if (isRequired && (!value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0))) {
        throw new Error(`${apiField} is required but is empty or invalid`);
      }
      
      if (value !== undefined && value !== null && value !== '') {
        payload[apiField] = value;
      }
    };
    
    try {
      // Required fields
      addField('name', 'name', true, (v) => v?.toString().trim());
      addField('email', 'email', true, (v) => v?.toString().trim());
      addField('phone', 'phone', true, (v) => v?.toString().trim());
      addField('age_range', 'age_range', true, (v) => v?.toString().trim());
      addField('gender', 'gender', true, (v) => v?.toString().trim());
      addField('skin_type', 'skin_type', true, (v) => v?.toString().trim());
      
      // Handle skin_concerns array
      addField('skin_concerns', 'skin_concerns', true, (v) => {
        if (Array.isArray(v)) {
          return v.filter(concern => concern && concern.toString().trim());
        } else if (v) {
          return [v.toString().trim()].filter(Boolean);
        }
        return [];
      });
      
      // Handle channel
      addField('channel', 'consultationFormat', true, (v) => {
        const channel = getAPIChannel(v);
        console.log('Channel transformation:', { input: v, output: channel });
        return channel;
      });
      
      // Handle date
      addField('date', 'consultationDate', true, (v) => v?.toString().trim());
      
      // Handle time_range
      addField('time_range', 'timeSlot', true, (v) => {
        const range = mapTimeSlotToAPIRange(v);
        console.log('Time range transformation:', { input: v, output: range });
        return range;
      });
      
      // Success redirect
      payload.success_redirect = `${window.location.origin}/consultation/success`;
      
      // Optional fields
      addField('current_skincare_products', 'current_skincare_products', false, (v) => v?.toString().trim());
      addField('additional_details', 'additional_details', false, (v) => v?.toString().trim());
      
      console.log('✅ FINAL PAYLOAD:', payload);
      
      // Final validation check
      const requiredApiFields = ['email', 'name', 'phone', 'age_range', 'gender', 'skin_type', 'skin_concerns', 'channel', 'date', 'time_range', 'success_redirect'];
      const missingFields = [];
      
      requiredApiFields.forEach(field => {
        const value = payload[field];
        if (!value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        console.error('❌ MISSING FIELDS:', missingFields);
        console.error('Current payload:', payload);
        throw new Error(`Still missing required fields after processing: ${missingFields.join(', ')}`);
      }
      
      return payload;
      
    } catch (error) {
      console.error('❌ PAYLOAD CREATION FAILED:', error);
      throw error;
    }
  };

  const submitConsultation = async (formData) => {
    try {
      setIsProcessing(true);
      
      console.log('🚀 =================================');
      console.log('🚀 FORM SUBMISSION STARTED');
      console.log('🚀 =================================');
      
      // Create the payload with detailed logging
      const consultationData = createConsultationPayload(formData);
      
      console.log('📤 SENDING TO API:', consultationData);
      
      const response = await consultationService.initiateConsultation(consultationData);
      
      console.log('📥 API RESPONSE:', response);
      
      if (response.success) {
        if (response.data?.authorization_url) {
          window.location.href = response.data.authorization_url;
        } else {
          setSubmissionStatus('success');
          setSubmitted(true);
        }
      } else {
        throw new Error(response.message || 'Consultation booking failed');
      }
    } catch (error) {
      console.error('❌ =================================');
      console.error('❌ CONSULTATION BOOKING ERROR');
      console.error('❌ =================================');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      setSubmissionStatus('failed');
      alert(`Booking failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = useCallback(async (reference, status) => {
    try {
      setIsProcessing(true);
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('status');
      
      if (paymentStatus === 'success' || status === 'success') {
        setSubmissionStatus('success');
        setSubmitted(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setSubmissionStatus('failed');
        alert('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setSubmissionStatus('failed');
      alert('Payment verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const trxref = urlParams.get('trxref');
    const statusParam = urlParams.get('status');
    const paymentReference = reference || trxref;

    if (paymentReference && !submitted && submissionStatus === null) {
      verifyPayment(paymentReference, statusParam || 'callback_verification');
    }
  }, [verifyPayment, submitted, submissionStatus]);

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['name', 'email', 'phone', 'age_range', 'gender'];
    } else if (step === 2) {
      fieldsToValidate = ['skin_type', 'skin_concerns'];
    }

    const isValid = await trigger(fieldsToValidate);
    console.log('Validation result for step', step, ':', isValid);
    console.log('Current form values:', getValues());
    
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const handlePrevStep = () => setStep(s => s - 1);

  const finalSubmitHandler = async (data) => {
    if (step === 3) {
      console.log('🎯 FINAL SUBMIT HANDLER TRIGGERED');
      console.log('Form data passed to handler:', data);
      console.log('Current form state:', getValues());
      await submitConsultation(data);
    }
  };

  if (isProcessing && !submitted) {
    return <ProcessingOverlay />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto max-w-4xl">
        {/* Debug Panel */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-yellow-800 mb-2">🐛 Debug Info (Step {step})</h3>
          <div className="text-xs space-y-2">
            <div>
              <strong>Current form values:</strong>
              <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(getValues(), null, 2)}
              </pre>
            </div>
            <div>
              <strong>Watched values:</strong>
              <div>selectedFormatId: {selectedFormatId || 'undefined'}</div>
              <div>selectedDate: {selectedDate || 'undefined'}</div>
            </div>
            {step === 3 && (
              <div>
                <strong>API Helpers Test:</strong>
                <div>getAPIChannel({selectedFormatId}): {getAPIChannel(selectedFormatId) || 'undefined'}</div>
                <div>mapTimeSlotToAPIRange({getValues().timeSlot}): {mapTimeSlotToAPIRange(getValues().timeSlot) || 'undefined'}</div>
              </div>
            )}
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit(finalSubmitHandler)} className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
            <ProgressIndicator currentStep={step} />
            <div className="p-4 sm:p-6 lg:p-8">
              {step === 1 && <PersonalInformationStep register={register} errors={errors} />}
              {step === 2 && <SkinConcernsStep register={register} errors={errors} watch={watch} />}
              {step === 3 && (
                <SchedulePaymentStep
                  register={register}
                  errors={errors}
                  selectedConsultationFormatId={selectedFormatId}
                  getSelectedPriceDisplay={getSelectedPriceDisplay}
                  bookedTimes={bookedTimes}
                  getValues={getValues}
                  watch={watch}
                  setValue={setValue}
                  onBookingSuccess={async (bookingData) => {
                    setSubmissionStatus('success');
                    setSubmitted(true);
                  }}
                />
              )}
              <FormNavigation
                step={step}
                onPrev={handlePrevStep}
                onNext={handleNextStep}
                isProcessing={isProcessing}
                priceDisplay={getSelectedPriceDisplay()}
              />
            </div>
          </form>
        ) : submissionStatus === 'success' ? (
          <SubmissionSuccess />
        ) : submissionStatus === 'failed' ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-3 sm:mb-4">Booking Failed</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
              Unfortunately, we couldn't process your consultation booking. Please try again or contact support.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setSubmissionStatus(null);
                setStep(3);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 text-sm sm:text-base font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : null} 
      </div>
    </div>
  );
};

export default Form;