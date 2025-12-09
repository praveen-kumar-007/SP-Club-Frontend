// Admin Session Manager - Auto logout after 15 minutes of inactivity

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const STORAGE_KEY = 'adminLastActivity';
const REDIRECT_DELAY = 5000; // 5 seconds delay before redirect

let timeoutId: NodeJS.Timeout | null = null;

export const initializeSessionManager = (onTimeout: () => void, showTimeoutDialog: () => void) => {
  // Update last activity timestamp
  const updateActivity = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  // Check if session has expired
  const checkSession = () => {
    const lastActivity = localStorage.getItem(STORAGE_KEY);
    if (!lastActivity) {
      onTimeout();
      return;
    }

    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    if (timeSinceActivity >= SESSION_TIMEOUT) {
      // Show timeout dialog first
      showTimeoutDialog();
      
      // Clear session and redirect after 5 seconds
      setTimeout(() => {
        onTimeout();
      }, REDIRECT_DELAY);
      return;
    }

    // Schedule next check
    const remainingTime = SESSION_TIMEOUT - timeSinceActivity;
    timeoutId = setTimeout(checkSession, remainingTime);
  };

  // Initialize activity timestamp
  updateActivity();

  // Set up event listeners for user activity
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  activityEvents.forEach(event => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // Start checking session
  checkSession();

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    activityEvents.forEach(event => {
      window.removeEventListener(event, updateActivity);
    });
    localStorage.removeItem(STORAGE_KEY);
  };
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};
