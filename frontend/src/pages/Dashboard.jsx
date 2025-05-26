import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  Event as CalendarIcon,
} from '@mui/icons-material';
import { eventsAPI } from '../api';
import InviteDialog from '../components/InviteDialog';
import CalendarIntegration from '../components/CalendarIntegration';

export default function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [calendarEvent, setCalendarEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.listEvents();
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const filteredEvents = events.filter((event) => {
    if (tab === 0) return event.isOwner;
    return !event.isOwner;
  });

  const handleInviteClick = (event) => {
    setSelectedEvent(event);
    setInviteDialogOpen(true);
  };

  const handleInvite = async (emails) => {
    try {
      const response = await eventsAPI.inviteUsers(selectedEvent.eventId, { emails });
      setSuccessMessage(`Successfully invited ${emails.length} user${emails.length !== 1 ? 's' : ''} to ${selectedEvent.name}`);
      await loadEvents(); // Refresh events to show updated invitees
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to send invitations');
    }
  };

  const handleCloseSuccessMessage = () => {
    setSuccessMessage('');
  };

  const handleCalendarClick = (event) => {
    setCalendarEvent(event);
    setCalendarDialogOpen(true);
  };

  const getUserRsvpStatus = (event) => {
    // This would need to be enhanced to actually fetch user's response
    // For now, we'll show a placeholder
    return null; // 'yes', 'no', 'maybe', or null
  };

  const getRsvpChip = (status) => {
    if (!status) return null;
    
    const configs = {
      yes: { label: 'Attending', color: 'success', icon: CheckCircleIcon },
      no: { label: 'Not Attending', color: 'error', icon: CancelIcon },
      maybe: { label: 'Maybe', color: 'warning', icon: HelpIcon },
    };
    
    const config = configs[status];
    if (!config) return null;
    
    return (
      <Chip
        icon={<config.icon />}
        label={config.label}
        color={config.color}
        size="small"
        sx={{ mt: 1 }}
      />
    );
  };

  return (
    <Box className="fade-in">
      <Typography 
        variant="h3" 
        gutterBottom 
        sx={{ 
          fontWeight: 900,
          mb: 4,
          background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        My Events
      </Typography>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Created Events" />
        <Tab label="Invited Events" />
      </Tabs>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <Grid container spacing={3}>
        {filteredEvents.map((event, index) => (
          <Grid item xs={12} sm={6} md={4} key={event.eventId}>
            <Card 
              className="hover-lift"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {event.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Type: {event.type}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Timezone: {event.timezone}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {event.isOwner 
                    ? `Invitees: ${event.invitees?.length || 0}` 
                    : `Owner: ${event.ownerName || event.ownerEmail || 'Unknown'}`
                  }
                </Typography>
                {!event.isOwner && (
                  <Typography color="textSecondary" variant="body2" gutterBottom>
                    Invited people: {event.invitees?.length || 0}
                  </Typography>
                )}
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={event.status || 'collecting'}
                    color={
                      event.status === 'scheduled' ? 'success' :
                      event.status === 'closed' ? 'warning' :
                      'info'
                    }
                    size="small"
                  />
                  <Chip
                    label={event.type}
                    color="primary"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                  {!event.isOwner && getRsvpChip(getUserRsvpStatus(event))}
                </Box>
                
                {/* Show scheduled date/time if available */}
                {event.status === 'scheduled' && event.scheduledDate && event.scheduledTime && (
                  <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 600 }}>
                    📅 {new Date(`${event.scheduledDate}T${event.scheduledTime}`).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/events/${event.eventId}`)}
                >
                  View Details
                </Button>
                {event.isOwner && event.status !== 'scheduled' && (
                  <Button
                    size="small"
                    color="secondary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleInviteClick(event)}
                  >
                    Invite
                  </Button>
                )}
                {event.status === 'scheduled' && event.scheduledDate && event.scheduledTime && (
                  <Button
                    size="small"
                    color="success"
                    startIcon={<CalendarIcon />}
                    onClick={() => handleCalendarClick(event)}
                  >
                    Add to Calendar
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Invite Dialog */}
      <InviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onInvite={handleInvite}
        eventName={selectedEvent?.name || ''}
      />

      {/* Calendar Integration Dialog */}
      {calendarEvent && (
        <CalendarIntegration
          event={calendarEvent}
          open={calendarDialogOpen}
          onClose={() => setCalendarDialogOpen(false)}
        />
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccessMessage}
        message={successMessage}
      />
    </Box>
  );
} 