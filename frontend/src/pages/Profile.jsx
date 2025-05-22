import React, { useEffect, useState } from 'react';
import { fetchProfile } from '../api';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProfile().then(setUser).catch(console.error);
  }, []);

  if (!user) return <div>Loading profile...</div>;

  return (
    <div>
      <h1>Profile</h1>
      <p><strong>UID:</strong> {user.uid}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Name:</strong> {user.name || '—'}</p>
    </div>
  );
}