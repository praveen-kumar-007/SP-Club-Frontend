// Admin Session Manager - activity tracking without forced timeout
import API_BASE_URL from "@/config/api";

const SESSION_START_KEY = 'adminSessionStart';
const STORAGE_KEY = 'adminLastActivity';

export const initializeSessionManager = (_onTimeout: () => void, _showTimeoutDialog: () => void) => {
  // Update last activity timestamp
  const updateActivity = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  // Remove old timeout-session metadata so timeout banners no longer show.
  localStorage.removeItem(SESSION_START_KEY);
  
  // Update last activity timestamp
  updateActivity();

  // Set up event listeners for user activity
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  activityEvents.forEach(event => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // Return cleanup function
  return () => {
    activityEvents.forEach(event => {
      window.removeEventListener(event, updateActivity);
    });
    localStorage.removeItem(STORAGE_KEY);
  };
};

export const clearSession = () => {
  // Notify backend of logout
  const deviceId = localStorage.getItem('adminDeviceId');
  const token = localStorage.getItem('adminToken');
  
  if (deviceId && token) {
    try {
      fetch(`${API_BASE_URL}/api/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deviceId })
      }).catch(() => {
        // Fail silently if backend is unreachable
      });
    } catch (error) {
      // Fail silently
    }
  }

  // Clear local storage
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_START_KEY);
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};
