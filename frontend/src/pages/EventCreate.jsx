import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
} from '@mui/material';
import { eventsAPI } from '../api';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export default function EventCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'once',
    timezone: 'UTC',
    invitees: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await eventsAPI.createEvent(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Container maxWidth="sm" className="fade-in">
      <Box sx={{ mt: 4 }}>
        <Typography 
          variant="h3" 
          gutterBottom
          sx={{
            fontWeight: 900,
            mb: 2,
            background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Create New Event
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Create a When2Meet-style event where invitees can select their available time slots
        </Typography>

        <Paper elevation={0} className="glass" sx={{ p: 4, border: '1px solid rgba(29, 185, 84, 0.2)' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Event Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="e.g., Team Meeting, Study Session, Dinner Plans"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Event Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Event Type"
              >
                <MenuItem value="once">One-time Event</MenuItem>
                <MenuItem value="weekly">Weekly Event</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Timezone</InputLabel>
              <Select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                label="Timezone"
              >
                {TIMEZONES.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 