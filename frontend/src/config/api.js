import axios from 'axios';
import { Platform } from 'react-native';

// Important: Replace 192.168.29.222 with your actual PC's IP Address
// on your local Wi-Fi network. 
// Run `ipconfig` (Windows) or `ifconfig` (Mac) to find it.

// We detected 192.168.29.222 as your active Wi-Fi IPv4 address.
export const BASE_URL = 'http://192.168.29.222:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Log outgoing requests
api.interceptors.request.use(
  (config) => {
    console.log(`[Axios] ⬆️ ${config.method.toUpperCase()} ${config.url}`);
    if (config.data) {
       console.log(`[Axios Payload]`, config.data);
    }
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Log incoming responses & network failures
api.interceptors.response.use(
  (response) => {
    console.log(`[Axios] ⬇️ Status: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.message === 'Network Error') {
      console.error('[Axios Network Error] 🚨 Cannot connect to server! Ensure:');
      console.error('  1. Backend is running on port 5000.');
      console.error(`  2. Your phone and PC are on the SAME Wi-Fi network.`);
      console.error(`  3. BASE_URL (${BASE_URL}) matches your PC's IP.`);
    } else {
      console.error(`[Axios Response Error] Status: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;
