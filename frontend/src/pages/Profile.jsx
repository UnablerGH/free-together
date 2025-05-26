import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccountCircle,
  Event as EventIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { fetchProfile, eventsAPI } from '../api';
import { useAuthStore } from '../stores/authStore';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statistics, setStatistics] = useState({
    eventsCreated: 0,
    responsesGiven: 0,
  });
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const { user: authUser } = useAuthStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, eventsData] = await Promise.all([
        fetchProfile(),
        eventsAPI.listEvents()
      ]);
      
      setUser(profileData);
      setEditForm({
        username: profileData.username || '',
        email: profileData.email || '',
      });

      // Calculate statistics
      setStatisticsLoading(true);
      const events = eventsData.data || [];
      const eventsCreated = events.filter(event => event.isOwner).length;
      
      // Count responses given (events where user is not owner but has responded)
      let responsesGiven = 0;
      const invitedEvents = events.filter(event => !event.isOwner);
      
      for (const event of invitedEvents) {
        try {
          const responsesData = await eventsAPI.getResponses(event.eventId);
          const userResponse = responsesData.data.find(
            response => response.userId === profileData.uid
          );
          if (userResponse && userResponse.rsvpStatus) {
            responsesGiven++;
          }
        } catch (err) {
          console.warn(`Failed to fetch responses for event ${event.eventId}:`, err);
        }
      }

      setStatistics({
        eventsCreated,
        responsesGiven,
      });
      setStatisticsLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
    });
    setError('');
  };

  const handleSave = async () => {
    try {
      setError('');
      // Note: In a real app, you'd have an API endpoint to update profile
      // For now, we'll just simulate the update
      setSuccess('Profile updated successfully!');
      setUser({ ...user, ...editForm });
      setEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleInputChange = (field) => (event) => {
    setEditForm({
      ...editForm,
      [field]: event.target.value,
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="fade-in" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={0}
        className="glass hover-lift"
        sx={{ 
          p: 4,
          border: '1px solid rgba(29, 185, 84, 0.2)',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mr: 3,
              background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
              fontSize: '2rem',
              boxShadow: '0 4px 12px rgba(29, 185, 84, 0.4)',
            }}
          >
            {user.username ? user.username.charAt(0).toUpperCase() : <AccountCircle />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {editing ? 'Edit Profile' : 'My Profile'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account information
            </Typography>
          </Box>
          {!editing && (
            <IconButton
              onClick={handleEdit}
              color="primary"
              size="large"
              sx={{ ml: 2 }}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Divider sx={{ mb: 4 }} />

        {/* Profile Information */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Personal Information
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={editing ? editForm.username : user.username || 'Not set'}
                      onChange={handleInputChange('username')}
                      disabled={!editing}
                      variant={editing ? 'outlined' : 'filled'}
                      InputProps={{
                        readOnly: !editing,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={editing ? editForm.email : user.email || 'Not set'}
                      onChange={handleInputChange('email')}
                      disabled={!editing}
                      variant={editing ? 'outlined' : 'filled'}
                      type="email"
                      InputProps={{
                        readOnly: !editing,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="User ID"
                      value={user.uid || 'Not available'}
                      disabled
                      variant="filled"
                      InputProps={{
                        readOnly: true,
                      }}
                      helperText="This is your unique identifier"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Statistics */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1 }} />
                  Account Statistics
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                        <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h4" color="primary">
                          {statisticsLoading ? (
                            <CircularProgress size={32} color="primary" />
                          ) : (
                            statistics.eventsCreated
                          )}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Events Created
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                        <ReplyIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h4" color="primary">
                          {statisticsLoading ? (
                            <CircularProgress size={32} color="primary" />
                          ) : (
                            statistics.responsesGiven
                          )}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Responses Given
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        {editing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}