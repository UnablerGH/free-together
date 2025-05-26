import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
} from '@mui/material';

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23

const formatHour = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

const generateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    // Fallback to generic weekdays if no date range provided
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
      displayName: day,
      key: day.toLowerCase(),
      date: null
    }));
  }

  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Generate all dates in the range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    
    dates.push({
      displayName: `${dayName} ${dayNumber} ${monthName}`,
      key: `${dayName.toLowerCase()}_${date.toISOString().split('T')[0]}`, // e.g., "monday_2024-05-26"
      date: new Date(date),
      dayOfWeek: dayName.toLowerCase()
    });
  }
  
  return dates;
};

export default function TimeSlotSelector({ 
  selectedSlots = [], 
  maybeSlots = [], 
  onSlotsChange, 
  onMaybeSlotsChange,
  disabled = false,
  startDate = null,
  endDate = null
}) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(null); // 'available', 'maybe', or 'remove'
  const [currentSelectionType, setCurrentSelectionType] = useState('available'); // 'available' or 'maybe'
  const containerRef = useRef(null);

  // Generate the date range based on start and end dates
  const dateRange = generateDateRange(startDate, endDate);

  const getSlotKey = (dayKey, hour) => `${dayKey}_${hour}`;

  const getSlotStatus = (dayKey, hour) => {
    const slotKey = getSlotKey(dayKey, hour);
    if (selectedSlots.includes(slotKey)) return 'available';
    if (maybeSlots.includes(slotKey)) return 'maybe';
    return 'none';
  };

  const applySlotChange = (slotKey, mode) => {
    // Remove from both arrays first
    const newSelectedSlots = selectedSlots.filter(slot => slot !== slotKey);
    const newMaybeSlots = maybeSlots.filter(slot => slot !== slotKey);
    
    // Add to appropriate array based on mode
    if (mode === 'available') {
      onSlotsChange([...newSelectedSlots, slotKey]);
      onMaybeSlotsChange(newMaybeSlots);
    } else if (mode === 'maybe') {
      onSlotsChange(newSelectedSlots);
      onMaybeSlotsChange([...newMaybeSlots, slotKey]);
    } else if (mode === 'remove') {
      onSlotsChange(newSelectedSlots);
      onMaybeSlotsChange(newMaybeSlots);
    }
  };

  const handleMouseDown = useCallback((dayKey, hour, event) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsSelecting(true);
    
    const slotKey = getSlotKey(dayKey, hour);
    const currentStatus = getSlotStatus(dayKey, hour);
    
    // Determine selection mode based on current status and selection type
    let mode;
    if (currentStatus === 'none') {
      mode = currentSelectionType; // Add available or maybe
    } else if (currentStatus === currentSelectionType) {
      mode = 'remove'; // Remove if clicking same type
    } else {
      mode = currentSelectionType; // Switch to other type
    }
    
    setSelectionMode(mode);
    
    // Apply the change
    applySlotChange(slotKey, mode);
  }, [selectedSlots, maybeSlots, currentSelectionType, disabled]);

  const handleMouseEnter = useCallback((dayKey, hour) => {
    if (!isSelecting || disabled) return;
    
    const slotKey = getSlotKey(dayKey, hour);
    const currentStatus = getSlotStatus(dayKey, hour);
    
    // Apply same mode as mouse down for consistency
    if (selectionMode && (
      (selectionMode === 'available' && currentStatus !== 'available') ||
      (selectionMode === 'maybe' && currentStatus !== 'maybe') ||
      (selectionMode === 'remove' && currentStatus !== 'none')
    )) {
      applySlotChange(slotKey, selectionMode);
    }
  }, [isSelecting, selectionMode, selectedSlots, maybeSlots, disabled]);

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
    onMaybeSlotsChange([]);
  };

  const selectAll = () => {
    const allSlots = [];
    dateRange.forEach(dateInfo => {
      HOURS.forEach(hour => {
        allSlots.push(getSlotKey(dateInfo.key, hour));
      });
    });
    onSlotsChange(allSlots);
    onMaybeSlotsChange([]);
  };

  const getCustomTimeSettings = () => {
    const savedSettings = localStorage.getItem('freetogether-time-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Error loading time settings:', error);
      }
    }
    return {
      businessStart: '09:00',
      businessEnd: '17:00',
      eveningStart: '18:00',
      eveningEnd: '22:00',
    };
  };

  const selectTimeRange = (startHour, endHour) => {
    const rangeSlots = [];
    dateRange.forEach(dateInfo => {
      for (let hour = startHour; hour <= endHour; hour++) {
        rangeSlots.push(getSlotKey(dateInfo.key, hour));
      }
    });
    
    if (currentSelectionType === 'available') {
      // Remove from maybe slots and add to available
      const newMaybeSlots = maybeSlots.filter(slot => !rangeSlots.includes(slot));
      const newSelectedSlots = [...new Set([...selectedSlots, ...rangeSlots])];
      onSlotsChange(newSelectedSlots);
      onMaybeSlotsChange(newMaybeSlots);
    } else {
      // Remove from available slots and add to maybe
      const newSelectedSlots = selectedSlots.filter(slot => !rangeSlots.includes(slot));
      const newMaybeSlots = [...new Set([...maybeSlots, ...rangeSlots])];
      onSlotsChange(newSelectedSlots);
      onMaybeSlotsChange(newMaybeSlots);
    }
  };

  const selectBusinessHours = () => {
    const settings = getCustomTimeSettings();
    const startHour = parseInt(settings.businessStart.split(':')[0]);
    const endHour = parseInt(settings.businessEnd.split(':')[0]);
    selectTimeRange(startHour, endHour);
  };

  const selectEveningHours = () => {
    const settings = getCustomTimeSettings();
    const startHour = parseInt(settings.eveningStart.split(':')[0]);
    const endHour = parseInt(settings.eveningEnd.split(':')[0]);
    selectTimeRange(startHour, endHour);
  };

  return (
    <Paper elevation={0} className="glass" sx={{ p: 3, border: '1px solid rgba(29, 185, 84, 0.2)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Your Available Time Slots
        </Typography>
        {startDate && endDate && (
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
            Date Range: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click and drag to select time slots. Green = available, Yellow = maybe available.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button 
            variant={currentSelectionType === 'available' ? 'contained' : 'outlined'}
            size="small" 
            onClick={() => setCurrentSelectionType('available')}
            disabled={disabled}
            sx={{ 
              backgroundColor: currentSelectionType === 'available' ? 'primary.main' : 'transparent',
              color: currentSelectionType === 'available' ? 'white' : 'primary.main',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                backgroundColor: currentSelectionType === 'available' ? 'primary.dark' : 'action.hover',
                borderWidth: 2,
                transform: 'translateY(-1px)',
              }
            }}
          >
            Available (Green)
          </Button>
          <Button 
            variant={currentSelectionType === 'maybe' ? 'contained' : 'outlined'}
            size="small" 
            onClick={() => setCurrentSelectionType('maybe')}
            disabled={disabled}
            sx={{ 
              backgroundColor: currentSelectionType === 'maybe' ? '#ff9800' : 'transparent',
              color: currentSelectionType === 'maybe' ? 'white' : '#ff9800',
              borderColor: '#ff9800',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                backgroundColor: currentSelectionType === 'maybe' ? '#f57c00' : 'rgba(255, 152, 0, 0.1)',
                borderColor: '#f57c00',
                borderWidth: 2,
                transform: 'translateY(-1px)',
              }
            }}
          >
            Maybe (Yellow)
          </Button>
        </Box>

        {/* Quick Selection Tools */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={selectAll}
            disabled={disabled}
            sx={{
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-1px)',
              }
            }}
          >
            Select All
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={clearAll}
            disabled={disabled}
            sx={{
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-1px)',
              }
            }}
          >
            Clear All
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={selectBusinessHours}
            disabled={disabled}
            sx={{
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-1px)',
              }
            }}
          >
            Business Hours
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={selectEveningHours}
            disabled={disabled}
            sx={{
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-1px)',
              }
            }}
          >
            Evening
          </Button>
        </Box>

        {(selectedSlots.length > 0 || maybeSlots.length > 0) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {selectedSlots.length} available, {maybeSlots.length} maybe
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
        <Box sx={{ minWidth: `${Math.max(800, dateRange.length * 120)}px` }}>
          {/* Header with dates */}
          <Box sx={{ display: 'flex', mb: 1 }}>
            <Box sx={{ width: '60px', flexShrink: 0 }}></Box>
            {dateRange.map(dateInfo => (
              <Box 
                key={dateInfo.key}
                sx={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  py: 1,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: 'text.primary',
                  minWidth: '120px'
                }}
              >
                {dateInfo.displayName}
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
              
              {/* Date slots */}
              {dateRange.map(dateInfo => {
                const slotStatus = getSlotStatus(dateInfo.key, hour);
                return (
                  <Box
                    key={`${dateInfo.key}_${hour}`}
                    sx={{
                      flex: 1,
                      height: '24px',
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: disabled ? 'default' : 'pointer',
                      backgroundColor: 
                        slotStatus === 'available' ? 'primary.main' :
                        slotStatus === 'maybe' ? '#ff9800' :
                        'background.paper',
                      opacity: disabled ? 0.5 : 1,
                      transition: 'background-color 0.1s ease',
                      minWidth: '120px',
                      '&:hover': disabled ? {} : {
                        backgroundColor: 
                          slotStatus === 'available' ? 'primary.dark' :
                          slotStatus === 'maybe' ? '#f57c00' :
                          'action.hover',
                      }
                    }}
                    onMouseDown={(e) => handleMouseDown(dateInfo.key, hour, e)}
                    onMouseEnter={() => handleMouseEnter(dateInfo.key, hour)}
                  />
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
} 