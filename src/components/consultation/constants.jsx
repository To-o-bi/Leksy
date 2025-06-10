// constants.js (optional, or keep in the main Form component)
export const SKIN_CONCERNS = [
  { id: 'acne', name: 'Acne and Blemishes' },
  { id: 'dryness', name: 'Dryness and Dehydration' },
  { id: 'aging', name: 'Anti-Aging and Wrinkles' },
  { id: 'sensitivity', name: 'Sensitivity and Redness' },
  { id: 'pigmentation', name: 'Hyperpigmentation' },
  { id: 'oiliness', name: 'Excess Oil and Shine' },
];

export const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

export const CONSULTATION_FORMATS = [
  { id: 'video', name: 'Live Beauty Session (via Zoom/Google Meet)', price: 35000, displayPrice: '₦35,000' },
  { id: 'whatsapp', name: 'Leksy WhatsApp Session', price: 15000, displayPrice: '₦15,000' }
];

export const AGE_RANGES = [
    { value: "under18", label: "Under 18" },
    { value: "18-24", label: "18-24" },
    { value: "25-34", label: "25-34" },
    { value: "35-44", label: "35-44" },
    { value: "45-54", label: "45-54" },
    { value: "55+", label: "55+" },
];

export const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Normal'];