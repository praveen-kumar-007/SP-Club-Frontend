// Device Manager - Generates unique device ID and detects device info

const ADMIN_DEVICE_ID_KEY = "adminDeviceId";
const PLAYER_DEVICE_ID_KEY = "playerDeviceId";

const generateDeviceId = () =>
  `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

const getOrCreateDeviceIdByKey = (storageKey: string): string => {
  let deviceId = localStorage.getItem(storageKey);

  if (!deviceId) {
    // Persist a stable browser-level ID for this app on this device.
    deviceId = generateDeviceId();
    localStorage.setItem(storageKey, deviceId);
  }

  return deviceId;
};

export const getOrCreateDeviceId = (): string =>
  getOrCreateDeviceIdByKey(ADMIN_DEVICE_ID_KEY);

export const getOrCreatePlayerDeviceId = (): string =>
  getOrCreateDeviceIdByKey(PLAYER_DEVICE_ID_KEY);

export const getDeviceName = (): string => {
  // Detect device/browser info
  const userAgent = navigator.userAgent;
  let deviceName = "Unknown Device";

  if (/windows/i.test(userAgent)) {
    if (/chrome/i.test(userAgent)) {
      deviceName = "Windows - Chrome";
    } else if (/firefox/i.test(userAgent)) {
      deviceName = "Windows - Firefox";
    } else if (/edg/i.test(userAgent)) {
      deviceName = "Windows - Edge";
    } else if (/safari/i.test(userAgent)) {
      deviceName = "Windows - Safari";
    } else {
      deviceName = "Windows Device";
    }
  } else if (/macintosh/i.test(userAgent)) {
    if (/chrome/i.test(userAgent)) {
      deviceName = "Mac - Chrome";
    } else if (/firefox/i.test(userAgent)) {
      deviceName = "Mac - Firefox";
    } else if (/safari/i.test(userAgent)) {
      deviceName = "Mac - Safari";
    } else {
      deviceName = "Mac Device";
    }
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    deviceName = "iOS Device";
  } else if (/android/i.test(userAgent)) {
    deviceName = "Android Device";
  } else if (/linux/i.test(userAgent)) {
    deviceName = "Linux Device";
  }

  return deviceName;
};

export const clearDeviceId = (): void => {
  localStorage.removeItem(ADMIN_DEVICE_ID_KEY);
};

export const clearPlayerDeviceId = (): void => {
  localStorage.removeItem(PLAYER_DEVICE_ID_KEY);
};
