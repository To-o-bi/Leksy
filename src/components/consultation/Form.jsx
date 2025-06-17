// Form.js
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
import { consultationService } from '../../api/services'; // Import the consultation service

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
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'failed', null
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

  const submitConsultation = async (formData) => {
    try {
      setIsProcessing(true);
      
      // Get current form values to ensure we have the latest data
      const currentValues = getValues();
      console.log('Current form values:', currentValues); // Debug log
      
      // Use current values instead of formData for more reliable data
      const timeSlot = currentValues.timeSlot || formData.timeSlot;
      const consultationFormat = currentValues.consultationFormat || formData.consultationFormat;
      const consultationDate = currentValues.consultationDate || formData.consultationDate;
      
      // Validate required fields before submission
      if (!timeSlot) {
        throw new Error('Please select a time slot');
      }
      
      if (!consultationFormat) {
        throw new Error('Please select a consultation format');
      }
      
      if (!consultationDate) {
        throw new Error('Please select a consultation date');
      }
      
      const consultationData = {
        name: (currentValues.name || formData.name).trim(),
        email: currentValues.email || formData.email,
        phone: currentValues.phone || formData.phone,
        age_range: currentValues.age_range || formData.age_range,
        gender: (currentValues.gender || formData.gender) || 'prefer-not-to-say',
        skin_type: currentValues.skin_type || formData.skin_type,
        skin_concerns: Array.isArray(currentValues.skin_concerns || formData.skin_concerns) 
          ? (currentValues.skin_concerns || formData.skin_concerns)
          : [currentValues.skin_concerns || formData.skin_concerns].filter(Boolean),
        channel: getAPIChannel(consultationFormat), // Use helper function
        date: consultationDate,
        time_range: mapTimeSlotToAPIRange(timeSlot), // Use helper function to map time slot
        current_skincare_products: (currentValues.current_skincare_products || formData.current_skincare_products) || '',
        additional_details: (currentValues.additional_details || formData.additional_details) || '',
        success_redirect: `${window.location.origin}/consultation/success`
      };

      console.log('Submitting consultation data:', consultationData); // Debug log

      const response = await consultationService.initiateConsultation(consultationData);
      
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
      console.error('Consultation booking error:', error);
      setSubmissionStatus('failed');
      alert(error.message || 'Failed to book consultation. Please try again.');
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
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const handlePrevStep = () => setStep(s => s - 1);

  const finalSubmitHandler = async (data) => {
    if (step === 3) {
      await submitConsultation(data);
    }
  };

  if (isProcessing && !submitted) {
    return <ProcessingOverlay />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto max-w-4xl">
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
