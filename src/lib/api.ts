const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (import.meta.env.PROD) {
    return "https://sri-sai-hotel.onrender.com";
  }

  return "http://localhost:5000"; // ✅ FIXED PORT
};

export const API_BASE_URL = getApiBaseUrl();