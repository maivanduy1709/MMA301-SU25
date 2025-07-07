import axios from 'axios';

const API_URL = 'http://10.0.2.2:3001/api/supported-people'; // dùng IP phù hợp với emulator

export const getPeople = async () => (await axios.get(API_URL)).data;

export const createPerson = async (data) => (await axios.post(API_URL, data)).data;

export const updatePerson = async (id, data) => (await axios.put(`${API_URL}/${id}`, data)).data;

export const deletePerson = async (id) => (await axios.delete(`${API_URL}/${id}`)).data;
