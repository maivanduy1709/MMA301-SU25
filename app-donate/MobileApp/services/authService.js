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

export const verifyResetCode = async (email, code) => {
  const res = await axios.post(`${API_URL}/auth/verify-code`, {
    email,
    code,
  });
  return res.data;
};

export const resetPassword = async (email, newPassword) => {
  const res = await axios.post(`${API_URL}/auth/reset-password`, {
    email,
    newPassword,
  });
  return res.data;
};