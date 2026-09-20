// Admin Session Manager - 15-minute continuous inactivity auto-logout & screen-close auto-logout
import API_BASE_URL from "@/config/api";

export const STORAGE_LAST_ACTIVITY = "adminLastActivity";
export const SESSION_ACTIVE_KEY = "adminSessionActive";
export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 continuous minutes

export const initializeSessionManager = (
  onTimeout?: () => void,
  showTimeoutDialog?: () => void,
) => {
  const token = localStorage.getItem("adminToken");
  if (!token) return () => {};

  // 1. Screen / Tab Close Detection:
  // Modern browsers discard sessionStorage when the tab or window is closed.
  // If adminToken exists in localStorage but adminSessionActive is missing in sessionStorage,
  // the previous screen was closed.
  const isSessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);
  if (!isSessionActive) {
    clearSession();
    if (onTimeout) onTimeout();
    return () => {};
  }

  // 2. Check if continuous inactivity limit was already reached while sleeping / backgrounded
  const lastActivityRaw = localStorage.getItem(STORAGE_LAST_ACTIVITY);
  const now = Date.now();
  if (lastActivityRaw) {
    const elapsed = now - Number(lastActivityRaw);
    if (elapsed >= INACTIVITY_TIMEOUT_MS) {
      clearSession();
      if (onTimeout) onTimeout();
      return () => {};
    }
  }

  // Update initial activity timestamp
  let lastRecorded = now;
  localStorage.setItem(STORAGE_LAST_ACTIVITY, now.toString());

  // Throttled activity update (at most once every 5 seconds to reduce storage operations)
  const updateActivity = () => {
    const current = Date.now();
    if (current - lastRecorded > 5000) {
      lastRecorded = current;
      localStorage.setItem(STORAGE_LAST_ACTIVITY, current.toString());
    }
  };

  const activityEvents = [
    "mousedown",
    "mousemove",
    "keydown",
    "scroll",
    "touchstart",
    "click",
    "wheel",
  ];

  activityEvents.forEach((event) => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // Interval timer checking for continuous 15-minute inactivity
  const intervalId = window.setInterval(() => {
    const latestRaw = localStorage.getItem(STORAGE_LAST_ACTIVITY);
    const latest = latestRaw ? Number(latestRaw) : lastRecorded;
    const idleTime = Date.now() - latest;

    if (idleTime >= INACTIVITY_TIMEOUT_MS) {
      clearSession();
      if (onTimeout) onTimeout();
    }
  }, 10000);

  // Check immediately upon tab visibility (e.g., waking from lock screen or switching back tabs)
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      const latestRaw = localStorage.getItem(STORAGE_LAST_ACTIVITY);
      const latest = latestRaw ? Number(latestRaw) : lastRecorded;
      if (Date.now() - latest >= INACTIVITY_TIMEOUT_MS) {
        clearSession();
        if (onTimeout) onTimeout();
      } else {
        updateActivity();
      }
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Auto-release session on backend when screen / window / tab is closed
  const handlePageHide = () => {
    const deviceId = localStorage.getItem("adminDeviceId");
    const currentToken = localStorage.getItem("adminToken");
    if (deviceId) {
      const logoutUrl = `${API_BASE_URL}/api/admin/logout`;
      const payload = JSON.stringify({ deviceId, token: currentToken });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(logoutUrl, new Blob([payload], { type: "application/json" }));
      }
    }
  };
  window.addEventListener("pagehide", handlePageHide);

  // Return cleanup function
  return () => {
    activityEvents.forEach((event) => {
      window.removeEventListener(event, updateActivity);
    });
    window.clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", handlePageHide);
  };
};

export const clearSession = () => {
  const deviceId = localStorage.getItem("adminDeviceId");
  const token = localStorage.getItem("adminToken");

  if (deviceId) {
    const logoutUrl = `${API_BASE_URL}/api/admin/logout`;
    const payload = JSON.stringify({ deviceId, token });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(logoutUrl, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(logoutUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }

  localStorage.removeItem(STORAGE_LAST_ACTIVITY);
  localStorage.removeItem("adminSessionStart");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("adminDeviceId");
  localStorage.removeItem("adminDeviceName");
  sessionStorage.removeItem(SESSION_ACTIVE_KEY);
};
