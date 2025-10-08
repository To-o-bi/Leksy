import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { initiateConsultation, fetchBookedTimes } from '../../../api/consultationService';
import PersonalInfoStep from './PersonalInfoStep';
import SkinConcernsStep from './SkinConcernsStep';
import ScheduleStep from './ScheduleStep';
import ConfirmationStep from './ConfirmationStep';

const timeSlotMapping = {
  '2:00 PM': '2:00 PM - 3:00 PM',
  '3:00 PM': '3:00 PM - 4:00 PM',
  '4:00 PM': '4:00 PM - 5:00 PM',
  '5:00 PM': '5:00 PM - 6:00 PM'
};

const validTimeRanges = Object.values(timeSlotMapping);

const ConsultationForm = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);
  const [isLoadingBookedTimes, setIsLoadingBookedTimes] = useState(false);
  
  const consultationDate = watch('consultationDate');

  const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  const getSuccessRedirectURL = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/consultation/success`;
  };

  useEffect(() => {
    if (consultationDate && !isWeekend(consultationDate)) {
      setIsLoadingBookedTimes(true);
      setSubmitError(''); // Clear any previous errors
      
      fetchBookedTimes(consultationDate)
        .then(data => {
          console.log('Fetched booked times for', consultationDate, ':', data);
          
          if (data.code === 200) {
            setBookedTimes(data.booked_times || []);
            
            // Log for debugging
            if (data.booked_times && data.booked_times.length > 0) {
              console.log('Booked times:', data.booked_times);
            }
          } else {
            console.warn('Unexpected response code:', data);
            setBookedTimes([]);
          }
        })
        .catch(error => {
          console.error('Error fetching booked times:', error);
          setBookedTimes([]);
          setSubmitError('Unable to fetch available time slots. Please try again.');
        })
        .finally(() => {
          setIsLoadingBookedTimes(false);
        });
    } else {
      setBookedTimes([]);
    }
  }, [consultationDate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (!data.consultationDate || !data.timeSlot) {
        throw new Error('Please select a consultation date and time slot');
      }

      if (!timeSlotMapping[data.timeSlot]) {
        throw new Error('Invalid time slot selected');
      }

      const selectedTimeRange = timeSlotMapping[data.timeSlot];
      
      // Double-check if the slot is still available
      console.log('Checking availability for:', {
        date: data.consultationDate,
        timeRange: selectedTimeRange,
        bookedTimes: bookedTimes
      });
      
      const isTimeBooked = bookedTimes.some(booked => {
        const dateMatch = booked.date === data.consultationDate;
        const timeMatch = booked.time_range === selectedTimeRange;
        
        console.log('Comparing:', {
          bookedDate: booked.date,
          selectedDate: data.consultationDate,
          dateMatch,
          bookedTime: booked.time_range,
          selectedTime: selectedTimeRange,
          timeMatch
        });
        
        return dateMatch && timeMatch;
      });

      if (isTimeBooked) {
        throw new Error('This time slot is no longer available. Please select another time.');
      }

      const consultationData = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone,
        age_range: data.ageRange,
        gender: data.gender,
        skin_type: data.skinType,
        skin_concerns: Array.isArray(data.skinConcerns) ? data.skinConcerns : [data.skinConcerns],
        current_skincare_products: data.currentProducts || '',
        additional_details: data.additionalInfo || '',
        channel: data.consultationFormat === 'video-call' ? 'video-channel' : 'whatsapp',
        date: data.consultationDate,
        time_range: selectedTimeRange,
        success_redirect: getSuccessRedirectURL()
      };

      console.log('Submitting consultation data:', consultationData);

      const result = await initiateConsultation(consultationData);
      
      console.log('Consultation result:', result);
      
      if (result.code === 200 && result.authorization_url) {
        sessionStorage.setItem('consultationBooking', JSON.stringify({
          name: consultationData.name,
          email: consultationData.email,
          date: consultationData.date,
          time_range: consultationData.time_range,
          channel: consultationData.channel,
          amount: result.amount_calculated
        }));

        window.location.href = result.authorization_url;
      } else {
        throw new Error(result.message || 'Consultation booking failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      
      // Extract clean error message
      let errorMessage = error.message || 'Failed to book consultation. Please try again.';
      
      // If the error message contains "Error: " prefix, remove it
      if (errorMessage.startsWith('Error: ')) {
        errorMessage = errorMessage.substring(7);
      }
      
      setSubmitError(errorMessage);
      
      // If it's a booking conflict, refresh the booked times
      if (errorMessage.includes('already been booked') || errorMessage.includes('no longer available')) {
        console.log('Refreshing booked times due to conflict...');
        if (consultationDate && !isWeekend(consultationDate)) {
          fetchBookedTimes(consultationDate)
            .then(data => {
              if (data.code === 200) {
                setBookedTimes(data.booked_times || []);
              }
            })
            .catch(err => console.error('Error refreshing booked times:', err));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setSubmitError('');
    
    if (step === 1) {
      const firstName = watch('firstName');
      const lastName = watch('lastName');
      const email = watch('email');
      const phone = watch('phone');
      
      if (!firstName || !lastName || !email || !phone) {
        setSubmitError('Please fill in all required fields before proceeding.');
        return;
      }
    }
    
    if (step === 2) {
      const skinType = watch('skinType');
      const skinConcerns = watch('skinConcerns');
      
      if (!skinType || !skinConcerns || (Array.isArray(skinConcerns) && skinConcerns.length === 0)) {
        setSubmitError('Please select your skin type and concerns before proceeding.');
        return;
      }
    }
    
    setStep(step + 1);
  };

  const prevStep = () => {
    setSubmitError('');
    setStep(step - 1);
  };

  if (submitted) {
    return <ConfirmationStep />;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= num ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {num}
              </div>
              <span className="text-xs mt-1 text-gray-500">
                {num === 1 ? 'About You' : num === 2 ? 'Skin Concerns' : 'Schedule'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {step === 1 && <PersonalInfoStep register={register} errors={errors} />}
        {step === 2 && <SkinConcernsStep register={register} errors={errors} watch={watch} />}
        {step === 3 && (
          <ScheduleStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            setValue={setValue}
            bookedTimes={bookedTimes}
            isLoadingBookedTimes={isLoadingBookedTimes}
            submitError={submitError}
            isSubmitting={isSubmitting}
          />
        )}

        {submitError && step !== 3 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">{submitError}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || isLoadingBookedTimes}
              className="ml-auto px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Booking...
                </>
              ) : (
                'Book Consultation'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConsultationForm;