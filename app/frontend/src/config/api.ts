// Get API URL from environment variables or use a relative URL
const apiUrl = import.meta.env.VITE_API_URL || '/api';

export const API_URL = apiUrl;

// For debugging purposes - log the API URL being used
console.log('Using API URL:', API_URL);