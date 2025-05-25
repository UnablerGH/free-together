import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { eventsAPI } from '../api';

const AVAILABILITY_LEVELS = [
  { value: 0, label: 'Not Available', color: 'error' },
  { value: 1, label: 'Maybe Available', color: 'warning' },
  { value: 2, label: 'Available', color: 'success' },
];

export default function EventView() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState({});
  const [comments, setComments] = useState({});

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
      setError(null);
    } catch (err) {
      setError('Failed to load event data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (slotId, level) => {
    setAvailability((prev) => ({
      ...prev,
      [slotId]: level,
    }));
  };

  const handleCommentChange = (slotId, comment) => {
    setComments((prev) => ({
      ...prev,
      [slotId]: comment,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await eventsAPI.submitResponse(eventId, {
        availability,
        comments,
      });
      await loadEventData();
      setAvailability({});
      setComments({});
    } catch (err) {
      setError('Failed to submit response');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <Alert severity="error">Event not found</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {event.name}
        </Typography>
        <Box sx={{ mb: 3 }}>
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

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Availability
              </Typography>
              {Object.entries(availability).map(([slotId, level]) => (
                <Box key={slotId} sx={{ mb: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Availability</InputLabel>
                    <Select
                      value={level}
                      onChange={(e) => handleAvailabilityChange(slotId, e.target.value)}
                      label="Availability"
                    >
                      {AVAILABILITY_LEVELS.map(({ value, label }) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Comment"
                    value={comments[slotId] || ''}
                    onChange={(e) => handleCommentChange(slotId, e.target.value)}
                    margin="normal"
                  />
                </Box>
              ))}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                Submit Response
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Event Details
              </Typography>
              <Typography variant="body1" paragraph>
                Type: {event.type}
              </Typography>
              <Typography variant="body1" paragraph>
                Timezone: {event.timezone}
              </Typography>
              <Typography variant="body1" paragraph>
                Access: {event.access}
              </Typography>
              {event.end_date && (
                <Typography variant="body1" paragraph>
                  End Date: {new Date(event.end_date).toLocaleString()}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 