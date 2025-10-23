  // services/paystackService.js
  import api from './axios';

  /**
  * Paystack Service for handling payments
  */
  class PaystackService {
    constructor() {
      // Get Paystack public key from environment variables
      this.publicKey = ''
      this.baseURL = 'https://api.paystack.co';
      
      if (!this.publicKey) {
      }
    }

    /**
    * Initialize Paystack payment
    * @param {Object} paymentData - Payment information
    * @param {string} paymentData.email - Customer email
    * @param {number} paymentData.amount - Amount in kobo (multiply by 100)
    * @param {string} paymentData.reference - Unique payment reference
    * @param {Object} paymentData.metadata - Additional payment metadata
    * @param {Function} onSuccess - Success callback
    * @param {Function} onClose - Close callback
    * @returns {Promise}
    */
    initializePayment({
      email,
      amount,
      reference,
      currency = 'NGN',
      metadata = {},
      onSuccess,
      onClose
    }) {
      return new Promise((resolve, reject) => {
        if (!window.PaystackPop) {
          reject(new Error('Paystack script not loaded. Please check your internet connection.'));
          return;
        }

        if (!this.publicKey) {
          reject(new Error('Paystack public key not configured'));
          return;
        }

        const handler = window.PaystackPop.setup({
          key: this.publicKey,
          email: email,
          amount: Math.round(amount * 100), // Convert to kobo
          ref: reference,
          currency: currency,
          metadata: {
            ...metadata,
            custom_fields: [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: reference
              }
            ]
          },
          callback: function(response) {
            if (onSuccess) {
              onSuccess(response);
            }
            resolve(response);
          },
          onClose: function() {
            if (onClose) {
              onClose();
            }
            reject(new Error('Payment was cancelled'));
          }
        });

        handler.openIframe();
      });
    }

    /**
    * Verify payment on your backend
    * @param {string} reference - Payment reference to verify
    * @returns {Promise<Object>} Verification result
    */
    async verifyPayment(reference) {
      try {
        
        // Call your backend API to verify the payment
        // Your backend should make the actual call to Paystack's verify endpoint
        const response = await api.postWithParams('/verify-payment', {
          reference: reference
        });

        if (response.data && response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data?.message || 'Payment verification failed');
        }
      } catch (error) {
        throw new Error(
          error.response?.data?.message || 
          error.message ||
          'Failed to verify payment. Please contact support.'
        );
      }
    }

    /**
    * Generate a unique payment reference
    * @param {string} prefix - Optional prefix for the reference
    * @returns {string} Unique reference
    */
    generateReference(prefix = 'leksy') {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000);
      return `${prefix}_${timestamp}_${random}`;
    }

    /**
    * Format amount for display
    * @param {number} amount - Amount in Naira
    * @returns {string} Formatted amount
    */
    formatAmount(amount) {
      return `₦${parseFloat(amount).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }

    /**
    * Load Paystack script dynamically
    * @returns {Promise<void>}
    */
    loadPaystackScript() {
      return new Promise((resolve, reject) => {
        if (window.PaystackPop) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => {
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load Paystack script'));
        };

        document.head.appendChild(script);
      });
    }

    /**
    * Create order on your backend
    * @param {Object} orderData - Order information
    * @returns {Promise<Object>} Order creation result
    */
    async createOrder(orderData) {
      try {
        
        const response = await api.post('/create-order', orderData);

        if (response.data && response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data?.message || 'Failed to create order');
        }
      } catch (error) {
        throw new Error(
          error.response?.data?.message || 
          error.message ||
          'Failed to create order. Please try again.'
        );
      }
    }
  }

  // Create and export a singleton instance
  const paystackService = new PaystackService();

  export default paystackService;