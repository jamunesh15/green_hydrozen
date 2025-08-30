import axios from 'axios';

// Create custom Axios instance
const instance = axios.create({
  baseURL: 'http://localhost:5000', // Match the PORT in server's env file
  timeout: 30000, // 30 seconds timeout for larger payloads
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: 50 * 1024 * 1024, // 50MB max response size
  maxBodyLength: 50 * 1024 * 1024, // 50MB max request size
  validateStatus: status => status < 500 // Only throw for server errors
});

// Add interceptor to add auth token to requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`Making ${config.method.toUpperCase()} request to ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle and log errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`Response error (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('Network error - no response received. Is the server running?', {
        url: error.config.url,
        baseURL: error.config.baseURL,
        method: error.config.method
      });
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
