import React, { useEffect, useState } from 'react';
import { fetchEvents, createEvent, deleteEvent } from '../api';
import { Link } from 'react-router-dom';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    type: 'once',
    timezone: 'Europe/Warsaw',
    access: 'public',
  });

  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const ev = await createEvent(form);
    setEvents([...events, { ...form, eventId: ev.eventId, isOwner: true }]);
  }

  async function handleDelete(id) {
    await deleteEvent(id);
    setEvents(events.filter(e => e.eventId !== id));
  }

  // split into two lists
  const myEvents     = events.filter(e => e.isOwner);
  const invitedEvents = events.filter(e => !e.isOwner);

  return (
    <div>
      <h1>My Events</h1>
      <ul>
        {myEvents.map(e => (
          <li key={e.eventId}>
            <Link to={`/events/${e.eventId}`}>{e.name}</Link>{' '}
            <button onClick={() => handleDelete(e.eventId)}>Delete</button>
          </li>
        ))}
      </ul>

      <h1>Invited Events</h1>
      {invitedEvents.length === 0
        ? <p>No invites.</p>
        : <ul>
            {invitedEvents.map(e => (
              <li key={e.eventId}>
                <Link to={`/events/${e.eventId}`}>{e.name}</Link>
              </li>
            ))}
          </ul>
      }

      <h2>Create New Event</h2>
      <form onSubmit={handleCreate} style={{ marginTop: 20 }}>
        <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} required />
        <select onChange={e => setForm({...form, type: e.target.value})}>
          <option value="once">Once</option>
          <option value="weekly">Weekly</option>
        </select>
        <input placeholder="Timezone" onChange={e => setForm({...form, timezone: e.target.value})} />
        <select onChange={e => setForm({...form, access: e.target.value})}>
          <option>public</option>
          <option>restricted</option>
        </select>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
