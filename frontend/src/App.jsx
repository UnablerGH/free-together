import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('idToken');
    navigate('/login');
  }

  return (
    <div>
      <nav>
        <Link to="/signup">Sign Up</Link> |{' '}
        <Link to="/login">Log In</Link> |{' '}
        <Link to="/events">Events</Link> |{' '}
        <Link to="/profile">Profile</Link> |{' '}
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
        <Route path="/events/:id" element={<PrivateRoute><EventDetail /></PrivateRoute>} />
      </Routes>
    </div>
  );
}