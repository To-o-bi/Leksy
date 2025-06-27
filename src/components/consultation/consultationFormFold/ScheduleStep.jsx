// src/components/consultation/ScheduleStep.js
import React, { useEffect } from 'react';

const timeSlotMapping = {
  '2:00 PM': '2:00 PM - 3:00 PM',
  '3:00 PM': '3:00 PM - 4:00 PM',
  '4:00 PM': '4:00 PM - 5:00 PM',
  '5:00 PM': '5:00 PM - 6:00 PM'
};

const timeSlots = Object.keys(timeSlotMapping);

const ScheduleStep = ({ 
  register, 
  errors, 
  watch, 
  bookedTimes, 
  submitError, 
  isSubmitting,
  setValue 
}) => {
  const consultationDate = watch('consultationDate');
  const selectedTimeSlot = watch('timeSlot');
  const selectedFormat = watch('consultationFormat');
  const termsAgreed = watch('termsAgreed');
  
  const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  // Get next available weekday
  const getNextWeekday = () => {
    const today = new Date();
    let nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    
    while (isWeekend(nextDay.toISOString().split('T')[0])) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay.toISOString().split('T')[0];
  };

  // Clear time slot if date changes to weekend
  useEffect(() => {
    if (consultationDate && isWeekend(consultationDate)) {
      setValue('consultationDate', '');
      setValue('timeSlot', '');
    }
  }, [consultationDate, setValue]);

  // Generate disabled dates for the date input (weekends)
  const getDisabledDates = () => {
    const disabledDates = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + 3); // 3 months ahead
    
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (isWeekend(d.toISOString().split('T')[0])) {
        disabledDates.push(d.toISOString().split('T')[0]);
      }
    }
    return disabledDates;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-8">Schedule Your Consultation</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Consultation Date
          <span className="text-xs text-gray-500 block mt-1">
            Consultations are available Monday to Friday only
          </span>
        </label>
        <input
          type="date"
          {...register('consultationDate', { 
            required: 'Please select a date',
            validate: value => {
              if (!value) return 'Please select a date';
              
              const selectedDate = new Date(value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              if (selectedDate < today) {
                return 'Please select a future date';
              }
              if (isWeekend(value)) {
                return 'Consultations are not available on weekends. Please select a weekday.';
              }
              return true;
            }
          })}
          min={getNextWeekday()}
          className={`w-full px-4 py-2 border rounded-md focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 ${
            consultationDate 
              ? 'border-pink-500 bg-pink-50 shadow-sm' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onInput={(e) => {
            // Additional client-side validation to prevent weekend selection
            if (e.target.value && isWeekend(e.target.value)) {
              e.target.setCustomValidity('Consultations are not available on weekends');
              e.target.reportValidity();
              setTimeout(() => {
                e.target.value = '';
                setValue('consultationDate', '');
              }, 100);
            } else {
              e.target.setCustomValidity('');
            }
          }}
        />
        {errors.consultationDate && (
          <span className="text-red-500 text-sm mt-1 block">{errors.consultationDate.message}</span>
        )}
        
        {/* Weekend warning */}
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-blue-700">
              Note: Consultations are only available Monday through Friday. Weekend dates are not selectable.
            </span>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Time Slot
          {!consultationDate && (
            <span className="text-xs text-gray-500 block mt-1">
              Please select a date first
            </span>
          )}
        </label>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${!consultationDate ? 'opacity-50 pointer-events-none' : ''}`}>
          {timeSlots.map((time) => {
            const apiTimeRange = timeSlotMapping[time];
            const isBooked = bookedTimes.some(
              booked => booked.date === consultationDate && 
              booked.time_range === apiTimeRange
            );
            const isSelected = selectedTimeSlot === time;
            const isDisabled = !consultationDate || isBooked;
            
            return (
              <label 
                key={time} 
                className={`relative flex items-center p-3 border rounded-md cursor-pointer transition-all duration-200 ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200' 
                    : isSelected
                      ? 'bg-pink-100 border-pink-200 shadow-md transform scale-105'
                      : 'border-gray-300 hover:bg-pink-50 hover:border-pink-300 hover:shadow-sm'
                }`}
              >
                <input
                  type="radio"
                  {...register('timeSlot', { 
                    required: 'Please select a time slot',
                    validate: value => {
                      if (!consultationDate) {
                        return 'Please select a date first';
                      }
                      const apiTimeRange = timeSlotMapping[value];
                      const isBooked = bookedTimes.some(
                        booked => booked.date === consultationDate && 
                        booked.time_range === apiTimeRange
                      );
                      return !isBooked || 'This time slot is already booked';
                    }
                  })}
                  value={time}
                  className="h-4 w-4 text-pink-500 focus:ring-pink-500"
                  disabled={isDisabled}
                />
                <span className={`ml-2 ${isSelected ? 'font-medium text-pink-700' : ''}`}>
                  {time}
                  {isBooked && <span className="text-xs text-red-500 block">Booked</span>}
                  {!consultationDate && <span className="text-xs text-gray-400 block">Select date first</span>}
                </span>
                {isSelected && !isBooked && consultationDate && (
                  <div className="absolute top-1 right-1">
                    <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>
        {errors.timeSlot && (
          <span className="text-red-500 text-sm block mt-1">{errors.timeSlot.message}</span>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Consultation Format
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className={`relative flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all duration-200 ${
            selectedFormat === 'video-call'
              ? 'bg-pink-100 border-pink-500 shadow-md'
              : 'border-gray-300 hover:bg-pink-50 hover:border-pink-300 hover:shadow-sm'
          }`}>
            <div className="flex items-center">
              <input
                type="radio"
                {...register('consultationFormat', { required: 'Please select a format' })}
                value="video-call"
                className="h-4 w-4 text-pink-500 focus:ring-pink-500"
              />
              <span className={`ml-2 ${selectedFormat === 'video-call' ? 'font-medium text-pink-700' : ''}`}>
                Video Call (Zoom or Google Meet)
              </span>
            </div>
            <span className={`font-semibold ${selectedFormat === 'video-call' ? 'text-pink-600' : 'text-pink-600'}`}>
              ₦35,000
            </span>
            {selectedFormat === 'video-call' && (
              <div className="absolute top-2 right-2">
                <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>
          
          <label className={`relative flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all duration-200 ${
            selectedFormat === 'whatsapp'
              ? 'bg-pink-100 border-pink-500 shadow-md transform'
              : 'border-gray-300 hover:bg-pink-50 hover:border-pink-300 hover:shadow-sm'
          }`}>
            <div className="flex items-center">
              <input
                type="radio"
                {...register('consultationFormat', { required: 'Please select a format' })}
                value="whatsapp"
                className="h-4 w-4 text-pink-500 focus:ring-pink-500"
              />
              <span className={`ml-2 ${selectedFormat === 'whatsapp' ? 'font-medium text-pink-700' : ''}`}>
                WhatsApp Consultation
              </span>
            </div>
            <span className={`font-semibold ${selectedFormat === 'whatsapp' ? 'text-pink-600' : 'text-pink-600'}`}>
              ₦15,000
            </span>
            {selectedFormat === 'whatsapp' && (
              <div className="absolute top-2 right-2">
                <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>
        </div>
        {errors.consultationFormat && (
          <span className="text-red-500 text-sm block mt-1">{errors.consultationFormat.message}</span>
        )}
      </div>
      
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id="termsAgreed"
            {...register('termsAgreed', { required: 'You must agree to the terms' })}
            className="h-4 w-4 text-pink-500 focus:ring-pink-500 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3">
          <label 
            htmlFor="termsAgreed" 
            className={`block text-sm cursor-pointer transition-colors duration-200 ${
              termsAgreed ? 'text-pink-700 font-medium' : 'text-gray-700'
            }`}
          >
            I agree to the{' '}
            <a href="/terms" className="text-pink-500 underline hover:text-pink-600 transition-colors duration-200">
              terms and conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-pink-500 underline hover:text-pink-600 transition-colors duration-200">
              privacy policy
            </a>
          </label>
          {termsAgreed && (
            <div className="flex items-center mt-1">
              <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-green-600">Terms accepted</span>
            </div>
          )}
        </div>
      </div>
      {errors.termsAgreed && (
        <span className="text-red-500 text-sm block">{errors.termsAgreed.message}</span>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-700">{submitError}</span>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {(consultationDate || selectedTimeSlot || selectedFormat) && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-pink-800 mb-2">Your Selection Summary:</h3>
          <div className="space-y-1 text-sm text-pink-700">
            {consultationDate && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Date: {new Date(consultationDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
            {selectedTimeSlot && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Time: {timeSlotMapping[selectedTimeSlot]}</span>
              </div>
            )}
            {selectedFormat && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                </svg>
                <span>Format: {selectedFormat === 'video-call' ? 'Video Call (₦35,000)' : 'WhatsApp (₦15,000)'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleStep;