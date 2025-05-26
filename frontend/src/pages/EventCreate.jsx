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
import { DatePicker } from '@mui/x-date-pickers';
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
    start_date: null,
    end_date: null,
    invitees: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date) {
      setError('Please select both start and end dates');
      return;
    }
    
    if (formData.end_date < formData.start_date) {
      setError('End date must be after start date');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format dates for backend
      const eventData = {
        ...formData,
        start_date: formData.start_date.toISOString().split('T')[0], // YYYY-MM-DD
        end_date: formData.end_date.toISOString().split('T')[0],
      };
      
      await eventsAPI.createEvent(eventData);
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
          Create a When2Meet-style event where invitees can select their available time slots within your specified date range
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

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                onChange={(newValue) => setFormData({ ...formData, start_date: newValue })}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    error: formData.start_date && formData.end_date && formData.end_date < formData.start_date,
                    helperText: formData.start_date && formData.end_date && formData.end_date < formData.start_date 
                      ? 'Start date must be before end date' 
                      : 'First day for availability collection'
                  }
                }}
                minDate={new Date()}
              />
              
              <DatePicker
                label="End Date"
                value={formData.end_date}
                onChange={(newValue) => setFormData({ ...formData, end_date: newValue })}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    error: formData.start_date && formData.end_date && formData.end_date < formData.start_date,
                    helperText: formData.start_date && formData.end_date && formData.end_date < formData.start_date 
                      ? 'End date must be after start date' 
                      : 'Last day for availability collection'
                  }
                }}
                minDate={formData.start_date || new Date()}
              />
            </Box>
            
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