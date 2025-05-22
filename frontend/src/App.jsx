import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/signup">Sign Up</Link> | <Link to="/login">Log In</Link> | <Link to="/events">Events</Link>
      </nav>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
        <Route path="/events/:id" element={<PrivateRoute><EventDetail /></PrivateRoute>} />
      </Routes>
    </div>
  );
}