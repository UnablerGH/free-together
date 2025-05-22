import React, { useEffect, useState } from 'react';
import { fetchEvents } from '../api';
import { Link } from 'react-router-dom';

export default function Events() {
  const [events, setEvents] = useState([]);
  useEffect(() => { fetchEvents().then(setEvents); }, []);

  return (
    <div>
      <h1>Your Events</h1>
      <ul>
        {events.map(e => (
          <li key={e.eventId}>
            <Link to={`/events/${e.eventId}`}>{e.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}