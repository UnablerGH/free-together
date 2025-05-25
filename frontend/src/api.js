import axios from 'axios';
import { auth } from './firebase';

const API_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const eventsAPI = {
  createEvent: (data) => api.post('/events', data),
  listEvents: () => api.get('/events'),
  getEvent: (eventId) => api.get(`/events/${eventId}`),
  submitResponse: (eventId, data) => api.post(`/events/${eventId}/responses`, data),
  getResponses: (eventId) => api.get(`/events/${eventId}/responses`),
};

export default api;