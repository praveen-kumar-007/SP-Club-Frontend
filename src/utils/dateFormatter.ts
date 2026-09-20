/**
 * SP Sports Academy - Standardized Date Formatter
 * Strict DD-MM-YYYY format style as required across all administrative and athlete interfaces.
 */

/**
 * Formats any Date or date string into DD-MM-YYYY format (e.g. 13-12-2025).
 * Timezone: Indian Standard Time (Asia/Kolkata).
 */
export const formatDateDDMMYYYY = (dateInput?: string | Date | null): string => {
  if (!dateInput) return "N/A";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (!d || Number.isNaN(d.getTime())) return "N/A";

  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(d);

  const day = parts.find((p) => p.type === "day")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const year = parts.find((p) => p.type === "year")?.value || "";

  return `${day}-${month}-${year}`;
};

/**
 * Formats any Date or date string into DD-MM-YYYY hh:mm AM/PM format (e.g. 13-12-2025 04:30 PM).
 * Timezone: Indian Standard Time (Asia/Kolkata).
 */
export const formatDateTimeDDMMYYYY = (dateInput?: string | Date | null): string => {
  if (!dateInput) return "N/A";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (!d || Number.isNaN(d.getTime())) return "N/A";

  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(d);

  const day = parts.find((p) => p.type === "day")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const year = parts.find((p) => p.type === "year")?.value || "";
  const hour = parts.find((p) => p.type === "hour")?.value || "";
  const minute = parts.find((p) => p.type === "minute")?.value || "";
  const dayPeriod = (parts.find((p) => p.type === "dayPeriod")?.value || "").toUpperCase();

  return `${day}-${month}-${year} ${hour}:${minute} ${dayPeriod}`.trim();
};

export default formatDateDDMMYYYY;
