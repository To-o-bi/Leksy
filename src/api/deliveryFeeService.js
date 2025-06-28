// services/deliveryFeeService.js
import api from '../api/axios';

/**
 * Service for managing delivery fees for Nigerian states
 */
export class DeliveryFeeService {
  /**
   * Fetch all delivery fees for Nigerian states
   * @returns {Promise<Object>} API response with delivery fees
   */
  static async fetchDeliveryFees() {
    try {
      console.log('Fetching delivery fees...');
      const response = await api.get('/fetch-delivery-fees');
      console.log('API Response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        return {
          success: true,
          data: data.delivery_fees || [],
          message: data.message || `Loaded ${data.delivery_fees?.length || 0} delivery fees`
        };
      } else {
        throw new Error(data.message || 'Failed to fetch delivery fees');
      }
    } catch (error) {
      console.error('Error fetching delivery fees:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to load delivery fees');
    }
  }

  /**
   * Fetch delivery fee for a single state
   * @param {string} state - State name
   * @returns {Promise<Object>} API response with single state delivery fee
   */
  static async fetchSingleDeliveryFee(state) {
    try {
      console.log(`Fetching delivery fee for ${state}...`);
      const response = await api.get('/fetch-delivery-fee', {
        params: { state }
      });
      console.log('Single state API Response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        return {
          success: true,
          data: {
            state,
            delivery_fee: data.delivery_fee
          },
          message: data.message || `Delivery fee for ${state} fetched successfully`
        };
      } else {
        throw new Error(data.message || `Failed to fetch delivery fee for ${state}`);
      }
    } catch (error) {
      console.error(`Error fetching delivery fee for ${state}:`, error);
      throw new Error(error.response?.data?.message || error.message || `Failed to load delivery fee for ${state}`);
    }
  }

  /**
   * Update delivery fee for a single state
   * @param {string} state - State name
   * @param {number} fee - New delivery fee
   * @returns {Promise<Object>} API response
   */
  static async updateSingleDeliveryFee(state, fee) {
    try {
      console.log(`Updating delivery fee for ${state} to ${fee}`);
      const params = { [state]: fee };
      const response = await api.post('/admin/update-delivery-fees', null, { 
        params,
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      console.log('Update response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        return {
          success: true,
          data: data.delivery_fees,
          message: data.message || `Updated delivery fee for ${state} successfully`,
          token: data.token // Include updated token if provided
        };
      } else {
        throw new Error(data.message || 'Failed to update delivery fee');
      }
    } catch (error) {
      console.error('Error updating delivery fee:', error);
      throw new Error(error.response?.data?.message || error.message || `Failed to update delivery fee for ${state}`);
    }
  }

  /**
   * Update delivery fees for multiple states
   * @param {Object} fees - Object with state names as keys and fees as values
   * @returns {Promise<Object>} API response
   */
  static async updateBulkDeliveryFees(fees) {
    try {
      console.log('Bulk updating delivery fees:', fees);
      const response = await api.post('/admin/update-delivery-fees', null, { 
        params: fees,
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      console.log('Bulk update response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        return {
          success: true,
          data: data.delivery_fees,
          message: data.message || 'All delivery fees updated successfully',
          token: data.token // Include updated token if provided
        };
      } else {
        throw new Error(data.message || 'Failed to update delivery fees');
      }
    } catch (error) {
      console.error('Error updating delivery fees:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update delivery fees');
    }
  }

  /**
   * Get authentication token from storage or context
   * @returns {string} Authentication token
   * @private
   */
  static getAuthToken() {
    // This should be implemented based on your auth system
    // For example: return localStorage.getItem('auth_token') or from Redux store
    // Since we can't use localStorage in artifacts, this is a placeholder
    return 'your_auth_token_here';
  }
}

/**
 * Service for managing Lagos State LGA delivery fees
 */
export class LagosLGAService {
  // Default Lagos LGAs list - comprehensive list including major areas
  static LAGOS_LGAS = [
    'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
    'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaaye',
    'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
    'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere', 'Maryland', 
    'Mowe', 'Opic', 'Isheri', 'Akute', 'Ajah', 'Lekki', 'Victoria Island',
    'Ikoyi', 'Yaba', 'Gbagada', 'Magodo', 'Ojodu', 'Berger', 'Ketu'
  ];

  /**
   * Fetch all Lagos LGA delivery fees
   * @returns {Promise<Object>} API response with LGA fees
   */
  static async fetchLagosLGAs() {
    try {
      console.log('Fetching Lagos LGAs...');
      const response = await api.get('/fetch-lagos-lgas');
      console.log('Lagos LGAs Response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        return {
          success: true,
          data: data.lgas || [],
          message: data.message || `Loaded ${data.lgas?.length || 0} Lagos LGAs`
        };
      } else {
        throw new Error(data.message || 'Failed to fetch Lagos LGAs');
      }
    } catch (error) {
      console.error('Error fetching Lagos LGAs:', error);
      
      // Fallback to default LGAs if API doesn't exist
      const defaultLGAs = this.LAGOS_LGAS.map(lga => ({
        lga: lga,
        delivery_fee: 0
      }));
      
      console.log('Using default Lagos LGAs - API endpoint may not be implemented yet');
      return {
        success: true,
        data: defaultLGAs,
        message: 'Using default Lagos LGAs (API endpoint not available)',
        isDefault: true
      };
    }
  }

  /**
   * Fetch delivery fee for a single Lagos LGA
   * @param {string} lga - LGA name
   * @returns {Promise<Object>} API response with single LGA delivery fee
   */
  static async fetchSingleLGAFee(lga) {
    try {
      console.log(`Fetching delivery fee for ${lga} LGA...`);
      const response = await api.get('/fetch-lagos-lga-fee', {
        params: { lga }
      });
      console.log('Single LGA API Response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        return {
          success: true,
          data: {
            lga,
            delivery_fee: data.delivery_fee
          },
          message: data.message || `Delivery fee for ${lga} LGA fetched successfully`
        };
      } else {
        throw new Error(data.message || `Failed to fetch delivery fee for ${lga} LGA`);
      }
    } catch (error) {
      console.error(`Error fetching delivery fee for ${lga} LGA:`, error);
      
      // Fallback for non-existent endpoint
      console.log('LGA single fetch endpoint may not be implemented yet');
      return {
        success: false,
        data: null,
        message: `Single LGA fetch not available - use fetchLagosLGAs() instead`,
        isEndpointMissing: true
      };
    }
  }

  /**
   * Update delivery fee for a single LGA
   * @param {string} lga - LGA name
   * @param {number} fee - New delivery fee
   * @returns {Promise<Object>} API response
   */
  static async updateSingleLGAFee(lga, fee) {
    try {
      console.log(`Updating LGA delivery fee for ${lga} to ${fee}`);
      const params = { [lga]: fee };
      const response = await api.post('/admin/update-lagos-lgas', null, { 
        params,
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      console.log('LGA Update response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        return {
          success: true,
          data: data.lgas,
          message: data.message || `Updated delivery fee for ${lga} LGA successfully`,
          token: data.token // Include updated token if provided
        };
      } else {
        throw new Error(data.message || 'Failed to update LGA delivery fee');
      }
    } catch (error) {
      console.error('Error updating LGA delivery fee:', error);
      throw new Error(error.response?.data?.message || error.message || `Failed to update delivery fee for ${lga}`);
    }
  }

  /**
   * Update delivery fees for multiple LGAs
   * @param {Object} fees - Object with LGA names as keys and fees as values
   * @returns {Promise<Object>} API response
   */
  static async updateBulkLGAFees(fees) {
    try {
      console.log('Bulk updating Lagos LGA fees:', fees);
      const response = await api.post('/admin/update-lagos-lgas', null, { 
        params: fees,
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
      console.log('Bulk LGA update response:', response.data);
      
      const data = response.data;
      
      if (data.code === 200) {
        return {
          success: true,
          data: data.lgas,
          message: data.message || 'All Lagos LGA fees updated successfully',
          token: data.token // Include updated token if provided
        };
      } else {
        throw new Error(data.message || 'Failed to update LGA fees');
      }
    } catch (error) {
      console.error('Error updating LGA fees:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update LGA fees');
    }
  }

  /**
   * Get authentication token from storage or context
   * @returns {string} Authentication token
   * @private
   */
  static getAuthToken() {
    // This should be implemented based on your auth system
    return 'your_auth_token_here';
  }
}

/**
 * Utility service for formatting and validation
 */
export class DeliveryFeeUtils {
  /**
   * Format price to Nigerian Naira currency
   * @param {number} price - Price amount
   * @returns {string} Formatted price string
   */
  static formatPrice(price) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Format price without currency symbol (for display in inputs)
   * @param {number} price - Price amount
   * @returns {string} Formatted price string without symbol
   */
  static formatPriceNumber(price) {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Validate delivery fee value
   * @param {number} fee - Fee to validate
   * @returns {boolean} Whether fee is valid
   */
  static validateFee(fee) {
    return fee !== null && fee !== undefined && fee >= 0 && !isNaN(fee);
  }

  /**
   * Parse fee input (handles strings with commas)
   * @param {string|number} input - Fee input to parse
   * @returns {number} Parsed fee number
   */
  static parseFeeInput(input) {
    if (typeof input === 'number') return input;
    const cleanInput = String(input).replace(/[^0-9.]/g, '');
    return parseFloat(cleanInput) || 0;
  }

  /**
   * Check if a state is Lagos
   * @param {string} state - State name
   * @returns {boolean} Whether state is Lagos
   */
  static isLagosState(state) {
    return state.toLowerCase() === 'lagos';
  }

  /**
   * Calculate average delivery fee
   * @param {Array} fees - Array of fee objects
   * @returns {number} Average fee
   */
  static calculateAverageFee(fees) {
    if (!fees || fees.length === 0) return 0;
    const total = fees.reduce((sum, fee) => sum + (fee.delivery_fee || 0), 0);
    return Math.round(total / fees.length);
  }

  /**
   * Get min and max delivery fees
   * @param {Array} fees - Array of fee objects
   * @returns {Object} Object with min and max fees
   */
  static getMinMaxFees(fees) {
    if (!fees || fees.length === 0) return { min: 0, max: 0 };
    
    const feeValues = fees.map(fee => fee.delivery_fee || 0);
    return {
      min: Math.min(...feeValues),
      max: Math.max(...feeValues)
    };
  }

  /**
   * Filter items by search term
   * @param {Array} items - Items to filter
   * @param {string} searchTerm - Search term
   * @param {string} field - Field to search in (default: 'state' for states, 'lga' for LGAs)
   * @returns {Array} Filtered items
   */
  static filterBySearch(items, searchTerm, field = 'state') {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase().trim();
    return items.filter(item => {
      const value = item[field]?.toLowerCase() || '';
      return value.includes(term);
    });
  }

  /**
   * Sort items by field
   * @param {Array} items - Items to sort
   * @param {string} field - Field to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {Array} Sorted items
   */
  static sortItems(items, field = 'state', direction = 'asc') {
    return [...items].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      // Handle numeric fields
      if (field.includes('fee')) {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }
      
      if (direction === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }

  /**
   * Validate state name format
   * @param {string} state - State name to validate
   * @returns {boolean} Whether state name is valid
   */
  static validateStateName(state) {
    return state && typeof state === 'string' && state.trim().length > 0;
  }

  /**
   * Validate LGA name format
   * @param {string} lga - LGA name to validate
   * @returns {boolean} Whether LGA name is valid
   */
  static validateLGAName(lga) {
    return lga && typeof lga === 'string' && lga.trim().length > 0;
  }

  /**
   * Generate bulk update summary
   * @param {Object} fees - Object with state/LGA names as keys and fees as values
   * @returns {string} Summary message
   */
  static generateBulkUpdateSummary(fees) {
    const count = Object.keys(fees).length;
    const total = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
    const average = count > 0 ? Math.round(total / count) : 0;
    
    return `Updated ${count} ${count === 1 ? 'item' : 'items'}. Average fee: ${this.formatPrice(average)}`;
  }
}

/**
 * Notification service for managing user feedback
 */
export class NotificationService {
  /**
   * Create a success notification object
   * @param {string} message - Success message
   * @param {Object} extra - Additional data
   * @returns {Object} Notification object
   */
  static success(message, extra = {}) {
    return {
      type: 'success',
      message,
      timestamp: Date.now(),
      id: this.generateId(),
      ...extra
    };
  }

  /**
   * Create an error notification object
   * @param {string} message - Error message
   * @param {Object} extra - Additional data
   * @returns {Object} Notification object
   */
  static error(message, extra = {}) {
    return {
      type: 'error',
      message,
      timestamp: Date.now(),
      id: this.generateId(),
      ...extra
    };
  }

  /**
   * Create an info notification object
   * @param {string} message - Info message
   * @param {Object} extra - Additional data
   * @returns {Object} Notification object
   */
  static info(message, extra = {}) {
    return {
      type: 'info',
      message,
      timestamp: Date.now(),
      id: this.generateId(),
      ...extra
    };
  }

  /**
   * Create a warning notification object
   * @param {string} message - Warning message
   * @param {Object} extra - Additional data
   * @returns {Object} Notification object
   */
  static warning(message, extra = {}) {
    return {
      type: 'warning',
      message,
      timestamp: Date.now(),
      id: this.generateId(),
      ...extra
    };
  }

  /**
   * Generate unique notification ID
   * @returns {string} Unique ID
   * @private
   */
  static generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format notification for display
   * @param {Object} notification - Notification object
   * @returns {string} Formatted message
   */
  static formatNotification(notification) {
    const time = new Date(notification.timestamp).toLocaleTimeString();
    return `[${time}] ${notification.message}`;
  }
}

// Export all services as default
export default {
  DeliveryFeeService,
  LagosLGAService,
  DeliveryFeeUtils,
  NotificationService
};