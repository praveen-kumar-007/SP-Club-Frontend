// Admin Session Manager - Auto logout after 5 minutes of inactivity

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const SESSION_START_KEY = 'adminSessionStart';
const STORAGE_KEY = 'adminLastActivity';
const REDIRECT_DELAY = 5000; // 5 seconds delay before redirect

let timeoutId: NodeJS.Timeout | null = null;

export const initializeSessionManager = (onTimeout: () => void, showTimeoutDialog: () => void) => {
  // Update last activity timestamp
  const updateActivity = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  // Check if session has expired (based on session start time, not last activity)
  const checkSession = () => {
    const sessionStart = localStorage.getItem(SESSION_START_KEY);
    if (!sessionStart) {
      onTimeout();
      return;
    }

    const timeElapsedSinceStart = Date.now() - parseInt(sessionStart);
    if (timeElapsedSinceStart >= SESSION_TIMEOUT) {
      // Show timeout dialog first
      showTimeoutDialog();
      
      // Clear session and redirect after 5 seconds
      setTimeout(() => {
        onTimeout();
      }, REDIRECT_DELAY);
      return;
    }

    // Schedule next check
    const remainingTime = SESSION_TIMEOUT - timeElapsedSinceStart;
    timeoutId = setTimeout(checkSession, remainingTime);
  };

  // Initialize session start time (only on first login, not on page refresh)
  if (!localStorage.getItem(SESSION_START_KEY)) {
    localStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }
  
  // Update last activity timestamp
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
  localStorage.removeItem(SESSION_START_KEY);
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};
