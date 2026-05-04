import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const ticketAPI = {
  createTicket: (data) => api.post('/tickets', data),
  getMyTickets: () => api.get('/tickets/my'),
  getAssignedTickets: () => api.get('/tickets/assigned'),
  getAllTickets: () => api.get('/tickets'),
  getTicket: (id) => api.get(`/tickets/${id}`),
  updateTicket: (id, data) => api.put(`/tickets/${id}`, data),
  assignTicket: (id, assignedTo) => api.post(`/tickets/${id}/assign`, { assignedTo }),
  resolveTicket: (id) => api.post(`/tickets/${id}/resolve`),
  closeTicket: (id) => api.post(`/tickets/${id}/close`),
  addComment: (id, content) => api.post(`/tickets/${id}/comments`, { content }),
  getComments: (id) => api.get(`/tickets/${id}/comments`),
  rateTicket: (id, rating, feedback) => api.post(`/tickets/${id}/rate`, { rating, feedback }),
  searchTickets: (q) => api.get(`/tickets/search?q=${encodeURIComponent(q)}`),
  filterByStatus: (status) => api.get(`/tickets/filter/status?status=${status}`),
  filterByPriority: (priority) => api.get(`/tickets/filter/priority?priority=${priority}`),
};

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deactivateUser: (id) => api.post(`/admin/users/${id}/deactivate`),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
  getSupportAgents: () => api.get('/admin/agents'),
  getAllTickets: () => api.get('/admin/tickets'),
  forceResolve: (id) => api.post(`/admin/tickets/${id}/force-resolve`),
  forceClose: (id) => api.post(`/admin/tickets/${id}/force-close`),
  adminAssign: (id, assignedTo) => api.post(`/admin/tickets/${id}/assign`, { assignedTo }),
};

export default api;
