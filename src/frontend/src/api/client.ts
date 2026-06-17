import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost';

export const api = axios.create({
  baseURL: isLocalhost 
    ? 'http://localhost:3000' 
    : 'https://cortx-backend.onrender.com',

  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});