import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true; // Default to dark mode
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const createAppTheme = (darkMode) => {
    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: '#1DB954', // Spotify green
          light: '#1ed760',
          dark: '#169c46',
          contrastText: '#ffffff',
        },
        secondary: {
          main: darkMode ? '#191414' : '#f5f5f5', // Spotify dark or light gray
          light: darkMode ? '#282828' : '#ffffff',
          dark: darkMode ? '#000000' : '#e0e0e0',
          contrastText: darkMode ? '#ffffff' : '#000000',
        },
        background: {
          default: darkMode ? '#1a1a1a' : '#f8f9fa', // Lighter dark, softer light
          paper: darkMode ? '#242424' : '#ffffff', // Lighter dark paper
        },
        text: {
          primary: darkMode ? '#ffffff' : '#1a1a1a',
          secondary: darkMode ? '#b3b3b3' : '#666666',
        },
        success: {
          main: '#1DB954',
          light: '#1ed760',
          dark: '#169c46',
        },
        error: {
          main: '#e22134',
          light: '#ff6b6b',
          dark: '#c41e3a',
        },
        warning: {
          main: '#ffa726',
          light: '#ffb74d',
          dark: '#f57c00',
        },
        info: {
          main: '#29b6f6',
          light: '#4fc3f7',
          dark: '#0288d1',
        },
        divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
      typography: {
        fontFamily: '"Inter", "Circular", "Helvetica Neue", Helvetica, Arial, sans-serif',
        h1: {
          fontWeight: 900,
          fontSize: '2.5rem',
          letterSpacing: '-0.04em',
        },
        h2: {
          fontWeight: 700,
          fontSize: '2rem',
          letterSpacing: '-0.025em',
        },
        h3: {
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '-0.025em',
        },
        h4: {
          fontWeight: 700,
          fontSize: '1.25rem',
          letterSpacing: '-0.025em',
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.125rem',
        },
        h6: {
          fontWeight: 600,
          fontSize: '1rem',
        },
        body1: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.75rem',
          lineHeight: 1.5,
        },
        button: {
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '0.875rem',
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '500px',
              padding: '8px 32px',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
                transform: 'scale(1.04)',
              },
              transition: 'all 0.2s ease',
            },
            contained: {
              '&:hover': {
                boxShadow: '0 4px 12px rgba(29, 185, 84, 0.4)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: darkMode ? '#242424' : '#ffffff',
              borderRadius: '8px',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5',
                transform: 'translateY(-2px)',
                boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: darkMode ? '#242424' : '#ffffff',
              backgroundImage: 'none',
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: darkMode ? '#242424' : '#ffffff',
              color: darkMode ? '#ffffff' : '#1a1a1a',
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              color: darkMode ? '#ffffff' : '#1a1a1a',
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: {
              color: darkMode ? '#ffffff' : '#1a1a1a',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
              color: darkMode ? '#ffffff' : '#1a1a1a',
              boxShadow: 'none',
              borderBottom: darkMode ? '1px solid #333333' : '1px solid #e0e0e0',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: '16px',
              fontWeight: 600,
            },
            colorPrimary: {
              backgroundColor: '#1DB954',
              color: '#ffffff',
            },
            colorSuccess: {
              backgroundColor: '#1DB954',
              color: '#ffffff',
            },
            colorError: {
              backgroundColor: '#e22134',
              color: '#ffffff',
            },
            colorWarning: {
              backgroundColor: '#ffa726',
              color: darkMode ? '#000000' : '#ffffff',
            },
            colorSecondary: {
              backgroundColor: darkMode ? '#404040' : '#e0e0e0',
              color: darkMode ? '#ffffff' : '#1a1a1a',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa',
                borderRadius: '4px',
                '& fieldset': {
                  borderColor: darkMode ? '#404040' : '#d0d0d0',
                },
                '&:hover fieldset': {
                  borderColor: '#1DB954',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1DB954',
                },
              },
              '& .MuiInputLabel-root': {
                color: darkMode ? '#e0e0e0' : '#555555', // Better contrast for labels
              },
              '& .MuiOutlinedInput-input': {
                color: darkMode ? '#ffffff' : '#1a1a1a',
              },
              '& .MuiFormLabel-root': {
                color: darkMode ? '#e0e0e0' : '#555555', // Better contrast for form labels
              },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa',
              borderRadius: '4px',
              color: darkMode ? '#ffffff' : '#1a1a1a',
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: darkMode ? '#e0e0e0' : '#555555', // Better contrast for all input labels
              '&.Mui-focused': {
                color: '#1DB954',
              },
            },
          },
        },
        MuiFormLabel: {
          styleOverrides: {
            root: {
              color: darkMode ? '#e0e0e0' : '#555555', // Better contrast for form labels
              '&.Mui-focused': {
                color: '#1DB954',
              },
            },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              backgroundColor: darkMode ? '#2a2a2a' : '#ffffff',
              border: darkMode ? '1px solid #404040' : '1px solid #e0e0e0',
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              color: darkMode ? '#ffffff' : '#1a1a1a',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(29, 185, 84, 0.2)' : 'rgba(29, 185, 84, 0.1)',
              },
            },
          },
        },
        MuiListItemText: {
          styleOverrides: {
            primary: {
              color: darkMode ? '#ffffff' : '#1a1a1a',
            },
            secondary: {
              color: darkMode ? '#b3b3b3' : '#666666',
            },
          },
        },
      },
    });
  };

  const theme = createAppTheme(isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 