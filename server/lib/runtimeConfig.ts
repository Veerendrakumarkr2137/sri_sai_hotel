import dotenv from "dotenv";

dotenv.config();

function getTrimmedEnv(key: string) {
  return process.env[key]?.trim() || "";
}

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getJwtSecret() {
  return getTrimmedEnv("JWT_SECRET") || "hotel-sai-development-secret";
}

export function getFrontendUrl() {
  return normalizeUrl(getTrimmedEnv("FRONTEND_URL") || "http://localhost:5173");
}

export function getAllowedCorsOrigins() {
  const configuredOrigins = [getTrimmedEnv("FRONTEND_URL"), getTrimmedEnv("FRONTEND_URLS")]
    .flatMap((value) => value.split(","))
    .map((origin) => normalizeUrl(origin.trim()))
    .filter(Boolean);

  return Array.from(
    new Set([
      "https://sri-sai-hotel.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
      ...configuredOrigins,
    ]),
  );
}

export function getHotelUpiDetails() {
  return {
    upiId: getTrimmedEnv("HOTEL_UPI_ID") || getTrimmedEnv("UPI_ID"),
    upiName: getTrimmedEnv("HOTEL_UPI_NAME") || getTrimmedEnv("UPI_NAME"),
  };
}

export function getHotelContactDetails() {
  const supportPhone = getTrimmedEnv("HOTEL_SUPPORT_PHONE") || getTrimmedEnv("HOTEL_PHONE");
  const whatsAppNumber = (getTrimmedEnv("HOTEL_WHATSAPP_NUMBER") || supportPhone).replace(/\D/g, "");

  return {
    supportEmail: getTrimmedEnv("HOTEL_CONTACT_EMAIL") || getTrimmedEnv("EMAIL_USER"),
    supportPhone,
    whatsAppNumber,
  };
}
