import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
};

// Fisherfolk
export const fisherfolkAPI = {
  getAll: (params) => api.get('/fisherfolk', { params }),
  getById: (id) => api.get(`/fisherfolk/${id}`),
  create: (data) => api.post('/fisherfolk', data),
  update: (id, data) => api.put(`/fisherfolk/${id}`, data),
  delete: (id) => api.delete(`/fisherfolk/${id}`),
};

// Organization
export const organizationAPI = {
  getAll: (params) => api.get('/organization', { params }),
  getById: (id) => api.get(`/organization/${id}`),
  create: (data) => api.post('/organization', data),
  update: (id, data) => api.put(`/organization/${id}`, data),
  delete: (id) => api.delete(`/organization/${id}`),
};

export default api;
