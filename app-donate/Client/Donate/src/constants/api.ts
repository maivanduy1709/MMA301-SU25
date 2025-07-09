import axios from 'axios';
import { Platform } from 'react-native';

// ✅ Tự động chọn baseURL phù hợp theo thiết bị
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001/api' // Android Emulator
    : 'http://192.168.1.29:3001/api'; // IP thật của máy bạn (thay nếu cần)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👉 Log API request
api.interceptors.request.use(
  config => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  },
);

// 👉 Log API response
api.interceptors.response.use(
  response => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  },
);

// 🎯 Các hàm gọi API
export const campaignAPI = {
  getAll: (params = {}) => api.get('/campaigns', { params }),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  create: (data: any) => api.post('/campaigns', data),
  update: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
};

export const donationAPI = {
  create: (data: any) => api.post('/donations', data),
  getByCampaign: (campaignId: string, params = {}) =>
    api.get(`/donations/campaign/${campaignId}`, { params }),
};

export default api;
