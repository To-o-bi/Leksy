// API service for booking operations
class BookingAPI {
  constructor() {
    // This will now work properly
     this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    this.endpoints = {
      bookings: '/bookings',
      availability: '/bookings/availability',
      book: '/bookings/book',
      cancel: '/bookings/cancel'
    };
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Get all booked slots
  async getBookedSlots() {
    try {
      const response = await this.apiCall(this.endpoints.bookings);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      return [];
    }
  }

  // Get availability for a specific date
  async getAvailabilityForDate(date) {
    try {
      const response = await this.apiCall(`${this.endpoints.availability}?date=${date}`);
      return response.data || {
        date,
        available_times: [],
        booked_times: []
      };
    } catch (error) {
      console.error('Error fetching availability:', error);
      return {
        date,
        available_times: [],
        booked_times: []
      };
    }
  }

  // Check if a specific date/time combination is available
  async isSlotAvailable(date, time) {
    try {
      const response = await this.apiCall(`${this.endpoints.availability}?date=${date}&time=${encodeURIComponent(time)}`);
      return response.data?.available || false;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  // Book a consultation slot
  async createBooking(bookingData) {
    try {
      const response = await this.apiCall(this.endpoints.book, {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      return {
        success: true,
        data: response.data,
        message: response.message || 'Booking created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create booking'
      };
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId) {
    try {
      const response = await this.apiCall(`${this.endpoints.cancel}/${bookingId}`, {
        method: 'DELETE'
      });
      return {
        success: true,
        data: response.data,
        message: response.message || 'Booking cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to cancel booking'
      };
    }
  }
}

export const bookingAPI = new BookingAPI();
