import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
  Chip,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { eventsAPI } from '../api';
import InviteDialog from '../components/InviteDialog';
import TimeSlotSelector from '../components/TimeSlotSelector';
import AvailabilityHeatmap from '../components/AvailabilityHeatmap';

export default function EventView() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Time slot selection state
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [submittingSlots, setSubmittingSlots] = useState(false);
  const [userResponse, setUserResponse] = useState(null);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventResponse, responsesResponse, heatmapResponse] = await Promise.all([
        eventsAPI.getEvent(eventId),
        eventsAPI.getResponses(eventId),
        eventsAPI.getHeatmapData(eventId).catch(() => ({ data: null })), // Don't fail if heatmap fails
      ]);
      
      setEvent(eventResponse.data);
      setResponses(responsesResponse.data);
      setHeatmapData(heatmapResponse.data);
      
      // Find current user's response
      const currentUserResponse = responsesResponse.data.find(
        response => response.userId === eventResponse.data.currentUserId
      );
      
      if (currentUserResponse) {
        setUserResponse(currentUserResponse);
        setSelectedSlots(currentUserResponse.timeSlots || []);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load event data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotsSubmit = async () => {
    if (selectedSlots.length === 0) {
      setError('Please select at least one time slot');
      return;
    }

    try {
      setSubmittingSlots(true);
      await eventsAPI.submitResponse(eventId, {
        timeSlots: selectedSlots,
      });
      
      setSuccessMessage('Your availability has been submitted successfully!');
      await loadEventData(); // Refresh to show updated response
    } catch (err) {
      setError('Failed to submit availability');
      console.error(err);
    } finally {
      setSubmittingSlots(false);
    }
  };

  const handleInvite = async (emails) => {
    try {
      const response = await eventsAPI.inviteUsers(eventId, { emails });
      setSuccessMessage(`Successfully invited ${emails.length} user${emails.length !== 1 ? 's' : ''}`);
      await loadEventData(); // Refresh event data to show updated invitees
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to send invitations');
    }
  };

  const handleCloseSuccessMessage = () => {
    setSuccessMessage('');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Loading event details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Event not found
        </Alert>
      </Container>
    );
  }

  const isInvited = event.invitees?.includes(event.currentUserEmail) || event.isOwner;

  return (
    <Container maxWidth="lg" className="fade-in">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography 
              variant="h3" 
              gutterBottom
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {event.name}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={event.type}
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip
                label={event.timezone}
                color="secondary"
                sx={{ mr: 1 }}
              />
            </Box>
            <Typography variant="body1" color="text.secondary">
              When2Meet-style scheduling - select your available time slots
            </Typography>
            
            {/* Show event owner for invited users */}
            {!event.isOwner && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Event Owner:</strong> {event.ownerEmail || 'Unknown'}
                </Typography>
              </Box>
            )}
          </Box>
          {event.isOwner && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setInviteDialogOpen(true)}
              sx={{ ml: 2 }}
            >
              Invite People
            </Button>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper elevation={0} className="glass" sx={{ mb: 3, border: '1px solid rgba(29, 185, 84, 0.2)' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {isInvited && !event.isOwner && (
              <Tab 
                icon={<ScheduleIcon />} 
                label="Select Availability" 
                iconPosition="start"
              />
            )}
            <Tab 
              icon={<BarChartIcon />} 
              label="View Results" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {/* Availability Selection Tab (for invited users) */}
        {isInvited && !event.isOwner && activeTab === 0 && (
          <Box>
            {userResponse && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You have already submitted your availability. You can update it below.
              </Alert>
            )}
            
            <TimeSlotSelector
              selectedSlots={selectedSlots}
              onSlotsChange={setSelectedSlots}
              disabled={submittingSlots}
            />
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSlotsSubmit}
                disabled={submittingSlots || selectedSlots.length === 0}
                size="large"
              >
                {submittingSlots ? 'Submitting...' : userResponse ? 'Update Availability' : 'Submit Availability'}
              </Button>
              
              {selectedSlots.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => setSelectedSlots([])}
                  disabled={submittingSlots}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Results/Heatmap Tab */}
        {((isInvited && !event.isOwner && activeTab === 1) || (event.isOwner && activeTab === 0) || (!isInvited)) && (
          <Box>
            {heatmapData ? (
              <AvailabilityHeatmap
                heatmapData={heatmapData.heatmapGrid}
                userResponses={heatmapData.userResponses}
                maxCount={heatmapData.maxCount}
              />
            ) : (
              <Paper elevation={0} className="glass" sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(29, 185, 84, 0.2)' }}>
                <Typography variant="h6" color="text.secondary">
                  No availability data yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Invite people and ask them to submit their availability to see the heatmap.
                </Typography>
              </Paper>
            )}

            {/* Event Info */}
            <Paper elevation={0} className="glass" sx={{ p: 3, mt: 3, border: '1px solid rgba(29, 185, 84, 0.2)' }}>
              <Typography variant="h6" gutterBottom>
                Event Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Type:</strong> {event.type}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Timezone:</strong> {event.timezone}
                  </Typography>
                  {!event.isOwner && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Event Owner:</strong> {event.ownerEmail || 'Unknown'}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Total Invited:</strong> {event.invitees?.length || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Responses:</strong> {responses.filter(r => r.timeSlots?.length > 0).length}
                  </Typography>
                </Grid>
              </Grid>

              {/* Invitees List - Show for everyone */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Invited People ({event.invitees?.length || 0}):
                </Typography>
                {event.invitees && event.invitees.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {event.invitees.map((email, index) => (
                      <Chip
                        key={index}
                        label={email}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No one has been invited yet.
                  </Typography>
                )}
              </Box>

              {/* Show who has responded */}
              {responses.filter(r => r.timeSlots?.length > 0).length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    People who have responded:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {responses
                      .filter(r => r.timeSlots?.length > 0)
                      .map((response, index) => (
                        <Chip
                          key={index}
                          label={`${response.userName || response.userEmail || 'Unknown'} (${response.timeSlots?.length || 0} slots)`}
                          variant="filled"
                          size="small"
                          color="success"
                          sx={{ 
                            backgroundColor: 'rgba(29, 185, 84, 0.1)',
                            color: 'primary.main',
                            border: '1px solid rgba(29, 185, 84, 0.3)'
                          }}
                        />
                      ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Invite Dialog */}
      <InviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        onInvite={handleInvite}
        eventName={event.name}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccessMessage}
        message={successMessage}
      />
    </Container>
  );
} 