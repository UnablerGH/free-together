import axios from 'axios';
import { auth } from './firebase';

const API_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all status codes less than 500
  }
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(true); // Force refresh the token
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
  }
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Profile API functions
export const fetchProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const eventsAPI = {
  createEvent: (data) => api.post('/events', data),
  listEvents: () => api.get('/events'),
  getEvent: (eventId) => api.get(`/events/${eventId}`),
  submitResponse: (eventId, data) => api.post(`/events/${eventId}/responses`, data),
  getResponses: (eventId) => api.get(`/events/${eventId}/responses`),
  inviteUsers: (eventId, data) => api.post(`/events/${eventId}/invite`, data),
};

export default api;