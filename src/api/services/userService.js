// src/api/services/userService.js
import axios from '../axios';
import { ENDPOINTS } from '../endpoints';

export const sendContactMessage = async (formData) => {
  try {
    const response = await axios.post(ENDPOINTS.CONTACT, formData);
    return response.data;
  } catch (error) {
    console.error('Error sending contact message:', error);
    throw error;
  }
};

// Add other user-related service functions below
export const getUserProfile = async () => {
  try {
    const response = await axios.get(ENDPOINTS.USER_PROFILE);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put(ENDPOINTS.USER_PROFILE, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};