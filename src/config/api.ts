// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://manufest.id',
  ENDPOINTS: {
    REGISTER: '/register',
    TOKEN: '/token',
  }
};

// Helper function to get full endpoint URL
export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};