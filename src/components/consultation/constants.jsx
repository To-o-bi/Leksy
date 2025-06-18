// constants.js - Fixed version
export const SKIN_CONCERNS = [
  { id: 'acne', name: 'Acne and Blemishes' },
  { id: 'dryness', name: 'Dryness and Dehydration' },
  { id: 'aging', name: 'Anti-Aging and Wrinkles' },
  { id: 'sensitivity', name: 'Sensitivity and Redness' },
  { id: 'pigmentation', name: 'Hyperpigmentation' },
  { id: 'oiliness', name: 'Excess Oil and Shine' },
];

export const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Normal'];

export const AGE_RANGES = [
  { value: "under18", label: "Under 18" },
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55+", label: "55+" },
];

export const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' }
];

// Updated consultation formats to use API-compatible IDs
export const CONSULTATION_FORMATS = [
  { 
    id: 'video-channel', // Matches API expectation
    name: 'Live Beauty Session (via Zoom/Google Meet)', 
    price: 35000, 
    displayPrice: '₦35,000' 
  },
  { 
    id: 'whatsapp', // Matches API expectation
    name: 'Leksy WhatsApp Session', 
    price: 15000, 
    displayPrice: '₦15,000' 
  }
];

// API time ranges as per documentation - these are what the API expects
export const API_TIME_RANGES = [
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM', 
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM'
];

// FIXED: Helper function to map time slots to API ranges
export const mapTimeSlotToAPIRange = (timeSlot) => {
  // If it's already in the correct format, return as-is
  if (API_TIME_RANGES.includes(timeSlot)) {
    return timeSlot;
  }
  
  // Map individual times to ranges (for backwards compatibility)
  const timeMap = {
    '2:00 PM': '2:00 PM - 3:00 PM',
    '3:00 PM': '3:00 PM - 4:00 PM',
    '4:00 PM': '4:00 PM - 5:00 PM',
    '5:00 PM': '5:00 PM - 6:00 PM'
  };
  
  const mappedTime = timeMap[timeSlot];
  if (mappedTime) {
    return mappedTime;
  }
  
  // If no mapping found, log for debugging and return original
  console.warn('⚠️ Time slot mapping failed for:', timeSlot);
  console.warn('Available mappings:', Object.keys(timeMap));
  console.warn('Available API ranges:', API_TIME_RANGES);
  
  return timeSlot;
};

// FIXED: Helper function to get API channel from format ID
export const getAPIChannel = (formatId) => {
  // Validate that the formatId is one we support
  const validChannels = ['video-channel', 'whatsapp'];
  
  if (!formatId) {
    console.warn('⚠️ No formatId provided to getAPIChannel');
    return null;
  }
  
  if (!validChannels.includes(formatId)) {
    console.warn('⚠️ Invalid formatId:', formatId);
    console.warn('Valid channels:', validChannels);
    return null;
  }
  
  return formatId; // Since our IDs now match the API expectations
};

// Export these for debugging
export const DEBUG_INFO = {
  validChannels: ['video-channel', 'whatsapp'],
  validTimeRanges: API_TIME_RANGES,
  timeMapping: {
    '2:00 PM': '2:00 PM - 3:00 PM',
    '3:00 PM': '3:00 PM - 4:00 PM',
    '4:00 PM': '4:00 PM - 5:00 PM',
    '5:00 PM': '5:00 PM - 6:00 PM'
  }
};