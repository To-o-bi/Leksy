import { useState, useEffect, useCallback } from 'react';
import { consultationService } from '../api/services';

export const useBookingData = (selectedDate = null) => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch booked times for all dates or a specific date
  const fetchBookedSlots = useCallback(async (date = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await consultationService.fetchBookedTimes(date);
      
      if (response.success && response.data) {
        if (date) {
          setAvailabilityData(prev => ({
            ...prev,
            [date]: {
              booked_times: response.data.booked_times || [],
              available_slots: response.data.available_slots || []
            }
          }));
        } else {
          setBookedSlots(response.data.booked_times || []);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch booking data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailabilityForDate = useCallback(async (date) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await consultationService.fetchBookedTimes(date);
      
      if (response.success && response.data) {
        setAvailabilityData(prev => ({
          ...prev,
          [date]: {
            booked_times: response.data.booked_times || [],
            available_slots: response.data.available_slots || []
          }
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch availability data');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkSlotAvailability = useCallback(async (date, timeSlot) => {
    try {
      const dateAvailability = availabilityData[date];
      if (dateAvailability) {
        const bookedTimes = dateAvailability.booked_times || [];
        return !bookedTimes.includes(timeSlot);
      }

      const response = await consultationService.fetchBookedTimes(date);
      if (response.success && response.data) {
        const bookedTimes = response.data.booked_times || [];
        return !bookedTimes.includes(timeSlot);
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to check slot availability');
      return false;
    }
  }, [availabilityData]);

  // Enhanced createBooking with detailed logging
  const createBooking = useCallback(async (bookingData) => {
    
    setLoading(true);
    setError(null);
    
    try {
      // Build consultation data step by step with logging
      const name = bookingData.name || 
                   (bookingData.firstName && bookingData.lastName ? 
                    `${bookingData.firstName} ${bookingData.lastName}`.trim() : '');
      
      const email = bookingData.email || '';
      const phone = bookingData.phone || '';
      
      
      // Check for missing critical fields early
      if (!name) {
        throw new Error('Name is required. Please check firstName and lastName fields.');
      }
      
      if (!email) {
        throw new Error('Email is required. Please check the email field.');
      }
      
      if (!phone) {
        throw new Error('Phone number is required.');
      }

      const consultationData = {
        name: name,
        email: email,
        phone: phone,
        age_range: bookingData.ageRange || bookingData.age_range || '',
        gender: bookingData.gender || 'prefer-not-to-say',
        skin_type: bookingData.skinType || bookingData.skin_type || '',
        skin_concerns: Array.isArray(bookingData.skinConcerns) 
          ? bookingData.skinConcerns 
          : (Array.isArray(bookingData.skin_concerns) ? bookingData.skin_concerns : []),
        channel: bookingData.consultationFormat || bookingData.channel || 'video-channel',
        date: bookingData.date || bookingData.consultationDate || '',
        time_range: bookingData.timeSlot || bookingData.time_range || '',
        current_skincare_products: bookingData.currentSkincareProducts || bookingData.current_skincare_products || '',
        additional_details: bookingData.additionalInfo || bookingData.additional_details || '',
        success_redirect: bookingData.success_redirect
      };


      // Validate that we have all required fields
      const requiredFields = ['name', 'email', 'phone', 'age_range', 'skin_type', 'channel', 'date', 'time_range'];
      const missingFields = requiredFields.filter(field => !consultationData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate skin_concerns separately
      if (!consultationData.skin_concerns || 
          (Array.isArray(consultationData.skin_concerns) && consultationData.skin_concerns.length === 0)) {
        throw new Error('Please select at least one skin concern');
      }


      const response = await consultationService.initiateConsultation(consultationData);
      
      
      if (response.success) {
        // Refresh availability data after successful booking
        const bookingDate = consultationData.date;
        if (bookingDate) {
          await fetchAvailabilityForDate(bookingDate);
        }
        await fetchBookedSlots();
        
        return {
          success: true,
          data: response.data,
          hasPayment: !!response.data?.authorization_url
        };
      } else {
        return {
          success: false,
          error: response.message || 'Booking failed'
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create booking';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, [fetchAvailabilityForDate, fetchBookedSlots]);

  const getBookedTimesForDate = useCallback((date) => {
    const dateAvailability = availabilityData[date];
    if (dateAvailability) {
      return dateAvailability.booked_times || [];
    }
    
    if (Array.isArray(bookedSlots)) {
      return bookedSlots
        .filter(slot => slot.date === date)
        .map(slot => slot.time || slot.time_range);
    }
    
    return [];
  }, [availabilityData, bookedSlots]);

  const getAvailableSlotsForDate = useCallback((date) => {
    const dateAvailability = availabilityData[date];
    if (dateAvailability) {
      return dateAvailability.available_slots || [];
    }
    return [];
  }, [availabilityData]);

  const hasAvailableSlots = useCallback((date) => {
    const availableSlots = getAvailableSlotsForDate(date);
    const bookedTimes = getBookedTimesForDate(date);
    
    if (availableSlots.length > 0) {
      return availableSlots.some(slot => !bookedTimes.includes(slot));
    }
    
    const defaultTimeSlots = [
      '2:00 PM - 3:00 PM',
      '3:00 PM - 4:00 PM', 
      '4:00 PM - 5:00 PM',
      '5:00 PM - 6:00 PM'
    ];
    
    return defaultTimeSlots.some(slot => !bookedTimes.includes(slot));
  }, [getAvailableSlotsForDate, getBookedTimesForDate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailabilityForDate(selectedDate);
    }
  }, [selectedDate, fetchAvailabilityForDate]);

  return {
    bookedSlots,
    availabilityData,
    loading,
    error,
    fetchBookedSlots,
    fetchAvailabilityForDate,
    checkSlotAvailability,
    createBooking,
    getBookedTimesForDate,
    getAvailableSlotsForDate,
    hasAvailableSlots,
    clearError
  };
};