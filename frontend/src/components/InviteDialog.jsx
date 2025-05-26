import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

export default function InviteDialog({ open, onClose, onInvite, eventName }) {
  const [emails, setEmails] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  const validateEmails = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter(email => email.trim() && emailRegex.test(email.trim()));
    const invalidEmails = emails.filter(email => email.trim() && !emailRegex.test(email.trim()));
    
    return { validEmails, invalidEmails };
  };

  const handleInvite = async () => {
    setError('');
    const { validEmails, invalidEmails } = validateEmails();

    if (invalidEmails.length > 0) {
      setError(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    if (validEmails.length === 0) {
      setError('Please enter at least one valid email address');
      return;
    }

    try {
      setLoading(true);
      await onInvite(validEmails);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmails(['']);
    setError('');
    setLoading(false);
    onClose();
  };

  const { validEmails, invalidEmails } = validateEmails();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 1 }} />
          Invite People to "{eventName}"
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter email addresses of people you'd like to invite to this event. They'll be able to view the event and submit their availability.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          {emails.map((email, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                fullWidth
                label={`Email ${index + 1}`}
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                type="email"
                placeholder="user@example.com"
                error={Boolean(email.trim() && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))}
                helperText={
                  email.trim() && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) 
                    ? 'Please enter a valid email address' 
                    : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              {emails.length > 1 && (
                <IconButton
                  onClick={() => removeEmailField(index)}
                  color="error"
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>

        <Button
          startIcon={<AddIcon />}
          onClick={addEmailField}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        >
          Add Another Email
        </Button>

        {validEmails.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Valid emails to invite ({validEmails.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {validEmails.map((email, index) => (
                <Chip
                  key={index}
                  label={email}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleInvite}
          variant="contained"
          disabled={loading || validEmails.length === 0}
          startIcon={<EmailIcon />}
        >
          {loading ? 'Sending...' : `Send ${validEmails.length} Invitation${validEmails.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 