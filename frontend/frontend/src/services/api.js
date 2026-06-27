import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    return res.data;
  },
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
};

export const propertiesAPI = {
  getAll: (params) => api.get('/properties/', { params }),
  getMine: () => api.get('/properties/mine/'),
  getById: (id) => api.get(`/properties/${id}/`),
  create: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    return api.post('/properties/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => api.patch(`/properties/${id}/`, data),
  delete: (id) => api.delete(`/properties/${id}/`),
  uploadImage: (propertyId, image, isCover = false) => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('is_cover', isCover);
    formData.append('property', propertyId);
    return api.post('/properties/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const bookingsAPI = {
  getAll: () => api.get('/bookings/'),
  create: (data) => api.post('/bookings/', data),
  update: (id, data) => api.patch(`/bookings/${id}/`, data),
  delete: (id) => api.delete(`/bookings/${id}/`),
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations/'),
  getConversation: (id) => api.get(`/chat/conversations/${id}/`),
  createConversation: (data) => api.post('/chat/conversations/', data),
  getMessages: (conversationId) =>
    api.get(`/chat/conversations/${conversationId}/messages/`),
  sendMessage: (conversationId, content) =>
    api.post(`/chat/conversations/${conversationId}/messages/`, { content }),
};

export default api;
