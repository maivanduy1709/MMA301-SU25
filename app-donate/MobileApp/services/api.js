const API_URL = 'http://10.0.2.2:3001/api/supported-people';

export const getSupportedPeople = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const getPersonById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
};

export const addPerson = async (data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updatePerson = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deletePerson = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};
