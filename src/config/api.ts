// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/register`,
  CONTACT: `${API_BASE_URL}/api/contact`,
};

export default API_BASE_URL;
