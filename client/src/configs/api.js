// src/configs/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL // Changed from BASE_URL
});

export default api;