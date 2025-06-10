import React from 'react';

// Helper functions remain the same
const getNextWeekday = (date = new Date()) => {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  
  if (nextDay.getDay() === 0) { // Sunday
    nextDay.setDate(nextDay.getDate() + 1); // Move to Monday
  } else if (nextDay.getDay() === 6) { // Saturday
    nextDay.setDate(nextDay.getDate() + 2); // Move to Monday
  }
  
  return nextDay;
};

const isWeekday = (dateString) => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5;
};

const getMinDate = () => {
  const today = new Date();
  const nextWeekday = getNextWeekday(today);
  return nextWeekday.toISOString().split('T')[0];
};

const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  return maxDate.toISOString().split('T')[0];
};

const validateWeekday = (value) => {
  if (!value) return 'Please select a date';
  if (!isWeekday(value)) {
    return 'Please select a weekday (Monday to Friday)';
  }
  return true;
};

const formatSelectedDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

const DateSelector = ({ 
  register, 
  errors, 
  selectedDate, 
  onDateChange, 
  onWeekendSelected,
  onDateChangeEffect,
  getBookedTimesForDate,
  loading
}) => {
  const handleDateChange = (e) => {
    const selectedDateValue = e.target.value;
    onDateChange(selectedDateValue);
    
    if (selectedDateValue) {
      const selectedDate = new Date(selectedDateValue);
      const dayOfWeek = selectedDate.getDay();
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setTimeout(() => {
          e.target.value = '';
          onDateChange('');
          onWeekendSelected();
        }, 10);
        return;
      }
      
      // Trigger effect to update available time slots
      if (onDateChangeEffect) {
        onDateChangeEffect(selectedDateValue);
      }
    } else {
      if (onDateChangeEffect) {
        onDateChangeEffect('');
      }
    }
  };

  // Check if date has any available time slots
  const hasAvailableSlots = (dateString) => {
    if (!dateString) return true;
    const bookedTimes = getBookedTimesForDate(dateString);
    const TIME_SLOTS = ['2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
    return bookedTimes.length < TIME_SLOTS.length;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Preferred Consultation Date
        <span className="text-xs text-gray-500 block mt-1">(Monday to Friday only)</span>
      </label>
      <input
        type="date"
        {...register('consultationDate', { 
          required: 'Please select a date',
          validate: validateWeekday
        })}
        min={getMinDate()}
        max={getMaxDate()}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm sm:text-base [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        style={{
          colorScheme: 'light'
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Tab' && e.key !== 'Shift' && e.key !== 'Enter' && e.key !== 'Escape') {
            e.preventDefault();
          }
        }}
        onChange={handleDateChange}
        disabled={loading}
      />
      {errors.consultationDate && (
        <span className="text-red-500 text-xs sm:text-sm mt-1 block">
          {errors.consultationDate.message}
        </span>
      )}
      <div className="mt-1 text-xs text-gray-500">
        Note: Weekend dates will be automatically cleared if selected
      </div>
      
      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-pink-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Selected Date:</span>
            {loading && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
          </div>
          <p className="text-base font-semibold text-pink-700 mt-1">
            {formatSelectedDate(selectedDate)}
          </p>
          {!hasAvailableSlots(selectedDate) && !loading && (
            <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
              ⚠️ All time slots for this date are fully booked
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateSelector;
