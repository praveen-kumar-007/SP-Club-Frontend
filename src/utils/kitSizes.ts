export const KIT_SIZE_OPTIONS = [
  { value: "XS", range: "30-32" },
  { value: "S", range: "32-36" },
  { value: "M", range: "36-40" },
  { value: "L", range: "40-44" },
  { value: "XL", range: "44-48" },
  { value: "XXL", range: "48-52" },
  { value: "XXXL", range: "52-56" },
] as const;

export const getKitSizeRange = (kitSize?: string | null) => {
  if (!kitSize) return null;
  return KIT_SIZE_OPTIONS.find((option) => option.value === kitSize)?.range || null;
};

export const formatKitSizeWithRange = (
  kitSize?: string | null,
  fallback = "Not selected",
) => {
  if (!kitSize) return fallback;
  const range = getKitSizeRange(kitSize);
  return range ? `${kitSize} (${range})` : kitSize;
};