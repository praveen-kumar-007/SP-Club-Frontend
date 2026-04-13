const ADMIN_ATTENDANCE_GEO_KEY = "adminAttendanceGeoEnabled";
const MAX_ALLOWED_ACCURACY_METERS = 100;

export interface AdminLocationPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
}

export const getAdminAttendanceGeoEnabled = (): boolean => {
  const saved = localStorage.getItem(ADMIN_ATTENDANCE_GEO_KEY);
  return saved === "true";
};

export const setAdminAttendanceGeoEnabled = (enabled: boolean): void => {
  localStorage.setItem(ADMIN_ATTENDANCE_GEO_KEY, String(enabled));
};

export const isCurrentAdminSuperAdmin = (): boolean => {
  const raw = localStorage.getItem("adminUser");
  if (!raw) return false;

  try {
    const admin = JSON.parse(raw) as { role?: string };
    const role = (admin.role || "").toLowerCase().trim();
    return (
      role === "super admin" || role === "superadmin" || role === "super_admin"
    );
  } catch {
    return false;
  }
};

const getLiveLocation = () => {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });
  });
};

const hasValidCoordinates = (latitude: number, longitude: number) => {
  const validRange =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;
  const notZeroPair = !(
    Math.abs(latitude) < 0.000001 && Math.abs(longitude) < 0.000001
  );
  return validRange && notZeroPair;
};

export const getRequiredAdminLocationPayload =
  async (): Promise<AdminLocationPayload> => {
    const position = await getLiveLocation();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = Number(position.coords.accuracy);

    if (!hasValidCoordinates(latitude, longitude)) {
      throw new Error(
        "Valid latitude and longitude are required to mark attendance.",
      );
    }

    if (!Number.isFinite(accuracy) || accuracy > MAX_ALLOWED_ACCURACY_METERS) {
      throw new Error(
        `Location is not precise enough (${Math.round(accuracy)}m). Enable precise location and retry.`,
      );
    }

    return {
      latitude,
      longitude,
      accuracy,
      address: "Marked by admin with live location",
    };
  };
