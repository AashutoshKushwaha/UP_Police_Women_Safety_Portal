import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://localhost:5000/api';

let token = localStorage.getItem('token');

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(config => {
  token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
