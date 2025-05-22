const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || res.statusText);
    return data;
}

export async function signup(body) {
    return handleResponse(
        await fetch(`${API_URL}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    );
}

export async function login({ email, password }) {
    const resp = await fetch(
        `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) }
    );
    return resp.json();
}

function authFetch(path, opts = {}) {
    const token = localStorage.getItem('idToken');
    return fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, ...opts });
}

export async function fetchProfile() { return handleResponse(await authFetch('/users/me')); }
export async function fetchEvents() { return handleResponse(await authFetch('/events')); }
export async function createEvent(body) {
    return handleResponse(
        await authFetch('/events', { method: 'POST', body: JSON.stringify(body) })
    );
}
export async function deleteEvent(id) {
    await authFetch(`/events/${id}`, { method: 'DELETE' });
    return { success: true };
}
export async function fetchEvent(id) { return handleResponse(await authFetch(`/events/${id}`)); }
export async function createResponse(eventId, data) {
    return handleResponse(
        await authFetch(`/events/${eventId}/responses`, { method: 'POST', body: JSON.stringify(data) })
    );
}
export async function fetchResponses(eventId) {
    return handleResponse(
        await authFetch(`/events/${eventId}/responses`)
    );
}