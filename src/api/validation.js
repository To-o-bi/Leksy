// src/api/validation.js

// Core validators
export const validators = {
  // Basic field validation
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  },

  // String length validators
  minLength: (value, min) => {
    if (!value) return false;
    return value.toString().trim().length >= min;
  },

  maxLength: (value, max) => {
    if (!value) return true; // Optional field
    return value.toString().trim().length <= max;
  },

  // Email validation
  email: (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  // Phone validation (Nigerian format primarily)
  phone: (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    // Allow 10-15 digits, covers Nigerian and international formats
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  },

  // Nigerian phone specific
  nigerianPhone: (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    // Nigerian numbers: 11 digits starting with 0, or 10 digits without leading 0
    return (cleanPhone.length === 11 && cleanPhone.startsWith('0')) ||
           (cleanPhone.length === 10 && !cleanPhone.startsWith('0')) ||
           (cleanPhone.length === 13 && cleanPhone.startsWith('234')); // International format
  },

  // Price validation
  price: (price) => {
    if (!price) return false;
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0;
  },

  // Quantity validation
  quantity: (quantity) => {
    if (quantity === null || quantity === undefined) return false;
    const numQty = parseInt(quantity);
    return !isNaN(numQty) && numQty >= 0;
  },

  // Category validation
  category: (category, validCategories = []) => {
    if (!category) return false;
    return validCategories.includes(category);
  },

  // Image file validation
  image: (file) => {
    if (!file) return { valid: true }; // Optional
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const minSize = 1024; // 1KB minimum
    
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed.'
      };
    }
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 2MB.'
      };
    }
    
    if (file.size < minSize) {
      return {
        valid: false,
        error: 'File too small. Minimum size is 1KB.'
      };
    }
    
    return { valid: true };
  },

  // Multiple images validation
  images: (files, maxCount = 5) => {
    if (!files || files.length === 0) return { valid: true }; // Optional
    
    if (files.length > maxCount) {
      return {
        valid: false,
        error: `Too many images. Maximum ${maxCount} images allowed.`
      };
    }
    
    for (let i = 0; i < files.length; i++) {
      const imageValidation = validators.image(files[i]);
      if (!imageValidation.valid) {
        return {
          valid: false,
          error: `Image ${i + 1}: ${imageValidation.error}`
        };
      }
    }
    
    return { valid: true };
  },

  // Date validation
  date: (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  },

  // Future date validation
  futureDate: (dateString) => {
    if (!validators.date(dateString)) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },

  // URL validation
  url: (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Age range validation
  ageRange: (range) => {
    const validRanges = ['18 - 25', '26 - 35', '36 - 45', '46 - 55', '56+'];
    return validRanges.includes(range);
  },

  // Gender validation
  gender: (gender) => {
    const validGenders = ['male', 'female', 'other', 'prefer not to say'];
    return validGenders.includes(gender?.toLowerCase());
  },

  // Skin type validation
  skinType: (type) => {
    const validTypes = ['oily', 'dry', 'combination', 'sensitive', 'normal'];
    return validTypes.includes(type?.toLowerCase());
  },

  // Consultation channel validation
  consultationChannel: (channel) => {
    const validChannels = ['video-channel', 'whatsapp'];
    return validChannels.includes(channel);
  },

  // Time range validation
  timeRange: (range) => {
    const validRanges = [
      '2:00 PM - 3:00 PM',
      '3:00 PM - 4:00 PM', 
      '4:00 PM - 5:00 PM',
      '5:00 PM - 6:00 PM'
    ];
    return validRanges.includes(range);
  },

  // Delivery method validation
  deliveryMethod: (method) => {
    const validMethods = ['pickup', 'address'];
    return validMethods.includes(method);
  },

  // Order status validation
  orderStatus: (status) => {
    const validStatuses = ['successful', 'unsuccessful', 'flagged', 'all'];
    return validStatuses.includes(status);
  },

  // Delivery status validation
  deliveryStatus: (status) => {
    const validStatuses = ['unpaid', 'order-received', 'packaged', 'in-transit', 'delivered', 'all'];
    return validStatuses.includes(status);
  },

  // Session status validation
  sessionStatus: (status) => {
    const validStatuses = ['unpaid', 'unheld', 'in-session', 'completed', 'all'];
    return validStatuses.includes(status);
  },

  // Username validation
  username: (username) => {
    if (!username) return false;
    // 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username.trim());
  },

  // Password validation
  password: (password) => {
    if (!password) return false;
    // At least 6 characters
    return password.length >= 6;
  },

  // Strong password validation
  strongPassword: (password) => {
    if (!password) return false;
    // At least 8 characters, contains uppercase, lowercase, number
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  },

  // Name validation
  name: (name) => {
    if (!name) return false;
    const cleanName = name.trim();
    // 2-50 characters, letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
    return nameRegex.test(cleanName);
  },

  // Nigerian state validation
  nigerianState: (state) => {
    const states = [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
      'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
      'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
      'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
      'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ];
    return states.includes(state);
  }
};

// Form validation function
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    
    // Check each rule for the field
    for (const [rule, param] of Object.entries(fieldRules)) {
      try {
        let isValid = true;
        let errorMessage = '';
        
        switch (rule) {
          case 'required':
            if (param && !validators.required(value)) {
              isValid = false;
              errorMessage = `${formatFieldName(field)} is required`;
            }
            break;
            
          case 'email':
            if (param && value && !validators.email(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid email address';
            }
            break;
            
          case 'phone':
            if (param && value && !validators.phone(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid phone number';
            }
            break;
            
          case 'nigerianPhone':
            if (param && value && !validators.nigerianPhone(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid Nigerian phone number';
            }
            break;
            
          case 'minLength':
            if (value && !validators.minLength(value, param)) {
              isValid = false;
              errorMessage = `${formatFieldName(field)} must be at least ${param} characters`;
            }
            break;
            
          case 'maxLength':
            if (value && !validators.maxLength(value, param)) {
              isValid = false;
              errorMessage = `${formatFieldName(field)} must be no more than ${param} characters`;
            }
            break;
            
          case 'price':
            if (param && !validators.price(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid price';
            }
            break;
            
          case 'quantity':
            if (param && !validators.quantity(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid quantity';
            }
            break;
            
          case 'category':
            if (param && !validators.category(value, param)) {
              isValid = false;
              errorMessage = 'Please select a valid category';
            }
            break;
            
          case 'images':
            if (param && value) {
              const imageValidation = validators.images(value, param);
              if (!imageValidation.valid) {
                isValid = false;
                errorMessage = imageValidation.error;
              }
            }
            break;
            
          case 'image':
            if (param && value) {
              const imageValidation = validators.image(value);
              if (!imageValidation.valid) {
                isValid = false;
                errorMessage = imageValidation.error;
              }
            }
            break;
            
          case 'date':
            if (param && value && !validators.date(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid date';
            }
            break;
            
          case 'futureDate':
            if (param && value && !validators.futureDate(value)) {
              isValid = false;
              errorMessage = 'Please select a future date';
            }
            break;
            
          case 'ageRange':
            if (param && value && !validators.ageRange(value)) {
              isValid = false;
              errorMessage = 'Please select a valid age range';
            }
            break;
            
          case 'gender':
            if (param && value && !validators.gender(value)) {
              isValid = false;
              errorMessage = 'Please select a valid gender';
            }
            break;
            
          case 'skinType':
            if (param && value && !validators.skinType(value)) {
              isValid = false;
              errorMessage = 'Please select a valid skin type';
            }
            break;
            
          case 'consultationChannel':
            if (param && value && !validators.consultationChannel(value)) {
              isValid = false;
              errorMessage = 'Please select a valid consultation channel';
            }
            break;
            
          case 'timeRange':
            if (param && value && !validators.timeRange(value)) {
              isValid = false;
              errorMessage = 'Please select a valid time range';
            }
            break;
            
          case 'deliveryMethod':
            if (param && value && !validators.deliveryMethod(value)) {
              isValid = false;
              errorMessage = 'Please select a valid delivery method';
            }
            break;
            
          case 'name':
            if (param && value && !validators.name(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid name (2-50 characters, letters only)';
            }
            break;
            
          case 'username':
            if (param && value && !validators.username(value)) {
              isValid = false;
              errorMessage = 'Username must be 3-20 characters, letters, numbers and underscores only';
            }
            break;
            
          case 'password':
            if (param && value && !validators.password(value)) {
              isValid = false;
              errorMessage = 'Password must be at least 6 characters';
            }
            break;
            
          case 'strongPassword':
            if (param && value && !validators.strongPassword(value)) {
              isValid = false;
              errorMessage = 'Password must be at least 8 characters with uppercase, lowercase and number';
            }
            break;
            
          case 'nigerianState':
            if (param && value && !validators.nigerianState(value)) {
              isValid = false;
              errorMessage = 'Please select a valid Nigerian state';
            }
            break;
            
          case 'url':
            if (param && value && !validators.url(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid URL';
            }
            break;
            
          default:
            // Custom validator function
            if (typeof param === 'function') {
              const result = param(value);
              if (result !== true) {
                isValid = false;
                errorMessage = typeof result === 'string' ? result : `${formatFieldName(field)} is invalid`;
              }
            }
            break;
        }
        
        if (!isValid) {
          errors[field] = errorMessage;
          break; // Stop checking other rules for this field
        }
      } catch (error) {
        errors[field] = `Validation error for ${formatFieldName(field)}`;
        break;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper function to format field names for error messages
const formatFieldName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/_/g, ' '); // Replace underscores with spaces
};

// Predefined validation rule sets for common forms
export const validationRules = {
  // Product validation
  product: {
    name: { required: true, minLength: 2, maxLength: 100, name: true },
    price: { required: true, price: true },
    description: { required: true, minLength: 10, maxLength: 1000 },
    quantity: { required: true, quantity: true },
    category: { required: true },
    images: { images: 5 }
  },

  // User authentication
  login: {
    username: { required: true, username: true },
    password: { required: true, password: true }
  },

  // Contact form
  contact: {
    name: { required: true, minLength: 2, maxLength: 50, name: true },
    email: { required: true, email: true },
    phone: { required: true, nigerianPhone: true },
    subject: { required: true, minLength: 5, maxLength: 100 },
    message: { required: true, minLength: 10, maxLength: 1000 }
  },

  // Checkout form
  checkout: {
    phone: { required: true, nigerianPhone: true },
    delivery_method: { required: true, deliveryMethod: true },
    state: { nigerianState: true }, // Conditional based on delivery method
    city: { minLength: 2, maxLength: 50 },
    street_address: { minLength: 5, maxLength: 200 }
  },

  // Consultation booking
  consultation: {
    name: { required: true, minLength: 2, maxLength: 50, name: true },
    email: { required: true, email: true },
    phone: { required: true, nigerianPhone: true },
    age_range: { required: true, ageRange: true },
    gender: { required: true, gender: true },
    skin_type: { required: true, skinType: true },
    skin_concerns: { required: true },
    channel: { required: true, consultationChannel: true },
    date: { required: true, date: true, futureDate: true },
    time_range: { required: true, timeRange: true },
    current_skincare_products: { maxLength: 500 },
    additional_details: { maxLength: 1000 }
  }
};

// Utility function to validate against predefined rules
export const validateWithRules = (data, ruleName) => {
  const rules = validationRules[ruleName];
  if (!rules) {
    throw new Error(`Validation rules '${ruleName}' not found`);
  }
  return validateForm(data, rules);
};

export default {
  validators,
  validateForm,
  validateWithRules,
  validationRules
};