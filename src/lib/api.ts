import axios from 'axios';

// Create an instance of axios with default configuration
const api = axios.create({
  baseURL: '/api', // Use relative URL instead of absolute IP address
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // You can modify the request config here (add headers, auth tokens, etc.)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api; 