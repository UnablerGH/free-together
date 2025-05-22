const API_URL = import.meta.env.VITE_API_URL;

export async function signup({ email, password, username }) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username })
  });
  return res.json();
}

export async function login({ email, password }) {
  // Call Firebase Auth emulator REST
  const resp = await fetch(`http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  return resp.json();
}

function authFetch(path, opts = {}) {
  const token = localStorage.getItem('idToken');
  return fetch(`${API_URL}${path}`, {
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    ...opts
  });
}

export async function fetchProfile() {
  const res = await authFetch('/users/me');
  return res.json();
}

export async function fetchEvents() {
  const res = await authFetch('/events');
  return res.json();
}

export async function fetchEvent(id) {
  const res = await authFetch(`/events/${id}`);
  return res.json();
}

export async function createResponse(eventId, data) {
  const res = await authFetch(`/events/${eventId}/responses`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
}