export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim()),
  
  phone: (phone) => {
    const clean = phone?.replace(/\D/g, '') || '';
    return clean.length >= 10 && clean.length <= 15;
  },
  
  required: (value) => Boolean(value?.toString().trim()),
  
  minLength: (value, min) => value?.toString().trim().length >= min,
  
  maxLength: (value, max) => value?.toString().trim().length <= max,
  
  price: (price) => !isNaN(price) && parseFloat(price) > 0,
  
  image: (file) => {
    if (!file) return { valid: true };
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    return {
      valid: validTypes.includes(file.type) && file.size <= maxSize,
      error: !validTypes.includes(file.type) ? 'Invalid file type' : 
             file.size > maxSize ? 'File too large (max 2MB)' : null
    };
  }
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    
    for (const [rule, param] of Object.entries(fieldRules)) {
      if (rule === 'required' && param && !validators.required(value)) {
        errors[field] = `${field} is required`;
        break;
      }
      if (rule === 'email' && param && value && !validators.email(value)) {
        errors[field] = 'Invalid email format';
        break;
      }
      if (rule === 'phone' && param && value && !validators.phone(value)) {
        errors[field] = 'Invalid phone number';
        break;
      }
      if (rule === 'minLength' && value && !validators.minLength(value, param)) {
        errors[field] = `Minimum ${param} characters required`;
        break;
      }
    }
  });
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
