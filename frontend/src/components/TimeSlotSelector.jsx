import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
} from '@mui/material';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23

const formatHour = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

export default function TimeSlotSelector({ selectedSlots = [], onSlotsChange, disabled = false }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(null); // 'add' or 'remove'
  const containerRef = useRef(null);

  const getSlotKey = (day, hour) => `${day.toLowerCase()}_${hour}`;

  const isSlotSelected = (day, hour) => {
    return selectedSlots.includes(getSlotKey(day, hour));
  };

  const handleMouseDown = useCallback((day, hour, event) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsSelecting(true);
    
    const slotKey = getSlotKey(day, hour);
    const isCurrentlySelected = selectedSlots.includes(slotKey);
    
    // Determine if we're adding or removing slots
    const mode = isCurrentlySelected ? 'remove' : 'add';
    setSelectionMode(mode);
    
    // Toggle this slot
    if (mode === 'add') {
      onSlotsChange([...selectedSlots, slotKey]);
    } else {
      onSlotsChange(selectedSlots.filter(slot => slot !== slotKey));
    }
  }, [selectedSlots, onSlotsChange, disabled]);

  const handleMouseEnter = useCallback((day, hour) => {
    if (!isSelecting || disabled) return;
    
    const slotKey = getSlotKey(day, hour);
    const isCurrentlySelected = selectedSlots.includes(slotKey);
    
    if (selectionMode === 'add' && !isCurrentlySelected) {
      onSlotsChange([...selectedSlots, slotKey]);
    } else if (selectionMode === 'remove' && isCurrentlySelected) {
      onSlotsChange(selectedSlots.filter(slot => slot !== slotKey));
    }
  }, [isSelecting, selectionMode, selectedSlots, onSlotsChange, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setSelectionMode(null);
  }, []);

  // Add global mouse up listener
  React.useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const clearAll = () => {
    onSlotsChange([]);
  };

  const selectAll = () => {
    const allSlots = [];
    DAYS.forEach(day => {
      HOURS.forEach(hour => {
        allSlots.push(getSlotKey(day, hour));
      });
    });
    onSlotsChange(allSlots);
  };

  return (
    <Paper elevation={0} className="glass" sx={{ p: 3, border: '1px solid rgba(29, 185, 84, 0.2)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Your Available Time Slots
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click and drag to select time slots when you're available. Green = available.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={selectAll}
            disabled={disabled}
          >
            Select All
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={clearAll}
            disabled={disabled}
          >
            Clear All
          </Button>
        </Box>

        {selectedSlots.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {selectedSlots.length} time slot{selectedSlots.length !== 1 ? 's' : ''} selected
          </Alert>
        )}
      </Box>

      <Box 
        ref={containerRef}
        sx={{ 
          overflowX: 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        <Box sx={{ minWidth: '800px' }}>
          {/* Header with days */}
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Box sx={{ width: '60px', flexShrink: 0 }}></Box>
            {DAYS.map(day => (
              <Box 
                key={day}
                sx={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.primary'
                }}
              >
                {day}
              </Box>
            ))}
          </Box>

          {/* Time grid */}
          {HOURS.map(hour => (
            <Box key={hour} sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Hour label */}
              <Box 
                sx={{ 
                  width: '60px', 
                  flexShrink: 0, 
                  textAlign: 'right', 
                  pr: 1,
                  fontSize: '0.75rem',
                  color: 'text.secondary'
                }}
              >
                {formatHour(hour)}
              </Box>
              
              {/* Day slots */}
              {DAYS.map(day => (
                <Box
                  key={`${day}_${hour}`}
                  sx={{
                    flex: 1,
                    height: '24px',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: disabled ? 'default' : 'pointer',
                    backgroundColor: isSlotSelected(day, hour) 
                      ? 'primary.main' 
                      : 'background.paper',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'background-color 0.1s ease',
                    '&:hover': disabled ? {} : {
                      backgroundColor: isSlotSelected(day, hour) 
                        ? 'primary.dark' 
                        : 'action.hover',
                    }
                  }}
                  onMouseDown={(e) => handleMouseDown(day, hour, e)}
                  onMouseEnter={() => handleMouseEnter(day, hour)}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
} 