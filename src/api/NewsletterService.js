// api/services/newsletterService.js
import api from './axios';

// Validation helper
const validateEmail = (email) => {
  if (!email?.trim()) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) 
    ? { valid: true } 
    : { valid: false, message: 'Please enter a valid email address' };
};

// Unified Newsletter Service
export const newsletterService = {
  /**
   * Add a new newsletter subscriber (Public form)
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, message: string, data?: any}>}
   */
  async addSubscriber(email) {
    const validation = validateEmail(email);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    try {
      const cleanEmail = email.trim();
      console.log('🔄 Adding newsletter subscriber:', cleanEmail);

      const formData = new FormData();
      formData.append('email', cleanEmail);
      
      const response = await api.post('/newsletter-subscribers/add', formData);
      
      console.log('✅ Newsletter subscription response:', response.data);
      
      if (response?.data?.code === 200) {
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Successfully subscribed to our newsletter!'
        };
      }
      
      return {
        success: false,
        message: response?.data?.message || 'Failed to subscribe. Please try again.'
      };
      
    } catch (error) {
      console.error('❌ Newsletter subscription error:', error);
      const message = error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.';
      return {
        success: false,
        error: error.response?.data || error,
        message
      };
    }
  },

  /**
   * Remove a newsletter subscriber (Admin & Public unsubscribe)
   * @param {string} email - Email to unsubscribe
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async removeSubscriber(email) {
    const validation = validateEmail(email);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    try {
      const cleanEmail = email.trim();
      console.log('🔄 Attempting newsletter unsubscription for:', cleanEmail);

      const formData = new FormData();
      formData.append('email', cleanEmail);
      
      const response = await api.post('/newsletter-subscribers/remove', formData);
      
      console.log('✅ Newsletter unsubscription response:', response.data);
      
      if (response?.data?.code === 200) {
        return {
          success: true,
          message: response.data.message || 'Successfully unsubscribed!'
        };
      }
      
      return {
        success: false,
        message: response?.data?.message || 'Failed to unsubscribe'
      };
      
    } catch (error) {
      console.error('❌ Newsletter unsubscribe error:', error);
      const message = error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.';
      return {
        success: false,
        error: error.response?.data || error,
        message
      };
    }
  },

  /**
   * Fetch all newsletter subscribers (Admin only)
   * @param {number|null} limit - Optional limit for results
   * @returns {Promise<{success: boolean, subscribers: Array, message: string}>}
   */
  async fetchSubscribers(limit = null) {
    try {
      const params = limit ? { limit } : {};
      const response = await api.get('/admin/fetch-newsletter-subscribers', { params });
      
      console.log('✅ Newsletter fetch subscribers response:', response.data);
      
      if (response?.data?.code === 200) {
        return {
          success: true,
          subscribers: response.data.newsletter_subscribers || response.data.subscribers || [],
          data: response.data,
          message: response.data.message || 'Subscribers fetched successfully!'
        };
      }
      
      return {
        success: false,
        subscribers: [],
        message: response?.data?.message || 'Failed to fetch subscribers'
      };
      
    } catch (error) {
      console.error('❌ Newsletter fetch subscribers error:', error);
      return {
        success: false,
        subscribers: [],
        error: error.response?.data || error,
        message: error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.'
      };
    }
  },

  /**
   * Send bulk newsletter email (Admin only)
   * @param {Object} newsletterData - Newsletter content and configuration
   * @param {string} newsletterData.title - Newsletter title (required)
   * @param {string} newsletterData.message - Newsletter message content (required)
   * @param {Array} newsletterData.images - Array of image files (optional)
   * @param {string} newsletterData.image_type - Image type: 'banner' or 'flier' (optional, default: 'banner')
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async sendBulkEmail(newsletterData) {
    try {
      // Validate required fields
      if (!newsletterData.title?.trim()) {
        return {
          success: false,
          message: 'Newsletter title is required'
        };
      }

      if (!newsletterData.message?.trim()) {
        return {
          success: false,
          message: 'Newsletter message is required'
        };
      }

      console.log('🔄 Sending bulk newsletter:', newsletterData);

      const formData = new FormData();
      formData.append('title', newsletterData.title.trim());
      formData.append('message', newsletterData.message.trim());
      
      // Add image type (optional, defaults to 'banner')
      const imageType = newsletterData.image_type || 'banner';
      if (imageType && ['banner', 'flier'].includes(imageType)) {
        formData.append('image_type', imageType);
      }
      
      // Add multiple image files if provided
      if (newsletterData.images && Array.isArray(newsletterData.images)) {
        newsletterData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }
      
      const response = await api.post('/admin/send-newsletters', formData);
      
      console.log('✅ Bulk newsletter response:', response.data);
      
      if (response?.data?.code === 200) {
        return {
          success: true,
          message: response.data.message || 'Newsletter sent successfully to all subscribers!'
        };
      }
      
      return {
        success: false,
        message: response?.data?.message || 'Failed to send newsletter'
      };
      
    } catch (error) {
      console.error('❌ Bulk newsletter error:', error);
      const message = error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.';
      return {
        success: false,
        error: error.response?.data || error,
        message
      };
    }
  },

  /**
   * Send newsletter to specific recipients (Admin only)
   * @param {Object} newsletterData - Newsletter content and configuration
   * @param {string} newsletterData.title - Newsletter title (required)
   * @param {string} newsletterData.message - Newsletter message content (required)
   * @param {Array} newsletterData.recipients - Array of email addresses (optional - if not provided, sends to all)
   * @param {Array} newsletterData.images - Array of image files (optional)
   * @param {string} newsletterData.image_type - Image type: 'banner' or 'flier' (optional, default: 'banner')
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async sendNewsletterToRecipients(newsletterData) {
    try {
      // Validate required fields
      if (!newsletterData.title?.trim()) {
        return {
          success: false,
          message: 'Newsletter title is required'
        };
      }

      if (!newsletterData.message?.trim()) {
        return {
          success: false,
          message: 'Newsletter message is required'
        };
      }

      // Validate recipients if provided
      if (newsletterData.recipients && Array.isArray(newsletterData.recipients)) {
        const validation = this.validateEmailList(newsletterData.recipients);
        if (validation.invalid.length > 0) {
          return {
            success: false,
            message: `Invalid email addresses: ${validation.invalid.join(', ')}`
          };
        }
      }

      console.log('🔄 Sending newsletter to specific recipients:', newsletterData);

      const formData = new FormData();
      formData.append('title', newsletterData.title.trim());
      formData.append('message', newsletterData.message.trim());
      
      // Add recipients if specified (otherwise sends to all subscribers)
      if (newsletterData.recipients && Array.isArray(newsletterData.recipients) && newsletterData.recipients.length > 0) {
        formData.append('recipients', JSON.stringify(newsletterData.recipients));
      }
      
      // Add image type (optional, defaults to 'banner')
      const imageType = newsletterData.image_type || 'banner';
      if (imageType && ['banner', 'flier'].includes(imageType)) {
        formData.append('image_type', imageType);
      }
      
      // Add multiple image files if provided
      if (newsletterData.images && Array.isArray(newsletterData.images)) {
        newsletterData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }
      
      const response = await api.post('/admin/send-newsletters', formData);
      
      console.log('✅ Newsletter to recipients response:', response.data);
      
      if (response?.data?.code === 200) {
        const recipientCount = newsletterData.recipients?.length || 'all subscribers';
        return {
          success: true,
          message: response.data.message || `Newsletter sent successfully to ${recipientCount}!`
        };
      }
      
      return {
        success: false,
        message: response?.data?.message || 'Failed to send newsletter'
      };
      
    } catch (error) {
      console.error('❌ Newsletter to recipients error:', error);
      const message = error.response?.data?.message || error.message || 'Network error. Please check your connection and try again.';
      return {
        success: false,
        error: error.response?.data || error,
        message
      };
    }
  },

  /**
   * Get newsletter statistics (Admin only)
   * @param {Array} subscribers - Array of subscriber objects
   * @returns {Object} Statistics object with total, recent, and thisMonth counts
   */
  calculateStats(subscribers) {
    if (!Array.isArray(subscribers)) {
      return { total: 0, recent: 0, thisMonth: 0 };
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: subscribers.length,
      recent: subscribers.filter(sub => {
        const createdDate = new Date(sub.created_at);
        return createdDate > lastWeek;
      }).length,
      thisMonth: subscribers.filter(sub => {
        const createdDate = new Date(sub.created_at);
        return createdDate > thisMonth;
      }).length
    };
  },

  /**
   * Export subscribers to CSV format (Admin only)
   * @param {Array} subscribers - Array of subscriber objects
   * @param {string} filename - Optional filename (defaults to current date)
   * @returns {boolean} Success status
   */
  exportToCSV(subscribers, filename = null) {
    try {
      if (!Array.isArray(subscribers) || subscribers.length === 0) {
        throw new Error('No subscribers to export');
      }

      const csvContent = [
        ['Email', 'Date Subscribed'],
        ...subscribers.map(sub => [
          sub.email,
          sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Unknown'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('❌ CSV export error:', error);
      return false;
    }
  },

  /**
   * Validate image files for newsletter
   * @param {Array} images - Array of image files
   * @param {number} maxSize - Maximum file size in MB (default: 5MB)
   * @returns {Object} Validation results
   */
  validateImages(images, maxSize = 5) {
    if (!Array.isArray(images)) {
      return { valid: false, message: 'Images must be provided as an array' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      if (!(image instanceof File)) {
        return { valid: false, message: `Image ${i + 1} is not a valid file` };
      }

      if (!allowedTypes.includes(image.type)) {
        return { 
          valid: false, 
          message: `Image ${i + 1} has invalid format. Allowed: JPEG, PNG, GIF, WebP` 
        };
      }

      if (image.size > maxSizeBytes) {
        return { 
          valid: false, 
          message: `Image ${i + 1} is too large. Maximum size: ${maxSize}MB` 
        };
      }
    }

    return { valid: true };
  },

  /**
   * Prepare newsletter data for sending
   * @param {Object} rawData - Raw newsletter data from form
   * @returns {Object} Formatted newsletter data
   */
  prepareNewsletterData(rawData) {
    return {
      title: rawData.title?.trim() || '',
      message: rawData.message?.trim() || '',
      recipients: Array.isArray(rawData.recipients) ? rawData.recipients : [],
      images: Array.isArray(rawData.images) ? rawData.images : [],
      image_type: rawData.image_type && ['banner', 'flier'].includes(rawData.image_type) 
        ? rawData.image_type 
        : 'banner'
    };
  },

  /**
   * Validate multiple email addresses
   * @param {Array} emails - Array of email addresses to validate
   * @returns {Object} Validation results with valid/invalid arrays
   */
  validateEmailList(emails) {
    if (!Array.isArray(emails)) {
      return { valid: [], invalid: emails ? [emails] : [] };
    }

    const valid = [];
    const invalid = [];

    emails.forEach(email => {
      const validation = validateEmail(email);
      if (validation.valid) {
        valid.push(email.trim());
      } else {
        invalid.push(email);
      }
    });

    return { valid, invalid };
  }
};

export default newsletterService;