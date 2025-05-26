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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Replay as ReplayIcon,
  Event as CalendarIcon,
} from '@mui/icons-material';
import { eventsAPI } from '../api';
import InviteDialog from '../components/InviteDialog';
import TimeSlotSelector from '../components/TimeSlotSelector';
import AvailabilityHeatmap from '../components/AvailabilityHeatmap';
import CalendarIntegration from '../components/CalendarIntegration';

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
  const [maybeSlots, setMaybeSlots] = useState([]);
  const [submittingSlots, setSubmittingSlots] = useState(false);
  const [userResponse, setUserResponse] = useState(null);
  
  // Scheduling state
  const [schedulingEvent, setSchedulingEvent] = useState(false);
  const [closingEvent, setClosingEvent] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Calendar integration state
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);

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
        setMaybeSlots(currentUserResponse.maybeSlots || []);
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
    if (selectedSlots.length === 0 && maybeSlots.length === 0) {
      setError('Please select at least one time slot');
      return;
    }

    try {
      setSubmittingSlots(true);
      await eventsAPI.submitResponse(eventId, {
        timeSlots: selectedSlots,
        maybeSlots: maybeSlots,
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

  const handleScheduleEvent = async () => {
    if (!scheduleDate || !scheduleTime) {
      setError('Please provide both date and time for the event');
      return;
    }

    try {
      setSchedulingEvent(true);
      await eventsAPI.scheduleEvent(eventId, {
        scheduledDate: scheduleDate,
        scheduledTime: scheduleTime,
      });
      setSuccessMessage('Event scheduled successfully!');
      await loadEventData();
    } catch (err) {
      setError('Failed to schedule event');
      console.error(err);
    } finally {
      setSchedulingEvent(false);
    }
  };

  const handleCloseEvent = async () => {
    try {
      setClosingEvent(true);
      await eventsAPI.closeEvent(eventId);
      setSuccessMessage('Event closed - no more responses will be accepted');
      await loadEventData();
    } catch (err) {
      setError('Failed to close event');
      console.error(err);
    } finally {
      setClosingEvent(false);
    }
  };

  const handleReopenEvent = async () => {
    try {
      await eventsAPI.reopenEvent(eventId);
      setSuccessMessage('Event reopened for availability collection');
      await loadEventData();
    } catch (err) {
      setError('Failed to reopen event');
      console.error(err);
    }
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
              <Chip
                label={event.status || 'collecting'}
                color={
                  event.status === 'scheduled' ? 'success' :
                  event.status === 'closed' ? 'warning' :
                  'info'
                }
                sx={{ mr: 1 }}
              />
              {event.status === 'scheduled' && event.scheduledDate && (
                <Chip
                  label={`Scheduled: ${event.scheduledDate} at ${event.scheduledTime}`}
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
            
            {/* Add to Calendar button for scheduled events */}
            {event.status === 'scheduled' && event.scheduledDate && event.scheduledTime && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CalendarIcon />}
                  onClick={() => setCalendarDialogOpen(true)}
                  sx={{
                    backgroundColor: 'success.main',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'success.dark',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Add to Calendar
                                 </Button>
               </Box>
             )}
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
            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteDialogOpen(true)}
                disabled={event.status === 'scheduled'}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: 4,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    backgroundColor: 'action.disabled',
                    color: 'action.disabled',
                  }
                }}
              >
                Invite People
              </Button>
              
              {event.status === 'collecting' && (
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={handleCloseEvent}
                  disabled={closingEvent}
                  color="warning"
                  sx={{
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                      boxShadow: 2,
                    }
                  }}
                >
                  {closingEvent ? 'Closing...' : 'Close Pool'}
                </Button>
              )}
              
              {(event.status === 'closed' || event.status === 'collecting') && (
                <Button
                  variant="outlined"
                  startIcon={<CheckIcon />}
                  onClick={() => setSchedulingEvent(true)}
                  color="success"
                  sx={{
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                      boxShadow: 2,
                    }
                  }}
                >
                  Schedule Event
                </Button>
              )}
              
              {event.status === 'scheduled' && (
                <Button
                  variant="outlined"
                  startIcon={<ReplayIcon />}
                  onClick={handleReopenEvent}
                  color="info"
                  sx={{
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                      boxShadow: 2,
                    }
                  }}
                >
                  Reopen Pool
                </Button>
              )}
            </Box>
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
            {event.status === 'scheduled' && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                This event has been scheduled and no longer accepts availability changes.
              </Alert>
            )}
            
            {event.status === 'closed' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Availability collection has been closed by the event owner.
              </Alert>
            )}
            
            {userResponse && event.status === 'collecting' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You have already submitted your availability. You can update it below.
              </Alert>
            )}
            
            <TimeSlotSelector
              selectedSlots={selectedSlots}
              maybeSlots={maybeSlots}
              onSlotsChange={setSelectedSlots}
              onMaybeSlotsChange={setMaybeSlots}
              disabled={submittingSlots || event.status !== 'collecting'}
              startDate={event.startDate}
              endDate={event.endDate}
            />
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSlotsSubmit}
                disabled={
                  submittingSlots || 
                  (selectedSlots.length === 0 && maybeSlots.length === 0) ||
                  event.status !== 'collecting'
                }
                size="large"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: 4,
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    backgroundColor: 'action.disabled',
                    color: 'text.disabled',
                  }
                }}
              >
                {submittingSlots ? 'Submitting...' : userResponse ? 'Update Availability' : 'Submit Availability'}
              </Button>
              
              {(selectedSlots.length > 0 || maybeSlots.length > 0) && event.status === 'collecting' && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedSlots([]);
                    setMaybeSlots([]);
                  }}
                  disabled={submittingSlots}
                  sx={{
                    fontWeight: 600,
                    borderWidth: 2,
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                      boxShadow: 2,
                    }
                  }}
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
              <Box>
                <AvailabilityHeatmap
                  heatmapData={heatmapData}
                  userResponses={heatmapData.userResponses}
                  startDate={event.startDate}
                  endDate={event.endDate}
                />
              </Box>
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
                  {event.startDate && event.endDate && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Date Range:</strong> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </Typography>
                  )}
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

      {/* Schedule Event Dialog */}
      <Dialog open={schedulingEvent} onClose={() => setSchedulingEvent(false)}>
        <DialogTitle>Schedule Event</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set a specific date and time for this event. This will close availability collection.
          </Typography>
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            variant="outlined"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Time"
            type="time"
            fullWidth
            variant="outlined"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchedulingEvent(false)}>Cancel</Button>
          <Button onClick={handleScheduleEvent} variant="contained" color="success">
            Schedule Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calendar Integration Dialog */}
      {event && (
        <CalendarIntegration
          event={event}
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
    </Container>
  );
} 