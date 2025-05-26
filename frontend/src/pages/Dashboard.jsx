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
} from '@mui/icons-material';
import { eventsAPI } from '../api';
import InviteDialog from '../components/InviteDialog';

export default function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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
                  {event.isOwner ? `Invitees: ${event.invitees?.length || 0}` : 'You are invited'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={event.closed ? 'Closed' : 'Open'}
                    color={event.closed ? 'error' : 'success'}
                    size="small"
                  />
                  <Chip
                    label={event.access}
                    color={event.access === 'public' ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                  {!event.isOwner && getRsvpChip(getUserRsvpStatus(event))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/events/${event.eventId}`)}
                >
                  View Details
                </Button>
                {event.isOwner && (
                  <Button
                    size="small"
                    color="secondary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleInviteClick(event)}
                  >
                    Invite
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