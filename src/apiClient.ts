import axios from 'axios';

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'https://theo-api-production.up.railway.app') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      // Redirect to login using window.location to ensure app state is reset
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
