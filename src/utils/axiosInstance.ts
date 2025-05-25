// src/utils/axiosInstance.ts
import axios from 'axios';
import { getToken } from './authUtils'; // Asumsi getToken ada di authUtils

const API_URL = "http://localhost:8080"; // Sesuaikan jika berbeda

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Menambahkan interceptor untuk menyertakan token di setiap request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken(); // Ambil token dari localStorage atau di mana pun Anda menyimpannya
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;