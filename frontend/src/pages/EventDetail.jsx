import React, { useEffect, useState } from 'react';
import { fetchEvent, createResponse, deleteEvent, inviteUser } from '../api';
import { useParams, useNavigate } from 'react-router-dom';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => {
    fetchEvent(id)
      .then(setEvent)
      .catch(console.error);
  }, [id]);

  if (!event) return <div>Loading...</div>;

  const ownerBadge = event.isOwner ? (
    <span style={{ color: 'green' }}>You are the owner</span>
  ) : (
    <span style={{ color: 'blue' }}>You were invited</span>
  );

  async function handleDelete() {
    await deleteEvent(id);
    navigate('/events');
  }

  async function handleRSVP() {
    await createResponse(id, { availability: { slot1: 1 } });
    alert('RSVP sent');
  }

  async function handleInvite() {
    setInviteMsg('');
    try {
      await inviteUser(id, inviteEmail);
      setInviteMsg('Invitation sent!');
      setInviteEmail('');
    } catch (err) {
      setInviteMsg(err.message);
    }
  }

  return (
    <div>
      <h1>{event.name}</h1>
      {ownerBadge}
      <div style={{ marginTop: 10 }}>
        <button onClick={handleRSVP}>RSVP Yes for slot1</button>
        {event.isOwner && (
          <button onClick={handleDelete} style={{ marginLeft: 10 }}>
            Delete Event
          </button>
        )}
      </div>

      {event.isOwner && (
        <div style={{ marginTop: 20 }}>
          <h3>Invite someone</h3>
          <input
            type="email"
            placeholder="Their email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
          />
          <button onClick={handleInvite} style={{ marginLeft: 10 }}>
            Send Invite
          </button>
          {inviteMsg && (
            <div style={{ color: inviteMsg.includes('sent') ? 'green' : 'red' }}>
              {inviteMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}