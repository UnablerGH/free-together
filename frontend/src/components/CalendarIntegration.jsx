import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import {
  Event as EventIcon,
  CalendarToday as GoogleCalendarIcon,
  Schedule as OutlookIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

const CalendarIntegration = ({ event, open, onClose }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Early return if no event is provided
  if (!event) {
    return null;
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDateTime = (date, time, timezone) => {
    if (!date || !time) return null;
    
    // Create a date object from the date and time
    const dateTime = new Date(`${date}T${time}`);
    return dateTime;
  };

  const generateCalendarData = () => {
    const startDateTime = formatDateTime(event.scheduledDate, event.scheduledTime, event.timezone);
    if (!startDateTime) return null;

    // Assume 1 hour duration if not specified
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    return {
      title: event.name,
      start: startDateTime,
      end: endDateTime,
      description: `FreeTogether Event\n\nEvent Type: ${event.type}\nTimezone: ${event.timezone}\n\nOrganized via FreeTogether`,
      location: 'TBD', // Could be enhanced to include location field
    };
  };

  const addToGoogleCalendar = () => {
    const calendarData = generateCalendarData();
    if (!calendarData) return;

    const formatGoogleDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: calendarData.title,
      dates: `${formatGoogleDate(calendarData.start)}/${formatGoogleDate(calendarData.end)}`,
      details: calendarData.description,
      location: calendarData.location,
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
    handleMenuClose();
  };

  const addToOutlook = () => {
    const calendarData = generateCalendarData();
    if (!calendarData) return;

    const params = new URLSearchParams({
      subject: calendarData.title,
      startdt: calendarData.start.toISOString(),
      enddt: calendarData.end.toISOString(),
      body: calendarData.description,
      location: calendarData.location,
    });

    window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`, '_blank');
    handleMenuClose();
  };

  const downloadICS = () => {
    const calendarData = generateCalendarData();
    if (!calendarData) return;

    const formatICSDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FreeTogether//Event Calendar//EN
BEGIN:VEVENT
UID:${event.eventId}@freetogether.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(calendarData.start)}
DTEND:${formatICSDate(calendarData.end)}
SUMMARY:${calendarData.title}
DESCRIPTION:${calendarData.description.replace(/\n/g, '\\n')}
LOCATION:${calendarData.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleMenuClose();
  };

  const copyEventDetails = () => {
    const calendarData = generateCalendarData();
    if (!calendarData) return;

    const eventDetails = `${event.name}

Date: ${calendarData.start.toLocaleDateString()}
Time: ${calendarData.start.toLocaleTimeString()}
Timezone: ${event.timezone}

${calendarData.description}`;

    navigator.clipboard.writeText(eventDetails).then(() => {
      setShowDetails(true);
    });
    handleMenuClose();
  };

  if (!event.scheduledDate || !event.scheduledTime) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add to Calendar</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            This event needs to be scheduled with a specific date and time before it can be added to your calendar.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon color="primary" />
          Add to Calendar
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {event.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(`${event.scheduledDate}T${event.scheduledTime}`).toLocaleString()} ({event.timezone})
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose how you'd like to add this event to your calendar:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<GoogleCalendarIcon />}
              onClick={addToGoogleCalendar}
              fullWidth
              sx={{ justifyContent: 'flex-start', py: 1.5 }}
            >
              Add to Google Calendar
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<OutlookIcon />}
              onClick={addToOutlook}
              fullWidth
              sx={{ justifyContent: 'flex-start', py: 1.5 }}
            >
              Add to Outlook Calendar
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadICS}
              fullWidth
              sx={{ justifyContent: 'flex-start', py: 1.5 }}
            >
              Download ICS File
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={copyEventDetails}
              fullWidth
              sx={{ justifyContent: 'flex-start', py: 1.5 }}
            >
              Copy Event Details
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Success dialog for copied details */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)}>
        <DialogTitle>Event Details Copied!</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Event details have been copied to your clipboard. You can paste them into any calendar app or share them with others.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarIntegration; 