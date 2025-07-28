import React, { createContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 1️⃣ Create the context
export const ThemeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
  isDark: false
});

export default function ThemeContextProvider({ children }) {
  // 2️⃣ Get system preference as fallback
  const getInitialMode = () => {
    const saved = localStorage.getItem('themeMode');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [mode, setMode] = useState(getInitialMode);

  // 3️⃣ Memoize the MUI theme
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary:   { main: '#006400' },  // Dark Green
      secondary: { main: '#ffffff' },  // White
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        defaultProps: { variant: 'contained', disableElevation: true },
        styleOverrides: { root: { textTransform: 'none' } },
      },
    },
  }), [mode]);

  // 4️⃣ Toggle function
  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 5️⃣ Save mode in localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // 6️⃣ Sync theme change across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'themeMode' && e.newValue) {
        setMode(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, isDark: mode === 'dark' }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
