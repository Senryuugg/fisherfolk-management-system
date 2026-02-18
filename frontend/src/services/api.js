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

// Boats
export const boatsAPI = {
  getAll: (params) => api.get('/boats', { params }),
  getById: (id) => api.get(`/boats/${id}`),
  create: (data) => api.post('/boats', data),
  update: (id, data) => api.put(`/boats/${id}`, data),
  delete: (id) => api.delete(`/boats/${id}`),
};

// Gears
export const gearsAPI = {
  getAll: (params) => api.get('/gears', { params }),
  getById: (id) => api.get(`/gears/${id}`),
  create: (data) => api.post('/gears', data),
  update: (id, data) => api.put(`/gears/${id}`, data),
  delete: (id) => api.delete(`/gears/${id}`),
};

// Committees
export const committeesAPI = {
  getAll: (params) => api.get('/committees', { params }),
  getById: (id) => api.get(`/committees/${id}`),
  create: (data) => api.post('/committees', data),
  update: (id, data) => api.put(`/committees/${id}`, data),
  delete: (id) => api.delete(`/committees/${id}`),
};

// Officers
export const officersAPI = {
  getAll: (params) => api.get('/officers', { params }),
  getById: (id) => api.get(`/officers/${id}`),
  create: (data) => api.post('/officers', data),
  update: (id, data) => api.put(`/officers/${id}`, data),
  delete: (id) => api.delete(`/officers/${id}`),
};

// Ordinances & Resolutions
export const ordinancesAPI = {
  getAll: (params) => api.get('/ordinances', { params }),
  getById: (id) => api.get(`/ordinances/${id}`),
  create: (data) => api.post('/ordinances', data),
  update: (id, data) => api.put(`/ordinances/${id}`, data),
  delete: (id) => api.delete(`/ordinances/${id}`),
};

// FAQs
export const faqsAPI = {
  getAll: (params) => api.get('/faqs', { params }),
  getById: (id) => api.get(`/faqs/${id}`),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  markHelpful: (id) => api.post(`/faqs/${id}/helpful`),
  markNotHelpful: (id) => api.post(`/faqs/${id}/not-helpful`),
  delete: (id) => api.delete(`/faqs/${id}`),
};

// Help Desk Tickets
export const ticketsAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  resolve: (id, data) => api.post(`/tickets/${id}/resolve`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
};

// Development Levels
export const developmentLevelsAPI = {
  getAll: (params) => api.get('/development-levels', { params }),
  getById: (id) => api.get(`/development-levels/${id}`),
  create: (data) => api.post('/development-levels', data),
  update: (id, data) => api.put(`/development-levels/${id}`, data),
  delete: (id) => api.delete(`/development-levels/${id}`),
};

// Maps
export const mapsAPI = {
  getAll: (params) => api.get('/maps', { params }),
  getById: (id) => api.get(`/maps/${id}`),
  create: (data) => api.post('/maps', data),
  update: (id, data) => api.put(`/maps/${id}`, data),
  calculateBuffer: (data) => api.post('/maps/buffer/calculate', data),
  toggleVisibility: (id) => api.post(`/maps/${id}/toggle-visibility`),
  delete: (id) => api.delete(`/maps/${id}`),
};

// Reports
export const reportsAPI = {
  getAgeBreakdown: (params) => api.get('/reports/age-breakdown', { params }),
  getGenderBreakdown: (params) => api.get('/reports/gender-breakdown', { params }),
  getIncomeReport: (params) => api.get('/reports/income', { params }),
  getFisherfolkStats: (params) => api.get('/reports/fisherfolk-stats', { params }),
  getBoatsAndGearsStats: (params) => api.get('/reports/boats-gears-stats', { params }),
  getDashboardStats: () => api.get('/reports/dashboard-stats'),
  exportCSV: (reportType, params) => api.get(`/reports/${reportType}/export`, { params, responseType: 'blob' }),
};

export default api;
