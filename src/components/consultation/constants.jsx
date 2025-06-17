// constants.js
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

// Display time slots for UI
export const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

// Updated consultation formats to use API-compatible IDs
export const CONSULTATION_FORMATS = [
  { 
    id: 'video-channel', // Changed from 'video' to match API
    name: 'Live Beauty Session (via Zoom/Google Meet)', 
    price: 35000, 
    displayPrice: '₦35,000' 
  },
  { 
    id: 'whatsapp', // This already matches API
    name: 'Leksy WhatsApp Session', 
    price: 15000, 
    displayPrice: '₦15,000' 
  }
];

// API time ranges as per documentation
export const API_TIME_RANGES = [
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM', 
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM'
];

// Mapping helper for backwards compatibility
export const API_CHANNELS = {
  video: 'video-channel',
  whatsapp: 'whatsapp'
};

// Helper function to map display time slots to API time ranges
export const mapTimeSlotToAPIRange = (timeSlot) => {
  const timeMap = {
    '2:00 PM': '2:00 PM - 3:00 PM',
    '3:00 PM': '3:00 PM - 4:00 PM',
    '4:00 PM': '4:00 PM - 5:00 PM',
    '5:00 PM': '5:00 PM - 6:00 PM'
  };
  return timeMap[timeSlot] || timeSlot;
};

// Helper function to get API channel from format ID
export const getAPIChannel = (formatId) => {
  return formatId; // Since we've updated the IDs to match API expectations
};