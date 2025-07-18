/**
 * A collection of utility functions for formatting data.
 */
export const formatter = {
  /**
   * Formats a number into the Nigerian Naira (NGN) currency format.
   * e.g., 15000 -> ₦15,000
   * @param {number} amount - The amount to format.
   * @returns {string} The formatted currency string.
   */
  formatCurrency: (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₦0'; // Return a default value for invalid inputs
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Formats a date string into a more readable format.
   * e.g., "2023-10-27T10:00:00Z" -> "October 27, 2023"
   * @param {string | Date} dateString - The date string or Date object to format.
   * @returns {string} The formatted date string.
   */
  formatDate: (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  },

  /**
   * Formats a number as a percentage.
   * @param {number} value - The number to format.
   * @returns {string} The formatted percentage string.
   */
  formatPercentage: (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0%';
    }
    return `${value}%`;
  },

  /**
   * Truncates a string of text to a specified maximum length.
   * @param {string} text - The text to truncate.
   * @param {number} [maxLength=100] - The maximum length of the text.
   * @returns {string} The truncated text, with "..." appended if necessary.
   */
  truncateText: (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  }
};

export default formatter;
