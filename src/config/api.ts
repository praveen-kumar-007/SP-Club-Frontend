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
};

export const getNewsShareUrl = (newsId: string): string =>
  `${API_ENDPOINTS.NEWS}/share/${encodeURIComponent(newsId)}`;

export default API_BASE_URL;
