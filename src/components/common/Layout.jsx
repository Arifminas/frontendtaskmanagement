import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  CssBaseline, 
  useTheme, 
  useMediaQuery,
  createTheme,
  ThemeProvider,
  GlobalStyles,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import your enhanced components
import Topbar from './Topbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Enhanced responsive breakpoints with proper device detection
  const isMobile = useMediaQuery('(max-width:767px)');
  const isTablet = useMediaQuery('(min-width:768px) and (max-width:1023px)');
  const isLaptop = useMediaQuery('(min-width:1024px) and (max-width:1439px)');
  const isDesktop = useMediaQuery('(min-width:1440px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  // State management with device-specific defaults
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved) return JSON.parse(saved);
    return isMobile || isTablet; // Auto-collapse on mobile and tablet
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [pageLoading, setPageLoading] = useState(false);

  // Enhanced responsive dimensions
  const getDeviceSpecs = () => {
    if (isSmallMobile) return { type: 'smallMobile', factor: 0.8 };
    if (isMobile) return { type: 'mobile', factor: 0.9 };
    if (isTablet) return { type: 'tablet', factor: 1.0 };
    if (isLaptop) return { type: 'laptop', factor: 1.1 };
    if (isDesktop) return { type: 'desktop', factor: 1.2 };
    return { type: 'default', factor: 1.0 };
  };

  const deviceSpecs = getDeviceSpecs();

  // Create responsive theme with device-specific scaling
  const dynamicTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1a2752',
            light: '#2a3f6f',
            dark: '#0f1a3a',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#dc267f',
            light: '#ff5ea8',
            dark: '#a01e5c',
            contrastText: '#ffffff',
          },
          background: {
            default: darkMode ? '#121212' : '#f8faff',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: darkMode ? '#ffffff' : '#1a2752',
            secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 39, 82, 0.7)',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { 
            fontWeight: 700,
            fontSize: `${2.5 * deviceSpecs.factor}rem`,
            lineHeight: 1.2,
          },
          h2: { 
            fontWeight: 700,
            fontSize: `${2.0 * deviceSpecs.factor}rem`,
            lineHeight: 1.3,
          },
          h3: { 
            fontWeight: 600,
            fontSize: `${1.75 * deviceSpecs.factor}rem`,
            lineHeight: 1.4,
          },
          h4: { 
            fontWeight: 600,
            fontSize: `${1.5 * deviceSpecs.factor}rem`,
            lineHeight: 1.4,
          },
          h5: { 
            fontWeight: 600,
            fontSize: `${1.25 * deviceSpecs.factor}rem`,
            lineHeight: 1.5,
          },
          h6: { 
            fontWeight: 600,
            fontSize: `${1.1 * deviceSpecs.factor}rem`,
            lineHeight: 1.5,
          },
          body1: {
            fontSize: `${1.0 * deviceSpecs.factor}rem`,
            lineHeight: 1.6,
          },
          body2: {
            fontSize: `${0.875 * deviceSpecs.factor}rem`,
            lineHeight: 1.5,
          },
        },
        shape: {
          borderRadius: isMobile ? 8 : 12,
        },
        breakpoints: {
          values: {
            xs: 0,
            sm: 480,
            md: 768,
            lg: 1024,
            xl: 1440,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: isMobile ? 6 : 8,
                padding: (() => {
                  if (isSmallMobile) return '6px 12px';
                  if (isMobile) return '8px 16px';
                  if (isTablet) return '10px 20px';
                  return '12px 24px';
                })(),
                fontSize: `${deviceSpecs.factor}rem`,
                minHeight: isTouchDevice ? 44 : 'auto', // Touch-friendly
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [darkMode, deviceSpecs, isMobile, isTablet, isSmallMobile, isTouchDevice]
  );

  // Device-specific sidebar calculations
  const getSidebarDimensions = () => {
    if (isMobile) {
      return {
        width: sidebarOpen ? Math.min(280, window.innerWidth * 0.8) : 0,
        collapsedWidth: 0,
      };
    }
    if (isTablet) {
      return {
        width: sidebarCollapsed ? 60 : 240,
        collapsedWidth: 60,
      };
    }
    if (isLaptop) {
      return {
        width: sidebarCollapsed ? 70 : 280,
        collapsedWidth: 70,
      };
    }
    // Desktop
    return {
      width: sidebarCollapsed ? 80 : 320,
      collapsedWidth: 80,
    };
  };

  const sidebarDimensions = getSidebarDimensions();

  // Device-specific topbar height
  const getTopbarHeight = () => {
    if (isSmallMobile) return 52;
    if (isMobile) return 56;
    if (isTablet) return 60;
    if (isLaptop) return 64;
    return 68; // Desktop
  };

  const topbarHeight = getTopbarHeight();

  // Device-specific padding/spacing
  const getSpacing = () => {
    if (isSmallMobile) return { container: 1, content: 0.5, footer: 1 };
    if (isMobile) return { container: 1.5, content: 1, footer: 1.5 };
    if (isTablet) return { container: 2, content: 1.5, footer: 2 };
    if (isLaptop) return { container: 3, content: 2, footer: 2.5 };
    return { container: 4, content: 3, footer: 3 }; // Desktop
  };

  const spacing = getSpacing();

  // Event handlers
  const handleLogout = useCallback(async () => {
    try {
      setPageLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setPageLoading(false);
    }
  }, [logout, navigate]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // Responsive behavior effects
  useEffect(() => {
    // Auto-collapse on smaller screens
    if ((isMobile || isTablet) && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
    // Auto-expand on larger screens if needed
    if (isDesktop && sidebarCollapsed && !localStorage.getItem('sidebarCollapsed')) {
      setSidebarCollapsed(false);
    }
  }, [isMobile, isTablet, isDesktop, sidebarCollapsed]);

  // Close mobile sidebar on route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Page loading effect
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, isMobile ? 200 : 300);

    return () => clearTimeout(timer);
  }, [location.pathname, isMobile]);

  // Enhanced global styles with device-specific optimizations - FIXED: No duplicate keys
  const globalStyles = (
    <GlobalStyles
      styles={{
        // FIXED: Consolidated all * selector rules into one object
        '*': {
          boxSizing: 'border-box',
          transition: 'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
        },
        html: {
          margin: 0,
          padding: 0,
          height: '100%',
          overflowX: 'hidden',
          fontSize: isMobile ? '14px' : '16px', // Base font size adjustment
        },
        body: {
          margin: 0,
          padding: 0,
          height: '100%',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          backgroundColor: darkMode ? '#121212' : '#f8faff',
          transition: 'background-color 0.3s ease',
          overflowX: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          // Touch device optimizations
          ...(isTouchDevice && {
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }),
          // High DPI display optimizations
          '@media (-webkit-min-device-pixel-ratio: 2)': {
            WebkitFontSmoothing: 'antialiased',
          },
        },
        '#root': {
          height: '100%',
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
        },
        // Device-specific scrollbar styling
        '*::-webkit-scrollbar': {
          width: isMobile ? '4px' : isTablet ? '6px' : '8px',
          height: isMobile ? '4px' : isTablet ? '6px' : '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          borderRadius: '2px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(26, 39, 82, 0.2)',
          borderRadius: '2px',
          '&:hover': {
            background: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(26, 39, 82, 0.3)',
          },
        },
        // Selection styling
        '::selection': {
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(26, 39, 82, 0.1)',
        },
        // Focus management for accessibility
        'button:focus-visible, a:focus-visible, input:focus-visible': {
          outline: `2px solid ${darkMode ? '#fff' : '#1a2752'}`,
          outlineOffset: '2px',
        },
      }}
    />
  );

  // Animation variants with device-specific optimizations
  const pageVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 5 : 15,
      scale: isMobile ? 0.99 : 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: isMobile ? 0.2 : 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: isMobile ? -5 : -15,
      scale: isMobile ? 0.99 : 0.98,
      transition: {
        duration: isMobile ? 0.15 : 0.2,
        ease: "easeIn"
      }
    }
  };

  // Loading screen with device awareness
  if (authLoading) {
    return (
      <ThemeProvider theme={dynamicTheme}>
        <CssBaseline />
        {globalStyles}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: 'background.default',
            padding: spacing.container,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CircularProgress 
              size={isMobile ? 32 : isTablet ? 40 : 50} 
              thickness={4}
              sx={{ 
                color: 'primary.main',
                filter: 'drop-shadow(0 4px 8px rgba(26, 39, 82, 0.2))'
              }} 
            />
          </motion.div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={dynamicTheme}>
      <CssBaseline />
      {globalStyles}
      
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100vw',
        overflow: 'hidden',
        maxWidth: '100%',
        position: 'relative',
        
      }}>
        {/* Sidebar with device-aware positioning */}
        <Sidebar
          userRole={user?.role || 'user'}
          open={sidebarOpen}
          onClose={handleSidebarClose}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          darkMode={darkMode}
          sx={{
            width: sidebarDimensions.width,
            flexShrink: 0,
            zIndex: isMobile ? 1300 : 1200, // Higher z-index on mobile
          }}
        />

        {/* Main Content Area with proper responsive margins */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: 'background.default',
            width: `calc(100vw - ${isMobile ? 0 : sidebarDimensions.width}px)`,
            marginLeft: isMobile ? 0 : `${sidebarDimensions.width}px`,
            transition: 'margin-left 0.3s ease, width 0.3s ease',
            position: 'relative',
          }}
        >
          {/* Fixed Topbar */}
          <Box
            sx={{
              height: topbarHeight,
              minHeight: topbarHeight,
              flexShrink: 0,
              zIndex: 1100,
              position: 'sticky',
              top: 0,
              backgroundColor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Topbar
              user={user}
              onLogout={handleLogout}
              darkMode={darkMode}
              onToggleDarkMode={handleToggleDarkMode}
              onToggleSidebar={handleToggleSidebar}
              sidebarOpen={sidebarOpen}
              loading={authLoading}
            />
          </Box>

          {/* Scrollable Main Content */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              position: 'relative',
              width: '100%',
              backgroundColor: 'background.default',
              backgroundImage: darkMode 
                ? 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)'
                : 'radial-gradient(circle at 20% 50%, rgba(26, 39, 82, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(220, 38, 127, 0.01) 0%, transparent 50%)',
            }}
          >
            {/* Content Container with device-specific constraints */}
            <Box
              sx={{
                minHeight: `calc(100vh - ${topbarHeight}px)`,
                maxWidth: '100%',
                width: '100%',
                px: spacing.container,
                py: spacing.content,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Main Content with proper width constraints */}
              <Box
                sx={{
                  flex: 1,
                  width: '100%',
                  maxWidth: {
                    xs: '100%',
                    sm: '100%',
                    md: '100%',
                    lg: '1200px',
                    xl: '1400px',
                  },
                  mx: 'auto', // Center on larger screens
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{ 
                      width: '100%',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    {pageLoading ? (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '50vh',
                          width: '100%',
                        }}
                      >
                        <CircularProgress 
                          sx={{ color: 'primary.main' }}
                          size={isMobile ? 24 : 32}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ 
                        width: '100%',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }}>
                        <Outlet />
                      </Box>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Box>

            {/* Responsive Footer */}
            <Box
              component="footer"
              sx={{
                borderTop: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                width: '100%',
                mt: 'auto',
              }}
            >
              <Box
                sx={{
                  px: spacing.container,
                  py: spacing.footer,
                  maxWidth: {
                    xs: '100%',
                    lg: '1200px',
                    xl: '1400px',
                  },
                  mx: 'auto',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 1, md: 2 },
                    textAlign: { xs: 'center', md: 'left' },
                  }}
                >
                  {/* Logo and Title */}
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          width: { xs: 16, sm: 20, md: 24 },
                          height: { xs: 16, sm: 20, md: 24 },
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #1a2752, #dc267f)',
                          flexShrink: 0,
                        }}
                      />
                    </motion.div>
                    <Box>
                      <Box
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                          color: 'text.primary',
                          mb: 0.5,
                        }}
                      >
                        Task & Asset Management
                      </Box>
                      <Box
                        sx={{
                          fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                          color: 'text.secondary',
                        }}
                      >
                        © 2025 Arf System. All rights reserved.
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Status and Version */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 0.5, sm: 1, md: 2 },
                      fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                      color: 'text.secondary',
                    }}
                  >
                    <Box>Version 2.1.0</Box>
                    {!isMobile && <Box>Professional Edition</Box>}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 4, sm: 6, md: 8 },
                          height: { xs: 4, sm: 6, md: 8 },
                          borderRadius: '50%',
                          backgroundColor: '#4caf50',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 },
                          },
                        }}
                      />
                      System Online
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Mobile Backdrop */}
        {isMobile && sidebarOpen && (
          <Backdrop
            sx={{ 
              zIndex: 1250,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            open={sidebarOpen}
            onClick={handleSidebarClose}
          />
        )}

        {/* Global Loading Overlay */}
        <AnimatePresence>
          {pageLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Backdrop
                sx={{ 
                  zIndex: 1400,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(4px)',
                }}
                open={pageLoading}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress 
                    sx={{ 
                      color: 'primary.main',
                      mb: 2,
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                    }}
                    size={isMobile ? 32 : 40}
                  />
                  <Box
                    sx={{
                      color: 'white',
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      fontWeight: 500,
                    }}
                  >
                    Loading...
                  </Box>
                </Box>
              </Backdrop>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;