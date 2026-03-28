const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (import.meta.env.PROD) {
    return "https://sri-sai-hotel-backend.onrender.com";
  }

  return "http://localhost:5000";
};

export const API_BASE_URL = getApiBaseUrl();
