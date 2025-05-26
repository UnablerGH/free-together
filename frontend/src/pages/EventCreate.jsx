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
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
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
    access: 'public',
    end_date: null,
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
            mb: 4,
            background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Create New Event
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Access Level</InputLabel>
            <Select
              name="access"
              value={formData.access}
              onChange={handleChange}
              label="Access Level"
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="restricted">Restricted</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, mb: 2 }}>
            <DateTimePicker
              label="End Date (Optional)"
              value={formData.end_date}
              onChange={(newValue) =>
                setFormData((prev) => ({ ...prev, end_date: newValue }))
              }
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 