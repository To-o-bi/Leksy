// src/api/utils.js

export const formatPrice = (price) => {
  const num = typeof price === 'number' ? price : parseFloat(price) || 0;
  return `₦${Math.round(num).toLocaleString('en-NG')}`;
};

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
};

export const getInitials = (name) => {
  return name?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';
};

export const sanitizeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export const formatStatus = (status) => {
  return status?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
};

export const getStatusColor = (status) => {
  const colors = {
    'successful': 'green', 'delivered': 'green', 'completed': 'green',
    'unsuccessful': 'red', 'unpaid': 'red', 'flagged': 'red',
    'order-received': 'blue', 'packaged': 'purple', 'in-transit': 'orange',
    'unheld': 'yellow', 'in-session': 'blue'
  };
  return colors[status?.toLowerCase()] || 'gray';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '...';
};

export const calculateDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const getCartSummary = (cart) => {
  if (!Array.isArray(cart)) return { itemCount: 0, totalItems: 0, total: 0 };
  
  return cart.reduce((acc, item) => {
    const qty = parseInt(item.quantity) || 0;
    const price = parseFloat(item.price || item.product_price) || 0;
    
    acc.itemCount += 1;
    acc.totalItems += qty;
    acc.total += price * qty;
    return acc;
  }, { itemCount: 0, totalItems: 0, total: 0 });
};

export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch { return fallback; }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch { return false; }
  }
};

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const AGE_RANGES = ['18 - 25', '26 - 35', '36 - 45', '46 - 55', '56+'];
export const SKIN_TYPES = ['oily', 'dry', 'combination', 'sensitive', 'normal'];

