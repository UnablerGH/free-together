import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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

export default function AvailabilityHeatmap({ heatmapData, userResponses = [], startDate = null, endDate = null }) {
  const theme = useTheme();

  // Generate the date range based on start and end dates
  const dateRange = generateDateRange(startDate, endDate);

  const getSlotInfo = (dayKey, hour) => {
    // For new date-based keys, we need to match against the slot key in heatmap data
    const slotKey = `${dayKey}_${hour}`;
    
    // Find the slot data by searching through all days and slots
    for (const dayData of heatmapData?.heatmapGrid || []) {
      const slot = dayData.slots?.find(s => {
        const expectedKey = `${dayData.day}_${s.hour}`;
        return expectedKey === slotKey || s.slot === slotKey;
      });
      if (slot) return slot;
    }
    
    return { count: 0, maybeCount: 0 };
  };

  const getSlotUsers = (dayKey, hour) => {
    const slotKey = `${dayKey}_${hour}`;
    const available = userResponses.filter(user => 
      user.timeSlots?.includes(slotKey)
    ).map(user => user.userName);
    
    const maybe = userResponses.filter(user => 
      user.maybeSlots?.includes(slotKey)
    ).map(user => user.userName);

    return { available, maybe };
  };

  const getSlotColor = (count, maybeCount, maxCount, maxMaybeCount) => {
    if (count === 0 && maybeCount === 0) {
      return theme.palette.mode === 'dark' ? '#2c2c2c' : '#f5f5f5';
    }

    // Prioritize available (green) over maybe (yellow)
    if (count > 0) {
      const intensity = count / Math.max(maxCount, 1);
      const alpha = Math.max(0.3, intensity);
      return `rgba(29, 185, 84, ${alpha})`;
    } else if (maybeCount > 0) {
      const intensity = maybeCount / Math.max(maxMaybeCount, 1);
      const alpha = Math.max(0.3, intensity);
      return `rgba(255, 152, 0, ${alpha})`;
    }

    return theme.palette.mode === 'dark' ? '#2c2c2c' : '#f5f5f5';
  };

  const maxCount = heatmapData?.maxCount || 0;
  const maxMaybeCount = heatmapData?.maxMaybeCount || 0;

  return (
    <Paper elevation={0} className="glass" sx={{ p: 3, border: '1px solid rgba(29, 185, 84, 0.2)' }}>
      <Typography variant="h6" gutterBottom>
        Availability Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Green = Available, Yellow = Maybe Available. Darker colors indicate more responses.
      </Typography>

      {/* Summary */}
      {userResponses.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Response Summary ({userResponses.length} people responded)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {userResponses.map((user, index) => (
              <Chip 
                key={index}
                label={user.userName}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ overflowX: 'auto' }}>
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
                const slotInfo = getSlotInfo(dateInfo.key, hour);
                const slotUsers = getSlotUsers(dateInfo.key, hour);
                const color = getSlotColor(slotInfo.count, slotInfo.maybeCount, maxCount, maxMaybeCount);
                
                const tooltipContent = (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {dateInfo.displayName} {formatHour(hour)}
                    </Typography>
                    {slotUsers.available.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#1DB954', fontWeight: 'bold' }}>
                          Available ({slotUsers.available.length}):
                        </Typography>
                        <Typography variant="caption" display="block">
                          {slotUsers.available.join(', ')}
                        </Typography>
                      </Box>
                    )}
                    {slotUsers.maybe.length > 0 && (
                      <Box>
                        <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                          Maybe ({slotUsers.maybe.length}):
                        </Typography>
                        <Typography variant="caption" display="block">
                          {slotUsers.maybe.join(', ')}
                        </Typography>
                      </Box>
                    )}
                    {slotUsers.available.length === 0 && slotUsers.maybe.length === 0 && (
                      <Typography variant="caption" color="text.secondary">
                        No responses
                      </Typography>
                    )}
                  </Box>
                );

                return (
                  <Tooltip key={`${dateInfo.key}_${hour}`} title={tooltipContent} arrow>
                    <Box
                      sx={{
                        flex: 1,
                        height: '24px',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: color,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '120px',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          zIndex: 1,
                          boxShadow: 1,
                        }
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 16, 
              height: 16, 
              backgroundColor: 'rgba(29, 185, 84, 0.7)',
              border: '1px solid',
              borderColor: 'divider'
            }} 
          />
          <Typography variant="caption">Available</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 16, 
              height: 16, 
              backgroundColor: 'rgba(255, 152, 0, 0.7)',
              border: '1px solid',
              borderColor: 'divider'
            }} 
          />
          <Typography variant="caption">Maybe</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 16, 
              height: 16, 
              backgroundColor: theme.palette.mode === 'dark' ? '#2c2c2c' : '#f5f5f5',
              border: '1px solid',
              borderColor: 'divider'
            }} 
          />
          <Typography variant="caption">No responses</Typography>
        </Box>
      </Box>
    </Paper>
  );
} 