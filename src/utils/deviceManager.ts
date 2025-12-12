// Device Manager - Generates unique device ID and detects device info

const DEVICE_ID_KEY = 'adminDeviceId';

export const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate unique device ID based on browser/device fingerprint
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
};

export const getDeviceName = (): string => {
  // Detect device/browser info
  const userAgent = navigator.userAgent;
  let deviceName = 'Unknown Device';

  if (/windows/i.test(userAgent)) {
    if (/chrome/i.test(userAgent)) {
      deviceName = 'Windows - Chrome';
    } else if (/firefox/i.test(userAgent)) {
      deviceName = 'Windows - Firefox';
    } else if (/edg/i.test(userAgent)) {
      deviceName = 'Windows - Edge';
    } else if (/safari/i.test(userAgent)) {
      deviceName = 'Windows - Safari';
    } else {
      deviceName = 'Windows Device';
    }
  } else if (/macintosh/i.test(userAgent)) {
    if (/chrome/i.test(userAgent)) {
      deviceName = 'Mac - Chrome';
    } else if (/firefox/i.test(userAgent)) {
      deviceName = 'Mac - Firefox';
    } else if (/safari/i.test(userAgent)) {
      deviceName = 'Mac - Safari';
    } else {
      deviceName = 'Mac Device';
    }
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    deviceName = 'iOS Device';
  } else if (/android/i.test(userAgent)) {
    deviceName = 'Android Device';
  } else if (/linux/i.test(userAgent)) {
    deviceName = 'Linux Device';
  }

  return deviceName;
};

export const clearDeviceId = (): void => {
  localStorage.removeItem(DEVICE_ID_KEY);
};
