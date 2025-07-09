import axios from 'axios';

// Cấu hình base URL - thay đổi IP theo máy của bạn
const BASE_URL = 'http://192.168.1.29:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
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

// Response interceptor
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

// API functions
export const campaignAPI = {
  // Get all campaigns
  getAll: (params = {}) => {
    return api.get('/campaigns', { params });
  },

  // Get campaign by ID
  getById: id => {
    return api.get(`/campaigns/${id}`);
  },

  // Create new campaign
  create: data => {
    return api.post('/campaigns', data);
  },

  // Update campaign
  update: (id, data) => {
    return api.put(`/campaigns/${id}`, data);
  },
};

export const donationAPI = {
  // Create donation
  create: data => {
    return api.post('/donations', data);
  },

  // Get donations by campaign
  getByCampaign: (campaignId, params = {}) => {
    return api.get(`/donations/campaign/${campaignId}`, { params });
  },
};

export default api;
