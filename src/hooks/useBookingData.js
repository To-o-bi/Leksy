import { useState, useEffect, useCallback } from 'react';
import { bookingAPI } from '../api/services/bookingApi';

export const useBookingData = (selectedDate = null) => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all booked slots
  const fetchBookedSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const slots = await bookingAPI.getBookedSlots();
      setBookedSlots(slots);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch availability for a specific date
  const fetchAvailabilityForDate = useCallback(async (date) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    try {
      const availability = await bookingAPI.getAvailabilityForDate(date);
      setAvailabilityData(prev => ({
        ...prev,
        [date]: availability
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if a specific slot is available
  const checkSlotAvailability = useCallback(async (date, time) => {
    try {
      return await bookingAPI.isSlotAvailable(date, time);
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // Create a new booking
  const createBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingAPI.createBooking(bookingData);
      if (result.success) {
        // Refresh data after successful booking
        await fetchBookedSlots();
        if (bookingData.date) {
          await fetchAvailabilityForDate(bookingData.date);
        }
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchBookedSlots, fetchAvailabilityForDate]);

  // Get booked times for a specific date
  const getBookedTimesForDate = useCallback((date) => {
    const dateAvailability = availabilityData[date];
    if (dateAvailability) {
      return dateAvailability.booked_times || [];
    }
    
    // Fallback to checking bookedSlots
    return bookedSlots
      .filter(slot => slot.date === date)
      .map(slot => slot.time);
  }, [availabilityData, bookedSlots]);

  // Initial data fetch
  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  // Fetch availability when selectedDate changes
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
    getBookedTimesForDate
  };
};