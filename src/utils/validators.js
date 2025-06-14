// src/utils/validators.js - Form validation utilities

/**
 * Email validation using RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Remove whitespace
  const trimmedEmail = email.trim();
  
  // Check length (RFC 5321 limits)
  if (trimmedEmail.length === 0 || trimmedEmail.length > 254) {
    return false;
  }

  // RFC 5322 compliant regex (simplified but comprehensive)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }

  // Additional checks
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;
  
  // Local part validation
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }

  // Domain validation
  if (domain.length === 0 || domain.length > 253) {
    return false;
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return false;
  }

  // Check for leading/trailing dots in local part
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  return true;
};

/**
 * Phone number validation (supports multiple formats)
 * Primarily designed for Nigerian numbers but flexible for international
 * @param {string} phone - Phone number to validate
 * @param {string} countryCode - Country code (default: '+234')
 * @returns {boolean} - True if valid phone number
 */
export const validatePhone = (phone, countryCode = '+234') => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if empty after cleaning
  if (cleanPhone.length === 0) {
    return false;
  }

  // Nigerian phone number validation
  if (countryCode === '+234') {
    return validateNigerianPhone(cleanPhone);
  }

  // General international phone validation
  return validateInternationalPhone(cleanPhone);
};

/**
 * Validate Nigerian phone numbers
 * @param {string} cleanPhone - Phone number with only digits
 * @returns {boolean} - True if valid Nigerian phone number
 */
export const validateNigerianPhone = (cleanPhone) => {
  // Nigerian phone patterns:
  // 234XXXXXXXXX (country code + 10 digits)
  // 0XXXXXXXXXX (local format with leading 0)
  // XXXXXXXXXX (without leading 0 or country code)

  if (cleanPhone.startsWith('234')) {
    // Format: 234XXXXXXXXX (should be 13 digits total)
    if (cleanPhone.length !== 13) {
      return false;
    }
    
    const localNumber = cleanPhone.substring(3);
    return validateNigerianLocalNumber(localNumber);
  } else if (cleanPhone.startsWith('0')) {
    // Format: 0XXXXXXXXXX (should be 11 digits total)
    if (cleanPhone.length !== 11) {
      return false;
    }
    
    const localNumber = cleanPhone.substring(1);
    return validateNigerianLocalNumber(localNumber);
  } else {
    // Format: XXXXXXXXXX (should be 10 digits)
    if (cleanPhone.length !== 10) {
      return false;
    }
    
    return validateNigerianLocalNumber(cleanPhone);
  }
};

/**
 * Validate Nigerian local number (10 digits without country code or leading 0)
 * @param {string} localNumber - 10-digit local number
 * @returns {boolean} - True if valid
 */
export const validateNigerianLocalNumber = (localNumber) => {
  if (!localNumber || localNumber.length !== 10) {
    return false;
  }

  // Nigerian mobile networks start with specific prefixes
  const validPrefixes = [
    // MTN
    '803', '806', '813', '814', '816', '703', '706', '903', '906',
    // Airtel
    '802', '808', '812', '701', '708', '902', '907', '901',
    // Glo
    '805', '807', '815', '705', '905',
    // 9mobile (formerly Etisalat)
    '809', '817', '818', '908', '909',
    // NTEL
    '804',
    // Smile
    '702',
    // Multi-Links
    '709',
    // Starcomms
    '819',
    // Zoom Mobile
    '707'
  ];

  const prefix = localNumber.substring(0, 3);
  return validPrefixes.includes(prefix);
};

/**
 * Validate international phone numbers (general validation)
 * @param {string} cleanPhone - Phone number with only digits
 * @returns {boolean} - True if valid international phone number
 */
export const validateInternationalPhone = (cleanPhone) => {
  // International phone numbers are typically 7-15 digits
  const minLength = 7;
  const maxLength = 15;
  
  return cleanPhone.length >= minLength && cleanPhone.length <= maxLength;
};

