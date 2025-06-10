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
import { CONSULTATION_FORMATS } from './constants';  // Assuming constants.js 

const Form = () => {
  const { register, handleSubmit, formState: { errors, touchedFields, dirtyFields }, watch, trigger, getValues } = useForm({
    mode: 'onChange', // Or 'onTouched'
    defaultValues: { // Initialize default values if any
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        ageRange: '',
        skinType: '',
        skinConcerns: [],
        additionalInfo: '',
        consultationDate: '',
        timeSlot: '',
        consultationFormat: '',
        termsAgreed: false
    }
  });

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed', null

  const selectedFormatId = watch('consultationFormat');

  const getSelectedPrice = useCallback(() => {
    const format = CONSULTATION_FORMATS.find(f => f.id === selectedFormatId);
    return format ? format.price : 0;
  }, [selectedFormatId]);

  const getSelectedPriceDisplay = useCallback(() => {
    const format = CONSULTATION_FORMATS.find(f => f.id === selectedFormatId);
    return format ? format.displayPrice : '';
  }, [selectedFormatId]);

  const initializePayment = async (formData) => {
    try {
      setIsProcessing(true);
      const paymentData = {
        email: formData.email,
        amount: getSelectedPrice() * 100,
        metadata: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          consultationType: selectedFormatId,
          consultationDate: formData.consultationDate,
          timeSlot: formData.timeSlot
        },
        callback_url: `${window.location.origin}/consultation/callback`,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      };

      const response = await fetch('/api/consultation/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paymentData, consultationData: formData }),
      });
      const result = await response.json();

      if (result.success) {
        window.location.href = result.data.authorization_url;
      } else {
        throw new Error(result.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const verifyPayment = useCallback(async (reference, status) => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/consultation/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, status }),
      });
      const result = await response.json();

      if (result.success && result.data.status === 'success') {
        setPaymentStatus('success');
        setSubmitted(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setPaymentStatus('failed');
        alert(result.message || 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
      alert('Payment verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  }, []); // Empty dependency array as it uses no external state directly

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const trxref = urlParams.get('trxref'); // Paystack often uses trxref as well
    const statusParam = urlParams.get('status'); // Your custom status param

    const paymentReference = reference || trxref;

    if (paymentReference && !submitted && paymentStatus === null) { // Ensure it only runs once
        // Use statusParam if available, otherwise assume Paystack callback means to verify
        verifyPayment(paymentReference, statusParam || 'callback_verification');
    }
  }, [verifyPayment, submitted, paymentStatus]);


  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'ageRange'];
    } else if (step === 2) {
      fieldsToValidate = ['skinType', 'skinConcerns'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const handlePrevStep = () => setStep(s => s - 1);

  const finalSubmitHandler = async (data) => {
    // This function is called by react-hook-form's handleSubmit
    // It already implies all fields (up to the current step, or all if on final step) are valid
    if (step === 3) {
        await initializePayment(data);
    }
  };


  if (isProcessing && !submitted) { // Show processing only if not yet submitted (e.g. during verify)
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
                />
              )}
              <FormNavigation
                step={step}
                onPrev={handlePrevStep}
                onNext={handleNextStep} // RHF's handleSubmit is now only for the final submit button
                isProcessing={isProcessing}
                priceDisplay={getSelectedPriceDisplay()}
              />
            </div>
          </form>
        ) : paymentStatus === 'success' ? (
          <SubmissionSuccess />
        ) : paymentStatus === 'failed' ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 text-center">
             <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-3 sm:mb-4">Payment Failed</h2>
             <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                Unfortunately, we couldn't process your payment. Please try again or contact support. 
             </p>
             <button
                onClick={() => {
                    setSubmitted(false);
                    setPaymentStatus(null);
                    setStep(3); // Go back to payment step
                    window.history.replaceState({}, document.title, window.location.pathname); // Clear URL params
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 text-sm sm:text-base font-medium transition-colors"
            >
                Try Again
            </button>
          </div>
        ) : null /* Or some other fallback for unexpected state */
        }
      </div>
    </div>
  );
};

export default Form;