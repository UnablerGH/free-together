import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('idToken');
  return token ? children : <Navigate to="/login" />;
}