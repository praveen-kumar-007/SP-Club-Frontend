// API Configuration
// Default to production backend to avoid bundling a localhost URL in builds
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sp-club-backend.onrender.com';

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/register`,
  CONTACT: `${API_BASE_URL}/api/contact`,
  NEWS: `${API_BASE_URL}/api/news`,
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_REGISTER: `${API_BASE_URL}/api/admin/register`,
};

export default API_BASE_URL;
