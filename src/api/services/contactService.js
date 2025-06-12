// src/api/services/contactService.js
const BASE_URL = 'https://leksycosmetics.com';

export const sendContactMessage = async (contactData) => {
  try {
    // Create FormData to send as POST request with form data
    const formData = new FormData();
    formData.append('name', contactData.name);
    formData.append('email', contactData.email);
    formData.append('phone', contactData.phone);
    formData.append('subject', contactData.subject);
    formData.append('message', contactData.message);

    console.log('Sending contact data:', {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      subject: contactData.subject,
      message: contactData.message
    });

    const response = await fetch(`${BASE_URL}/api/submit-contact`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    
    // Check if the API returned success
    if (data.code === 200) {
      return {
        success: true,
        message: data.message,
        submissionId: data.submission_id
      };
    } else {
      throw new Error(data.message || 'Failed to submit contact form');
    }
  } catch (error) {
    console.error('Contact service error:', error);
    throw error;
  }
};