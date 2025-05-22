import React, { useEffect, useState } from 'react';
import { fetchEvent, createResponse } from '../api';
import { useParams } from 'react-router-dom';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [availability, setAvailability] = useState({});

  useEffect(() => { fetchEvent(id).then(setEvent); }, [id]);

  if (!event) return <div>Loading...</div>;
  
  function handleRSVP() {
    // simplistic: mark all slots as "1"
    createResponse(id, { availability: { slot1: 1 } });
  }

  return (
    <div>
      <h1>{event.name}</h1>
      <button onClick={handleRSVP}>RSVP Yes for slot1</button>
    </div>
  );
}
