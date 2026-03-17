// Dynamic API base URL based on environment
export const API_BASE_URL = 
  process.env.NODE_ENV === "production" 
    ? "https://sri-sai-hotel.vercel.app"
    : "http://localhost:3000";
