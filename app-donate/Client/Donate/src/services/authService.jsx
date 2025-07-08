import axios from 'axios';
import { API_URL } from '../constants/api';

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
};

export const register = async (name, email, password) => {
  const res = await axios.post(`${API_URL}/auth/register`, {
    name,
    email,
    password,
  });
  return res.data;
};

export const forgotPassword = async email => {
  const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return res.data;
};
