import axios from 'axios';
import { toast } from 'react-hot-toast';

const axiosClient = axios.create();

axiosClient.interceptors.request.use(async (config: any) => {
  config.headers = {
    'Content-type': 'application/json',
    ...config.headers,
  };

  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.data;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response.status === 200 || (response.status === 201 && response.data)) {
      return response;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is expired, redirect to login page
      console.log('Token is expired, redirect to login page');
      document.cookie =
        'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.replace('/login');
      localStorage.removeItem('token');
    } else {
      console.log(`Error connecting to database, ${error.message}`);
      throw error;
    }
    // return Promise.reject(error);
  }
);

export default axiosClient;