/**
 * Validate name field
 * @param {string} name - Name to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateName = (name, options = {}) => {
  const {
    minLength = 2,
    maxLength = 50,
    allowNumbers = false,
    allowSpecialChars = false
  } = options;

  const result = {
    isValid: false,
    error: null
  };

  if (!name || typeof name !== 'string') {
    result.error = 'Name is required';
    return result;
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    result.error = 'Name is required';
    return result;
  }

  if (trimmedName.length < minLength) {
    result.error = `Name must be at least ${minLength} characters`;
    return result;
  }

  if (trimmedName.length > maxLength) {
    result.error = `Name must be less than ${maxLength} characters`;
    return result;
  }

  // Pattern validation
  let pattern = /^[a-zA-Z\s'-]+$/;
  
  if (allowNumbers && allowSpecialChars) {
    pattern = /^[a-zA-Z0-9\s'-.@#&!]+$/;
  } else if (allowNumbers) {
    pattern = /^[a-zA-Z0-9\s'-]+$/;
  } else if (allowSpecialChars) {
    pattern = /^[a-zA-Z\s'-.@#&!]+$/;
  }

  if (!pattern.test(trimmedName)) {
    if (!allowNumbers && !allowSpecialChars) {
      result.error = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    } else {
      result.error = 'Name contains invalid characters';
    }
    return result;
  }

  // Check for consecutive spaces
  if (/\s{2,}/.test(trimmedName)) {
    result.error = 'Name cannot contain consecutive spaces';
    return result;
  }

  result.isValid = true;
  return result;
};

/**
 * Validate subject line
 * @param {string} subject - Subject to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateSubject = (subject, options = {}) => {
  const {
    minLength = 3,
    maxLength = 100
  } = options;

  const result = {
    isValid: false,
    error: null
  };

  if (!subject || typeof subject !== 'string') {
    result.error = 'Subject is required';
    return result;
  }

  const trimmedSubject = subject.trim();

  if (trimmedSubject.length === 0) {
    result.error = 'Subject is required';
    return result;
  }

  if (trimmedSubject.length < minLength) {
    result.error = `Subject must be at least ${minLength} characters`;
    return result;
  }

  if (trimmedSubject.length > maxLength) {
    result.error = `Subject must be less than ${maxLength} characters`;
    return result;
  }

  result.isValid = true;
  return result;
};

/**
 * Validate message content
 * @param {string} message - Message to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateMessage = (message, options = {}) => {
  const {
    minLength = 10,
    maxLength = 1000
  } = options;

  const result = {
    isValid: false,
    error: null
  };

  if (!message || typeof message !== 'string') {
    result.error = 'Message is required';
    return result;
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    result.error = 'Message is required';
    return result;
  }

  if (trimmedMessage.length < minLength) {
    result.error = `Message must be at least ${minLength} characters`;
    return result;
  }

  if (trimmedMessage.length > maxLength) {
    result.error = `Message must be less than ${maxLength} characters`;
    return result;
  }

  result.isValid = true;
  return result;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @returns {boolean} - True if valid URL
 */
export const validateUrl = (url, options = {}) => {
  const { requireProtocol = true } = options;

  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    
    if (requireProtocol) {
      return ['http:', 'https:'].includes(urlObj.protocol);
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result with strength score
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;

  const result = {
    isValid: false,
    error: null,
    strength: 0,
    suggestions: []
  };

  if (!password || typeof password !== 'string') {
    result.error = 'Password is required';
    return result;
  }

  if (password.length < minLength) {
    result.error = `Password must be at least ${minLength} characters`;
    return result;
  }

  if (password.length > maxLength) {
    result.error = `Password must be less than ${maxLength} characters`;
    return result;
  }

  // Check requirements and calculate strength
  let strength = 0;

  if (requireUppercase && /[A-Z]/.test(password)) {
    strength += 1;
  } else if (requireUppercase) {
    result.suggestions.push('Add uppercase letters');
  }

  if (requireLowercase && /[a-z]/.test(password)) {
    strength += 1;
  } else if (requireLowercase) {
    result.suggestions.push('Add lowercase letters');
  }

  if (requireNumbers && /\d/.test(password)) {
    strength += 1;
  } else if (requireNumbers) {
    result.suggestions.push('Add numbers');
  }

  if (requireSpecialChars && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 1;
  } else if (requireSpecialChars) {
    result.suggestions.push('Add special characters');
  }

  // Additional strength factors
  if (password.length >= 12) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 0.5;

  result.strength = Math.min(strength, 5);
  result.isValid = result.suggestions.length === 0;

  if (!result.isValid) {
    result.error = `Password must contain: ${result.suggestions.join(', ')}`;
  }

  return result;
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @param {string} countryCode - Country code
 * @returns {string} - Formatted phone number
 */
export const formatPhoneForDisplay = (phone, countryCode = '+234') => {
  if (!phone) return '';

  const cleanPhone = phone.replace(/\D/g, '');

  if (countryCode === '+234') {
    // Format Nigerian numbers
    if (cleanPhone.startsWith('234') && cleanPhone.length === 13) {
      const local = cleanPhone.substring(3);
      return `+234 ${local.substring(0, 3)} ${local.substring(3, 6)} ${local.substring(6)}`;
    } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      return `${cleanPhone.substring(0, 4)} ${cleanPhone.substring(4, 7)} ${cleanPhone.substring(7)}`;
    } else if (cleanPhone.length === 10) {
      return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
    }
  }

  // Default formatting for international numbers
  if (cleanPhone.length >= 10) {
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return phone;
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input, options = {}) => {
  const {
    removeHtml = true,
    removeScripts = true,
    trim = true,
    maxLength = null
  } = options;

  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  if (trim) {
    sanitized = sanitized.trim();
  }

  if (removeHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  if (removeScripts) {
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Validate complete contact form
 * @param {Object} data - Contact form data
 * @returns {Object} - Validation result
 */
export const validateContactForm = (data) => {
  const errors = {};
  let isValid = true;

  // Validate name
  const nameResult = validateName(data.name);
  if (!nameResult.isValid) {
    errors.name = nameResult.error;
    isValid = false;
  }

  // Validate email
  if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Validate phone
  if (!validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
    isValid = false;
  }

  // Validate subject
  const subjectResult = validateSubject(data.subject);
  if (!subjectResult.isValid) {
    errors.subject = subjectResult.error;
    isValid = false;
  }

  // Validate message
  const messageResult = validateMessage(data.message);
  if (!messageResult.isValid) {
    errors.message = messageResult.error;
    isValid = false;
  }

  return {
    isValid,
    errors
  };
};