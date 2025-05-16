export const formatter = {
    // Format currency for Nigerian Naira
    formatCurrency: (amount) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    },
    
    // Format date
    formatDate: (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-NG', options);
    },
    
    // Format percentage
    formatPercentage: (value) => {
      return `${value}%`;
    },
    
    // Truncate text
    truncateText: (text, maxLength = 100) => {
      if (!text || text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    }
  };
  
  export default formatter;