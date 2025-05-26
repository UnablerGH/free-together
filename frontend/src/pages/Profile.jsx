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
} from '@mui/icons-material';
import { fetchProfile } from '../api';
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
  const { user: authUser } = useAuthStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await fetchProfile();
      setUser(profileData);
      setEditForm({
        username: profileData.username || '',
        email: profileData.email || '',
      });
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mr: 3,
              bgcolor: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {user.username ? user.username.charAt(0).toUpperCase() : <AccountCircle />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
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
                <Typography variant="h6" gutterBottom>
                  Account Statistics
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary">
                        0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Events Created
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary">
                        0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Events Attended
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary">
                        0
                      </Typography>
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