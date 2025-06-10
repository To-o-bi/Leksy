// components/SchedulePaymentStep.js (Updated Main Component)
import React, { useState } from 'react';
import { CONSULTATION_FORMATS } from '../../consultation/constants';
import { useBookingData } from '../../../hooks/useBookingData';
import CustomModal from './CustomModal';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import ConsultationFormatSelector from './ConsultationFormatSelector';
import PriceDisplay from './PriceDisplay';
import TermsCheckbox from './TermsCheckbox';

const SchedulePaymentStep = ({ 
  register, 
  errors, 
  selectedConsultationFormatId, 
  getSelectedPriceDisplay,
  userId = null,
  onBookingSuccess = null
}) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning'
  });
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the booking data hook
  const {
    loading,
    error,
    createBooking,
    getBookedTimesForDate,
    checkSlotAvailability,
    fetchAvailabilityForDate
  } = useBookingData(selectedDate);

  const showModal = (title, message, type = 'warning') => {
    setModalState({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleWeekendSelected = () => {
    showModal(
      'Weekend Not Available',
      'We only offer consultations on weekdays (Monday to Friday). Please select a date between Monday and Friday for your appointment.',
      'info'
    );
  };

  const handleSlotUnavailable = (time) => {
    showModal(
      'Time Slot Unavailable',
      `The ${time} time slot for ${selectedDate} has been booked by another user. Please select a different time slot.`,
      'warning'
    );
  };

  const handleDateChangeEffect = (date) => {
    // This is called when date changes to update time slot availability
    if (!date) {
      setSelectedTime(''); // Clear time when date is cleared
    } else {
      // Fetch availability for the new date
      fetchAvailabilityForDate(date);
    }
  };

  // Function to handle form submission
  const handleBookingSubmission = async (formData = {}) => {
    if (!selectedDate || !selectedTime) {
      showModal(
        'Missing Information',
        'Please select both a date and time for your consultation.',
        'warning'
      );
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        consultation_format_id: selectedConsultationFormatId,
        user_id: userId,
        ...formData // Include any additional form data
      };

      const result = await createBooking(bookingData);
      
      if (result.success) {
        showModal(
          'Booking Confirmed!',
          `Your consultation has been scheduled for ${selectedDate} at ${selectedTime}. You will receive a confirmation email shortly.`,
          'info'
        );
        
        // Call success callback if provided
        if (onBookingSuccess) {
          onBookingSuccess(result.data);
        }
        
        return true;
      } else {
        showModal(
          'Booking Failed',
          result.error || 'This time slot may have been booked by another user. Please select a different time.',
          'error'
        );
        
        // Clear the selected time and refresh availability
        setSelectedTime('');
        if (selectedDate) {
          fetchAvailabilityForDate(selectedDate);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      showModal(
        'Booking Error',
        'An unexpected error occurred. Please try again or contact support.',
        'error'
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
      
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">
          Schedule Your Consultation
        </h2>
        
        {/* Display API errors */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        <DateSelector
          register={register}
          errors={errors}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onWeekendSelected={handleWeekendSelected}
          onDateChangeEffect={handleDateChangeEffect}
          getBookedTimesForDate={getBookedTimesForDate}
          loading={loading}
        />

        <TimeSlotSelector
          register={register}
          errors={errors}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
          selectedDate={selectedDate}
          onSlotUnavailable={handleSlotUnavailable}
          getBookedTimesForDate={getBookedTimesForDate}
          checkSlotAvailability={checkSlotAvailability}
          loading={loading}
        />

        <ConsultationFormatSelector
          register={register}
          errors={errors}
          consultationFormats={CONSULTATION_FORMATS}
          selectedConsultationFormatId={selectedConsultationFormatId}
        />

        <PriceDisplay
          selectedConsultationFormatId={selectedConsultationFormatId}
          getSelectedPriceDisplay={getSelectedPriceDisplay}
        />

        <TermsCheckbox
          register={register}
          errors={errors}
        />

        {/* Submit Button (if you want to include it in this component) */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => handleBookingSubmission()}
            disabled={isSubmitting || loading || !selectedDate || !selectedTime}
            className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? 'Processing...' : 'Book Consultation'}
          </button>
        </div>
      </div>
    </>
  );
};

// Export the booking submission handler for use in parent components
export { SchedulePaymentStep as default, useBookingData };