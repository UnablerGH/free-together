// src/pages/Login.jsx
import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await login(form);
      if (!data.idToken) {
        throw new Error(data.error?.message || 'Login failed');
      }
      localStorage.setItem('idToken', data.idToken);
      navigate('/events');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Log In</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input
        type="email"
        placeholder="Email"
        required
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        required
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">Log In</button>
    </form>
  );
}
