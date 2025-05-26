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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { eventsAPI } from '../api';
import InviteDialog from '../components/InviteDialog';

const RSVP_OPTIONS = [
  { value: 'yes', label: 'Yes, I will attend', color: 'success', icon: CheckCircleIcon },
  { value: 'no', label: 'No, I cannot attend', color: 'error', icon: CancelIcon },
  { value: 'maybe', label: 'Maybe, not sure yet', color: 'warning', icon: HelpIcon },
];

export default function EventView() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // RSVP state
  const [userResponse, setUserResponse] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [rsvpComment, setRsvpComment] = useState('');
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventResponse, responsesResponse] = await Promise.all([
        eventsAPI.getEvent(eventId),
        eventsAPI.getResponses(eventId),
      ]);
      
      setEvent(eventResponse.data);
      setResponses(responsesResponse.data);
      
      // Find current user's response
      const currentUserResponse = responsesResponse.data.find(
        response => response.userId === eventResponse.data.currentUserId
      );
      
      if (currentUserResponse) {
        setUserResponse(currentUserResponse);
        setRsvpStatus(currentUserResponse.rsvpStatus || '');
        setRsvpComment(currentUserResponse.comment || '');
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load event data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvpSubmit = async () => {
    if (!rsvpStatus) {
      setError('Please select your RSVP status');
      return;
    }

    try {
      setSubmittingRsvp(true);
      await eventsAPI.submitResponse(eventId, {
        rsvpStatus,
        comment: rsvpComment,
      });
      
      setSuccessMessage('Your RSVP has been submitted successfully!');
      await loadEventData(); // Refresh to show updated response
    } catch (err) {
      setError('Failed to submit RSVP');
      console.error(err);
    } finally {
      setSubmittingRsvp(false);
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

  const getResponseSummary = () => {
    const summary = { yes: 0, no: 0, maybe: 0, pending: 0 };
    const totalInvited = event.invitees?.length || 0;
    
    responses.forEach(response => {
      const status = response.rsvpStatus || 'pending';
      if (summary[status] !== undefined) {
        summary[status]++;
      }
    });
    
    summary.pending = totalInvited - (summary.yes + summary.no + summary.maybe);
    return summary;
  };

  const getRsvpIcon = (status) => {
    const option = RSVP_OPTIONS.find(opt => opt.value === status);
    if (option) {
      const IconComponent = option.icon;
      return <IconComponent color={option.color} />;
    }
    return <HelpIcon color="disabled" />;
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

  const responseSummary = getResponseSummary();
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
                label={event.access}
                color={event.access === 'public' ? 'success' : 'warning'}
              />
            </Box>
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

        <Grid container spacing={3}>
          {/* RSVP Section (for invited users) */}
          {isInvited && !event.isOwner && (
            <Grid item xs={12}>
              <Paper 
                className="glass hover-lift"
                sx={{ 
                  p: 3, 
                  mb: 3,
                  border: '1px solid rgba(29, 185, 84, 0.2)',
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: 'primary.main'
                  }}
                >
                  Your RSVP
                </Typography>
                
                {userResponse ? (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      You have already responded to this event. You can update your response below.
                    </Alert>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please let us know if you can attend this event.
                  </Typography>
                )}

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Will you attend?</InputLabel>
                  <Select
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value)}
                    label="Will you attend?"
                  >
                    {RSVP_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getRsvpIcon(option.value)}
                          <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Comment (optional)"
                  value={rsvpComment}
                  onChange={(e) => setRsvpComment(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Add any comments or notes..."
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  onClick={handleRsvpSubmit}
                  disabled={submittingRsvp || !rsvpStatus}
                  sx={{ mr: 2 }}
                >
                  {submittingRsvp ? 'Submitting...' : userResponse ? 'Update RSVP' : 'Submit RSVP'}
                </Button>
              </Paper>
            </Grid>
          )}

          {/* Event Details */}
          <Grid item xs={12} md={event.isOwner ? 6 : 12}>
            <Paper 
              className="hover-lift"
              sx={{ 
                p: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.main'
                }}
              >
                Event Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Type:</strong> {event.type}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Timezone:</strong> {event.timezone}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Access:</strong> {event.access}
                </Typography>
                {event.end_date && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>End Date:</strong> {new Date(event.end_date).toLocaleString()}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Response Summary */}
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                Response Summary
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <Card 
                    variant="outlined"
                    className="hover-lift"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(29, 185, 84, 0.1) 0%, rgba(29, 185, 84, 0.05) 100%)',
                      border: '1px solid rgba(29, 185, 84, 0.3)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 1 }}>
                      <Typography variant="h4" color="success.main">
                        {responseSummary.yes}
                      </Typography>
                      <Typography variant="body2">Attending</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card 
                    variant="outlined"
                    className="hover-lift"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(226, 33, 52, 0.1) 0%, rgba(226, 33, 52, 0.05) 100%)',
                      border: '1px solid rgba(226, 33, 52, 0.3)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 1 }}>
                      <Typography variant="h4" color="error.main">
                        {responseSummary.no}
                      </Typography>
                      <Typography variant="body2">Not Attending</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card 
                    variant="outlined"
                    className="hover-lift"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255, 167, 38, 0.1) 0%, rgba(255, 167, 38, 0.05) 100%)',
                      border: '1px solid rgba(255, 167, 38, 0.3)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 1 }}>
                      <Typography variant="h4" color="warning.main">
                        {responseSummary.maybe}
                      </Typography>
                      <Typography variant="body2">Maybe</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card 
                    variant="outlined"
                    className="hover-lift"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(179, 179, 179, 0.1) 0%, rgba(179, 179, 179, 0.05) 100%)',
                      border: '1px solid rgba(179, 179, 179, 0.3)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 1 }}>
                      <Typography variant="h4" color="text.secondary">
                        {responseSummary.pending}
                      </Typography>
                      <Typography variant="body2">Pending</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Invitees List */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Invited People ({event.invitees?.length || 0})
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
            </Paper>
          </Grid>

          {/* Detailed Responses (for event owners) */}
          {event.isOwner && (
            <Grid item xs={12} md={6}>
              <Paper 
                className="hover-lift"
                sx={{ 
                  p: 3,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: 'primary.main'
                  }}
                >
                  Detailed Responses
                </Typography>
                
                {responses.length > 0 ? (
                  <List>
                    {responses.map((response, index) => (
                      <ListItem key={index} divider={index < responses.length - 1}>
                        <ListItemAvatar>
                          <Avatar>
                            {getRsvpIcon(response.rsvpStatus)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={response.userEmail || 'Unknown User'}
                          secondary={
                            <React.Fragment>
                              <Typography 
                                component="span"
                                variant="body2" 
                                color="text.primary"
                                sx={{ display: 'block', mb: 0.5 }}
                              >
                                Status: {RSVP_OPTIONS.find(opt => opt.value === response.rsvpStatus)?.label || 'No response'}
                              </Typography>
                              {response.comment && (
                                <Typography 
                                  component="span"
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ display: 'block', mb: 0.5 }}
                                >
                                  Comment: {response.comment}
                                </Typography>
                              )}
                              <Typography 
                                component="span"
                                variant="caption" 
                                color="text.secondary"
                                sx={{ display: 'block' }}
                              >
                                {response.updatedAt ? `Updated: ${new Date(response.updatedAt.seconds * 1000).toLocaleString()}` : 'No update time'}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No responses yet.
                  </Typography>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
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