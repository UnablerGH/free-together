import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  BusinessCenter as BusinessIcon,
  NightsStay as EveningIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';

const Settings = ({ open, onClose }) => {
  const [businessStart, setBusinessStart] = useState('09:00');
  const [businessEnd, setBusinessEnd] = useState('17:00');
  const [eveningStart, setEveningStart] = useState('18:00');
  const [eveningEnd, setEveningEnd] = useState('22:00');
  const [successMessage, setSuccessMessage] = useState('');

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('freetogether-time-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setBusinessStart(settings.businessStart || '09:00');
        setBusinessEnd(settings.businessEnd || '17:00');
        setEveningStart(settings.eveningStart || '18:00');
        setEveningEnd(settings.eveningEnd || '22:00');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSave = () => {
    // Validate times
    if (businessStart >= businessEnd) {
      setSuccessMessage('');
      return;
    }
    if (eveningStart >= eveningEnd) {
      setSuccessMessage('');
      return;
    }

    const settings = {
      businessStart,
      businessEnd,
      eveningStart,
      eveningEnd,
    };

    localStorage.setItem('freetogether-time-settings', JSON.stringify(settings));
    setSuccessMessage('Settings saved successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleReset = () => {
    setBusinessStart('09:00');
    setBusinessEnd('17:00');
    setEveningStart('18:00');
    setEveningEnd('22:00');
    localStorage.removeItem('freetogether-time-settings');
    setSuccessMessage('Settings reset to defaults!');
    
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const formatTimeDisplay = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon color="primary" />
        Time Settings
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Customize your preferred business hours and evening hours for quick selection when creating availability.
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Business Hours Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <BusinessIcon color="primary" />
            <Typography variant="h6" color="primary">
              Business Hours
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Start Time"
              type="time"
              value={businessStart}
              onChange={(e) => setBusinessStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              to
            </Typography>
            <TextField
              label="End Time"
              type="time"
              value={businessEnd}
              onChange={(e) => setBusinessEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Preview: {formatTimeDisplay(businessStart)} - {formatTimeDisplay(businessEnd)}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Evening Hours Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EveningIcon color="secondary" />
            <Typography variant="h6" color="secondary">
              Evening Hours
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Start Time"
              type="time"
              value={eveningStart}
              onChange={(e) => setEveningStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              to
            </Typography>
            <TextField
              label="End Time"
              type="time"
              value={eveningEnd}
              onChange={(e) => setEveningEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Preview: {formatTimeDisplay(eveningStart)} - {formatTimeDisplay(eveningEnd)}
          </Typography>
        </Box>

        {/* Validation Messages */}
        {businessStart >= businessEnd && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Business hours: Start time must be before end time
          </Alert>
        )}
        
        {eveningStart >= eveningEnd && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Evening hours: Start time must be before end time
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleReset} 
          startIcon={<RestoreIcon />}
          color="warning"
          sx={{ mr: 'auto' }}
        >
          Reset to Defaults
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          startIcon={<SaveIcon />}
          disabled={businessStart >= businessEnd || eveningStart >= eveningEnd}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Settings; 