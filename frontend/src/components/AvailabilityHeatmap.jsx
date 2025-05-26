import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23

const formatHour = (hour) => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

const getIntensityColor = (count, maxCount, theme) => {
  if (count === 0) {
    // Return the current theme's background color
    return theme.palette.mode === 'dark' 
      ? theme.palette.background.paper 
      : theme.palette.background.paper;
  }
  
  const intensity = count / maxCount;
  const baseColor = theme.palette.primary.main;
  
  // Convert hex to RGB for alpha blending
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Create intensity-based alpha with better contrast for dark mode
  const minAlpha = theme.palette.mode === 'dark' ? 0.3 : 0.2;
  const maxAlpha = theme.palette.mode === 'dark' ? 0.9 : 0.8;
  const alpha = minAlpha + (intensity * (maxAlpha - minAlpha));
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function AvailabilityHeatmap({ heatmapData, userResponses = [], maxCount = 0 }) {
  const theme = useTheme();

  const getSlotData = (day, hour) => {
    const dayData = heatmapData?.find(d => d.day.toLowerCase() === day.toLowerCase());
    return dayData?.slots?.find(s => s.hour === hour) || { count: 0, slot: `${day.toLowerCase()}_${hour}` };
  };

  const getTooltipContent = (day, hour) => {
    const slotData = getSlotData(day, hour);
    const availableUsers = userResponses.filter(user => 
      user.timeSlots?.includes(slotData.slot)
    );
    
    return (
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {day} {formatHour(hour)}
        </Typography>
        <Typography variant="body2">
          {slotData.count} of {userResponses.length} available
        </Typography>
        {availableUsers.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Available:
            </Typography>
            {availableUsers.map((user, index) => (
              <Typography key={index} variant="caption" sx={{ display: 'block' }}>
                • {user.userName}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Paper elevation={0} className="glass" sx={{ p: 3, border: '1px solid rgba(29, 185, 84, 0.2)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Availability Heatmap
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Darker green = more people available. Hover over time slots to see details.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Responses: {userResponses.length}
          </Typography>
          {maxCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Legend:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }} 
                  />
                  <Typography variant="caption">0</Typography>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      backgroundColor: getIntensityColor(maxCount, maxCount, theme),
                      border: '1px solid',
                      borderColor: 'divider'
                    }} 
                  />
                  <Typography variant="caption">{maxCount}</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
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
              {DAYS.map(day => {
                const slotData = getSlotData(day, hour);
                return (
                  <Tooltip 
                    key={`${day}_${hour}`}
                    title={getTooltipContent(day, hour)}
                    arrow
                    placement="top"
                  >
                    <Box
                      sx={{
                        flex: 1,
                        height: '24px',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: getIntensityColor(slotData.count, maxCount, theme),
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          zIndex: 1,
                          boxShadow: theme.palette.mode === 'dark' 
                            ? '0 2px 8px rgba(255,255,255,0.15)' 
                            : '0 2px 8px rgba(0,0,0,0.15)',
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

      {/* User responses summary */}
      {userResponses.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Responses Summary
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {userResponses.map((user, index) => (
              <Chip
                key={index}
                label={`${user.userName} (${user.timeSlots?.length || 0} slots)`}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
} 