import axios from 'axios';
import { API_URL } from '../constants/api';

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
};

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const res = await axios.post(`${API_URL}/auth/register`, {
    name,
    email,
    password,
  });
  return res.data;
};
