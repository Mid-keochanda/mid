import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://172.18.9.181:5000/api',
});

// ແນບ Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient; 