// API Configuration
// Accept values like "api.spkabaddi.me" or "https://api.spkabaddi.me/"
const normalizeApiBaseUrl = (value?: string): string => {
  const fallback = "https://api.spkabaddi.me";
  const raw = value?.trim();

  if (!raw) {
    return fallback;
  }

  const withProtocol = /^https?:\/\//i.test(raw)
    ? raw
    : /^(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(raw)
      ? `http://${raw}`
      : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.toLowerCase();

    // Guard against common production misconfiguration where frontend domain is used as API base.
    if (host === "spkabaddi.me" || host === "www.spkabaddi.me") {
      return fallback;
    }

    // Keep only scheme + host + port to prevent accidental path-based API bases.
    return parsed.origin;
  } catch {
    return fallback;
  }
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/register`,
  CONTACT: `${API_BASE_URL}/api/contact`,
  NEWS: `${API_BASE_URL}/api/news`,
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_REGISTER: `${API_BASE_URL}/api/admin/register`,
  ADMIN_PLAYERS: `${API_BASE_URL}/api/admin/players`,
  ADMIN_ATTENDANCE: `${API_BASE_URL}/api/admin/attendance`,
  ADMIN_PLAYER_MESSAGES: `${API_BASE_URL}/api/admin/player-messages`,
  ADMIN_FORGOT_PASSWORD_REQUEST: `${API_BASE_URL}/api/admin/password/forgot/request`,
  ADMIN_FORGOT_PASSWORD_RESET: `${API_BASE_URL}/api/admin/password/forgot/reset`,
  ADMIN_MAIL_SETTINGS: `${API_BASE_URL}/api/admin/mail/settings`,
  ADMIN_MAIL_SEND: `${API_BASE_URL}/api/admin/mail/send`,
  ADMIN_LOGIN_HISTORY: `${API_BASE_URL}/api/admin/login-history`,
  ADMIN_FEE_PLAYERS: `${API_BASE_URL}/api/admin/fees/players`,
  ADMIN_FEE_PLAYER_STATUS: `${API_BASE_URL}/api/admin/fees`,
  PLAYER_LOGIN: `${API_BASE_URL}/api/player/login`,
  PLAYER_ME: `${API_BASE_URL}/api/player/me`,
  PLAYER_ME_UPDATE: `${API_BASE_URL}/api/player/me`,
  PLAYER_ME_PHOTO: `${API_BASE_URL}/api/player/me/photo`,
  PLAYER_ATTENDANCE: `${API_BASE_URL}/api/player/attendance`,
  PLAYER_MESSAGES: `${API_BASE_URL}/api/player/messages`,
  PLAYER_MESSAGES_UNREAD_COUNT: `${API_BASE_URL}/api/player/messages/unread-count`,
  PLAYER_MESSAGES_READ_ALL: `${API_BASE_URL}/api/player/messages/read-all`,
  PLAYER_FORGOT_PASSWORD_REQUEST: `${API_BASE_URL}/api/player/password/forgot/request`,
  PLAYER_FORGOT_PASSWORD_RESET: `${API_BASE_URL}/api/player/password/forgot/reset`,
  PLAYER_CHANGE_PASSWORD: `${API_BASE_URL}/api/player/password/change`,
  PLAYER_FEES: `${API_BASE_URL}/api/player/fees`,
};

const normalizeFrontendBaseUrl = (value?: string): string => {
  const fallback = "https://spkabaddi.me";
  const raw = value?.trim();

  if (raw) {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      return new URL(withProtocol).origin;
    } catch {
      // Fall through to fallback
    }
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return fallback;
};

export const FRONTEND_BASE_URL = normalizeFrontendBaseUrl(
  import.meta.env.VITE_FRONTEND_URL,
);

export const getFrontendUrl = (path: string): string => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${FRONTEND_BASE_URL}${normalized}`;
};

export const getNewsShareUrl = (newsId: string): string =>
  getFrontendUrl(`/news/${encodeURIComponent(newsId)}`);

export default API_BASE_URL;
