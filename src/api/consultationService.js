// src/services/consultationService.js
const BASE_URL = 'https://leksycosmetics.com';

export const initiateConsultation = async (consultationData) => {
  const params = {
    name: consultationData.name,
    email: consultationData.email,
    phone: consultationData.phone,
    age_range: consultationData.age_range,
    gender: consultationData.gender,
    skin_type: consultationData.skin_type,
    skin_concerns: consultationData.skin_concerns.join(','),
    channel: consultationData.channel,
    date: consultationData.date,
    time_range: consultationData.time_range,
    success_redirect: consultationData.success_redirect,
    current_skincare_products: consultationData.current_skincare_products || '',
    additional_details: consultationData.additional_details || ''
  };

  try {
    const response = await fetch(`${BASE_URL}/api/consultation/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchBookedTimes = async (date) => {
  try {
    const url = date 
      ? `${BASE_URL}/api/consultation/fetch-booked-times?date=${date}`
      : `${BASE_URL}/api/consultation/fetch-booked-times`;
      
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Optional: Fetch single consultation details (requires admin token)
export const fetchConsultationDetails = async (consultationId, token) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/fetch-consultation?consultation_id=${consultationId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Optional: Fetch all consultations (requires admin token)
export const fetchAllConsultations = async (token, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.payment_status) {
      params.append('payment_status', filters.payment_status);
    }
    if (filters.session_held_status) {
      params.append('session_held_status', filters.session_held_status);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${BASE_URL}/api/fetch-consultations?${queryString}`
      : `${BASE_URL}/api/fetch-consultations`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Helper function to format consultation data for display
export const formatConsultationData = (consultation) => {
  if (!consultation) return null;

  return {
    id: consultation.consultation_id || consultation.unique_id,
    name: consultation.name,
    email: consultation.email,
    phone: consultation.phone,
    date: consultation.date,
    timeRange: consultation.time_range,
    channel: consultation.channel,
    amount: consultation.amount_paid,
    status: consultation.payment_status,
    sessionStatus: consultation.session_held_status,
    createdAt: consultation.created_at,
    skinType: consultation.skin_type,
    skinConcerns: consultation.skin_concerns,
    ageRange: consultation.age_range,
    gender: consultation.gender
  };
};

// Helper function to determine consultation format display name
export const getConsultationFormatDisplay = (channel) => {
  switch (channel) {
    case 'video-channel':
      return 'Video Call';
    case 'whatsapp':
      return 'WhatsApp Consultation';
    default:
      return channel;
  }
};

// Helper function to format date for display
export const formatDateForDisplay = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};