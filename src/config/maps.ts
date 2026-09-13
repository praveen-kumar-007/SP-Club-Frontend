export const SP_KABADDI_LOCATION = {
  name: "SP Sports Academy",
  address:
    "SP Sports Academy, Shakti Mandir Path, Dhanbad, Jharkhand 826001",
  query:
    "SP Sports Academy, Shakti Mandir Path, Dhanbad, Jharkhand 826001",
  latitude: 23.7811364,
  longitude: 86.4234188,
};

export const SP_SPORTS_ACADEMY_LOCATION = SP_KABADDI_LOCATION;

const parseAttendanceRadiusMeters = (value?: string): number => {
  const fallback = 250;
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

export const PLAYER_ATTENDANCE_RADIUS_METERS = parseAttendanceRadiusMeters(
  import.meta.env.VITE_PLAYER_ATTENDANCE_RADIUS_METERS,
);

export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export const GOOGLE_MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=23.7811364,86.4234188";

export const GOOGLE_MAPS_DIRECTIONS_LINK =
  "https://www.google.com/maps/dir/?api=1&destination=23.7811364,86.4234188";

export const GOOGLE_MAPS_EMBED_URL = GOOGLE_MAPS_API_KEY
  ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
      SP_KABADDI_LOCATION.query,
    )}`
  : "https://maps.google.com/maps?q=23.7811364,86.4234188&hl=en&z=16&output=embed";
