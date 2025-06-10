import React, { useState, useEffect } from 'react';

const TIME_SLOTS = [
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM'
];

const TimeSlotSelector = ({ 
  register, 
  errors, 
  selectedTime, 
  onTimeChange, 
  selectedDate,
  onSlotUnavailable,
  getBookedTimesForDate,
  checkSlotAvailability,
  loading
}) => {
  const [bookedTimes, setBookedTimes] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Update booked times when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const booked = getBookedTimesForDate(selectedDate);
      setBookedTimes(booked);
      
      // If currently selected time is now booked, clear it
      if (selectedTime && booked.includes(selectedTime)) {
        onTimeChange('');
        if (onSlotUnavailable) {
          onSlotUnavailable(selectedTime);
        }
      }
    } else {
      setBookedTimes([]);
    }
  }, [selectedDate, selectedTime, onTimeChange, onSlotUnavailable, getBookedTimesForDate]);

  const handleTimeChange = async (time) => {
    // Double-check availability with API before allowing selection
    if (selectedDate) {
      setCheckingAvailability(true);
      try {
        const isAvailable = await checkSlotAvailability(selectedDate, time);
        if (!isAvailable) {
          if (onSlotUnavailable) {
            onSlotUnavailable(time);
          }
          return;
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        return;
      } finally {
        setCheckingAvailability(false);
      }
    }
    onTimeChange(time);
  };

  const isTimeSlotDisabled = (time) => {
    if (!selectedDate) return true; // Disable all if no date selected
    return bookedTimes.includes(time) || loading || checkingAvailability;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
        Preferred Time Slot
        <span className="text-xs text-gray-500 block mt-1">(2:00 PM to 6:00 PM)</span>
        {!selectedDate && (
          <span className="text-xs text-orange-600 block mt-1">Please select a date first</span>
        )}
        {loading && (
          <span className="text-xs text-blue-600 block mt-1">Loading availability...</span>
        )}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {TIME_SLOTS.map((time) => {
          const isDisabled = isTimeSlotDisabled(time);
          const isSelected = selectedTime === time;
          const isBooked = bookedTimes.includes(time);
          
          return (
            <label 
              key={time} 
              className={`flex items-center justify-center p-2 sm:p-3 border rounded-md transition-all duration-200 text-center relative ${
                isDisabled 
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                  : isSelected 
                    ? 'bg-pink-100 border-pink-500 text-pink-700 cursor-pointer' 
                    : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50 cursor-pointer'
              }`}
            >
              <input
                type="radio"
                {...register('timeSlot', { required: 'Please select a time slot' })}
                value={time}
                className="sr-only"
                disabled={isDisabled}
                onChange={(e) => handleTimeChange(e.target.value)}
                checked={selectedTime === time}
              />
              <div className="text-center">
                <span className={`text-xs sm:text-sm font-medium block ${
                  isBooked ? 'line-through' : ''
                }`}>
                  {time}
                </span>
                {isBooked && (
                  <span className="text-xs text-red-500 block mt-1">Booked</span>
                )}
                {checkingAvailability && (
                  <span className="text-xs text-blue-500 block mt-1">Checking...</span>
                )}
              </div>
              {isBooked && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-50 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>
      {errors.timeSlot && (
        <span className="text-red-500 text-xs sm:text-sm block mt-2">
          {errors.timeSlot.message}
        </span>
      )}
      
      {/* Availability Summary */}
      {selectedDate && !loading && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600">
            <strong>Availability for {selectedDate}:</strong>
            <div className="mt-1">
              Available: {TIME_SLOTS.length - bookedTimes.length} slots | 
              Booked: {bookedTimes.length} slots
            </div>
            {bookedTimes.length > 0 && (
              <div className="mt-1 text-red-600">
                Unavailable times: {bookedTimes.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;