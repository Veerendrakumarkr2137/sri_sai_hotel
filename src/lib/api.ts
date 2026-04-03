const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, "");

export const API_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || "");

if (!API_URL) {
  console.warn("VITE_API_BASE_URL is not set. API requests will fail until it is configured.");
}

