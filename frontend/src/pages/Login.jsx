import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await login(form);
    localStorage.setItem('idToken', data.idToken);
    nav('/events');
  }

  return (
    <form onSubmit={handleSubmit}>   
      <h1>Log In</h1>
      <input placeholder="Email" onChange={e => setForm({...form,email:e.target.value})} />
      <input type="password" placeholder="Password" onChange={e => setForm({...form,password:e.target.value})} />
      <button type="submit">Log In</button>
    </form>
  );
}