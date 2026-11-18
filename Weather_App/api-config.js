// ===== API CONFIGURATION =====
// Get your free API key at https://openweathermap.org/api
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_KEY, BASE_URL, FORECAST_URL };
}