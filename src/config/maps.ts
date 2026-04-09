export const SP_KABADDI_LOCATION = {
  name: "SP Kabaddi Group Dhanbad",
  address:
    "SP Kabaddi Group Dhanbad, Shakti Mandir Path, Dhanbad, Jharkhand 826007",
  query:
    "SP Kabaddi Group Dhanbad, Shakti Mandir Path, Dhanbad, Jharkhand 826007",
};

export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export const GOOGLE_MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=QCJF%2BF93+SP+Kabaddi+Group+Dhanbad%2C+Shakti+Mandir+Path%2C+Dhanbad%2C+Jharkhand+826007";

export const GOOGLE_MAPS_EMBED_URL = GOOGLE_MAPS_API_KEY
  ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
      SP_KABADDI_LOCATION.query,
    )}`
  : GOOGLE_MAPS_LINK.replace("/search/?api=1&query=", "/maps?q=");
