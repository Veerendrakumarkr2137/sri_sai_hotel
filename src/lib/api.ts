// Dynamic API base URL based on environment
const getApiBaseUrl = () => {
  // Use environment variable if set (for Vercel deployment)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In production (Vercel), use Render backend URL
  // In development, use localhost
  if (import.meta.env.PROD) {
    return "https://sri-sai-hotel.onrender.com";
  }
  
  return "http://localhost:3000";
};

export const API_BASE_URL = getApiBaseUrl();
