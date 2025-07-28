import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Box,
  TextField,
  InputAdornment,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Drawer,
  List,
  ListItem,
  Popover,
  useTheme,
  useMediaQuery,
  Tooltip,
  Button,
  Skeleton,
  Paper,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Task as TaskIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Clear as ClearIcon,
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as MarkReadIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Language as LanguageIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import your API functions and socket hook
import { getUserNotifications, markNotificationAsRead} from '../../Api/notificationApi'; // Adjust path as needed
import { performGlobalSearch } from '../../Api/searchApi'; // Adjust path as needed
import { useSocket } from '../../contexts/SocketContext'; // Adjust path as needed

const Topbar = ({ 
  user = {}, 
  onLogout, 
  darkMode = false, 
  onToggleDarkMode, 
  onToggleSidebar, 
  sidebarOpen = false,
  loading = false 
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const socket = useSocket();
  
  // State management
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const searchRef = useRef(null);
  

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await getUserNotifications();
      setNotifications(res);
    } catch (err) {
      console.error('Fetch notifications failed:', err);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Socket listener for real-time notifications
  useEffect(() => {
    if (!socket) return;
    
    socket.on('newNotification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => {
      socket.off('newNotification');
    };
  }, [socket]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Enhanced event handlers with error handling
  const handleUserMenuOpen = useCallback((event) => {
    setUserMenuAnchor(event.currentTarget);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setUserMenuAnchor(null);
  }, []);

  const handleNotificationOpen = useCallback((event) => {
    setNotificationAnchor(event.currentTarget);
  }, []);

  const handleNotificationClose = useCallback(() => {
    setNotificationAnchor(null);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      handleUserMenuClose();
      if (onLogout) {
        await onLogout();
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [onLogout, navigate, handleUserMenuClose]);

  // Enhanced search with debouncing



const handleSearch = useCallback(async (value) => {
  setSearchValue(value);

  if (value.length > 2) {
    setSearchLoading(true);
    
    try {
      const { tasks = [], users = [], notifications = [] } = await performGlobalSearch(value || '');


      const taskResults = tasks.map((t) => ({
        type: 'Task',
        label: t.title,
        sub: `Status: ${t.status}, Priority: ${t.priority}`,
        path: `/tasks/${t._id}`,
      }));

      const userResults = users.map((u) => ({
        type: 'User',
        label: u.name,
        sub: u.email,
        path: `/users/${u._id}`,
      }));

      const notificationResults = notifications.map((n) => ({
        type: 'Notification',
        label: n.message,
        sub: new Date(n.createdAt).toLocaleString(),
        path: `/notifications`, // Or `/notifications/${n._id}` if detailed view exists
      }));

      const mergedResults = [...taskResults, ...userResults, ...notificationResults];

      setSearchResults(mergedResults);
      setSearchOpen(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  } else {
    setSearchResults([]);
    setSearchOpen(false);
    setSearchLoading(false);
  }
}, []);

const handleSearchSelect = useCallback((result) => {
  if (result?.path) {
    navigate(result.path);
  }
  setSearchValue('');
  setSearchResults([]);
  setSearchOpen(false);
  setShowMobileSearch(false);
}, [navigate]);

const clearSearch = useCallback(() => {
  setSearchValue('');
  setSearchResults([]);
  setSearchOpen(false);
  setSearchLoading(false);
}, []);

  // Mark notification as read
  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Mark as read failed:', err);
    }
  };

  const markAllAsRead = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      // Assuming you have an API function to mark all as read
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all as read failed:', err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [notifications]);

  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, []);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.log('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.log('Failed to exit fullscreen:', err);
      });
    }
  }, []);

  // Mobile sidebar toggle handler with proper event handling
  const handleSidebarToggle = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Sidebar toggle clicked'); // Debug log
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  }, [onToggleSidebar]);

  const getSearchIcon = (type) => {
    switch (type) {
      case 'task': return <TaskIcon fontSize="small" />;
      case 'user': return <PersonIcon fontSize="small" />;
      case 'department': return <BusinessIcon fontSize="small" />;
      default: return <SearchIcon fontSize="small" />;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task': return <TaskIcon fontSize="small" />;
      case 'user': return <PersonIcon fontSize="small" />;
      case 'meeting': return <GroupIcon fontSize="small" />;
      case 'system': return <SettingsIcon fontSize="small" />;
      default: return <NotificationsIcon fontSize="small" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task': return '#1a2752';
      case 'role': return '#dc267f';
      case 'meeting': return '#ff9800';
      case 'system': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc267f';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': 
      case 'In Progress': return '#4caf50';
      case 'Pending': return '#ff9800';
      case 'Inactive': return '#9e9e9e';
      default: return '#1a2752';
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          // Ensure high z-index to prevent overlapping
          zIndex: (theme) => Math.max(theme.zIndex.drawer + 1, 1300),
          background: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
          boxShadow: '0 4px 20px rgba(26, 39, 82, 0.15)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          // Ensure the AppBar doesn't have pointer-events issues
          pointerEvents: 'auto',
        }}
      >
        <Toolbar 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 }, 
            minHeight: { xs: 56, sm: 64 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            // Ensure toolbar has proper positioning
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left Section - Mobile Menu + Logo */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            minWidth: 0, 
            flex: isMobile ? 1 : '0 0 auto',
            // Ensure proper z-index for the left section
            zIndex: 2,
          }}>
            {/* Mobile Menu Button with improved styling and event handling */}
            {isMobile && (
              <Tooltip title="Toggle Navigation">
                <IconButton
                  color="inherit"
                  onClick={handleSidebarToggle}
                  size="medium"
                  sx={{ 
                    mr: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    width: 44, // Increased size for better touch target
                    height: 44,
                    minWidth: 44, // Ensure minimum width
                    minHeight: 44, // Ensure minimum height
                    border: '1px solid rgba(255, 255, 255, 0.2)', // Added border for visibility
                    // Ensure button is always clickable
                    pointerEvents: 'auto',
                    zIndex: 10, // High z-index to prevent overlapping
                    position: 'relative', // Ensure proper stacking context
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    // Ensure button is visible on all backgrounds
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <MenuIcon 
                    fontSize="medium" 
                    sx={{ 
                      color: 'white',
                      // Ensure icon is properly positioned
                      display: 'block',
                    }} 
                  />
                </IconButton>
              </Tooltip>
            )}

            {/* Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Avatar
                sx={{
                  backgroundColor: '#dc267f',
                  mr: { xs: 1, sm: 4 },
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  display: { xs: isMobile ? 'flex' : 'none', sm: 'flex' },
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 127, 0.3)',
                }}
                onClick={() => navigate('/dashboard')}
              >
                <TaskIcon fontSize={isMobile ? 'small' : 'medium'} />
              </Avatar>
              
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: { xs: 'none', md: 'block' },
                    cursor: 'pointer',
                    fontSize: { md: '1.1rem', lg: '1.25rem' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  Task & Asset Management
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    display: { xs: 'block', md: 'none' },
                    cursor: 'pointer',
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  TAM
                </Typography>
                {!isMobile && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      display: { xs: 'none', lg: 'block' },
                      fontSize: '0.7rem'
                    }}
                  >
                    Professional Edition
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Center Section - Desktop Search Bar */}
          {!isMobile && (
            <Box
              ref={searchRef}
              sx={{
                position: 'relative',
                flex: '1 1 auto',
                maxWidth: { md: 350, lg: 450 },
                mx: { md: 2, lg: 3 }
              }}
            >
              <TextField
                placeholder="Search tasks, users, departments..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {searchLoading ? (
                        <RefreshIcon 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)', 
                            fontSize: 20,
                          }} 
                        />
                      ) : (
                        <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      )}
                    </InputAdornment>
                  ),
                  endAdornment: searchValue && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={clearSearch}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 3,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #dc267f',
                      boxShadow: '0 0 0 3px rgba(220, 38, 127, 0.1)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        opacity: 1,
                      },
                    },
                  }
                }}
              />

              {/* Search Results Dropdown */}
              {searchOpen && (searchResults.length > 0 || searchLoading) && (
                <Paper
                  elevation={8}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    mt: 1,
                    zIndex: 1300,
                    maxHeight: 400,
                    overflow: 'auto',
                    borderRadius: 2,
                    border: '1px solid rgba(26, 39, 82, 0.1)',
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': { 
                      backgroundColor: 'rgba(26, 39, 82, 0.3)',
                      borderRadius: '3px'
                    }
                  }}
                >
                  {searchLoading ? (
                    <Box sx={{ p: 2 }}>
                      {[1, 2, 3].map((i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Skeleton variant="text" width="80%" />
                            <Skeleton variant="text" width="60%" />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {searchResults.map((result, index) => (
                        <ListItem
                          key={`${result.type}-${result.label}-${index}`}
                          button
                          onClick={() => handleSearchSelect(result)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(26, 39, 82, 0.04)',
                            },
                            borderBottom: index < searchResults.length - 1 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                            py: 1.5
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 45 }}>
                            <Avatar
                              sx={{
                                width: 35,
                                height: 35,
                                backgroundColor: getStatusColor(result.status),
                                fontSize: '0.875rem'
                              }}
                            >
                              {getSearchIcon(result.type)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                           primary={
    <Typography
      component="span"
      variant="subtitle1"
      sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}
    >
      {result.title || result.label}
      <Chip
        label={result.status}
        size="small"
        sx={{
          backgroundColor: getStatusColor(result.status),
          color: 'white',
          fontSize: '0.7rem',
          height: 20,
          ml: 1,
        }}
      />
    </Typography>
  }
  secondary={
    <Typography component="span" variant="body2" color="text.secondary">
      {result.description}
    </Typography>
  }
/>

<Typography
  variant="caption"
  sx={{
    textTransform: 'capitalize',
    color: 'text.secondary',
    fontWeight: 500,
    mt: 0.5,
  }}
>
  {result.type}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  )}
                  
                  {!searchLoading && searchResults.length === 0 && searchValue.length > 2 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No results found for "{searchValue}"
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          )}

          {/* Right Section - Controls */}
          <Stack 
            direction="row" 
            spacing={{ xs: 0.5, sm: 1 }} 
            alignItems="center"
            sx={{ 
              flex: '0 0 auto',
              // Ensure right section has proper z-index
              zIndex: 1,
            }}
          >
            {/* Mobile Search Button */}
            {isMobile && (
              <Tooltip title="Search">
                <IconButton
                  color="inherit"
                  onClick={() => setShowMobileSearch(true)}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    width: 36,
                    height: 36,
                  }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Fullscreen Toggle - Desktop/Tablet Only */}
            {!isMobile && (
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <IconButton
                  color="inherit"
                  onClick={toggleFullscreen}
                  size={isTablet ? 'small' : 'medium'}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    width: { sm: 36, md: 40 },
                    height: { sm: 36, md: 40 },
                  }}
                >
                  {isFullscreen ? 
                    <FullscreenExitIcon fontSize={isTablet ? 'small' : 'medium'} /> : 
                    <FullscreenIcon fontSize={isTablet ? 'small' : 'medium'} />
                  }
                </IconButton>
              </Tooltip>
            )}

            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                color="inherit"
                onClick={onToggleDarkMode}
                size={isMobile ? 'small' : isTablet ? 'small' : 'medium'}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width: { xs: 36, sm: 36, md: 40 },
                  height: { xs: 36, sm: 36, md: 40 },
                }}
              >
                {darkMode ? 
                  <LightModeIcon fontSize={isMobile ? 'small' : isTablet ? 'small' : 'medium'} /> : 
                  <DarkModeIcon fontSize={isMobile ? 'small' : isTablet ? 'small' : 'medium'} />
                }
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={handleNotificationOpen}
                size={isMobile ? 'small' : isTablet ? 'small' : 'medium'}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  width: { xs: 36, sm: 36, md: 40 },
                  height: { xs: 36, sm: 36, md: 40 },
                }}
              >
                <Badge 
                  badgeContent={unreadNotifications} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: 16,
                      minWidth: 16,
                    }
                  }}
                >
                  <NotificationsIcon fontSize={isMobile ? 'small' : isTablet ? 'small' : 'medium'} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Account Menu">
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  p: 0,
                  ml: { xs: 0.5, sm: 1 },
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: '#dc267f',
                  }
                }}
              >
                {loading ? (
                  <Skeleton variant="circular" width={isMobile ? 36 : 40} height={isMobile ? 36 : 40} />
                ) : (
                  <Avatar
                    sx={{
                      backgroundColor: '#dc267f',
                      width: { xs: 36, sm: 40 },
                      height: { xs: 36, sm: 40 },
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(220, 38, 127, 0.3)',
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Mobile Search Drawer */}
      <Drawer
        anchor="top"
        open={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
            color: 'white',
            // Ensure mobile search drawer has proper z-index
            zIndex: 1400,
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              autoFocus
              placeholder="Search tasks, users, departments..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {searchLoading ? (
                      <RefreshIcon 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          fontSize: 20,
                        }} 
                      />
                    ) : (
                      <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    )}
                  </InputAdornment>
                ),
                endAdornment: searchValue && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: '2px solid #dc267f',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      opacity: 1,
                    },
                  },
                }
              }}
            />
            <IconButton
              color="inherit"
              onClick={() => setShowMobileSearch(false)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                width: 36,
                height: 36,
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Mobile Search Results */}
          {searchLoading ? (
            <Box sx={{ p: 1 }}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="80%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : searchResults.length > 0 ? (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {searchResults.map((result, index) => (
                <ListItem
                  key={result.id}
                  button
                  onClick={() => handleSearchSelect(result)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 45 }}>
                    <Avatar
                      sx={{
                        width: 35,
                        height: 35,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                    >
                      {getSearchIcon(result.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
                          {result.title}
                        </Typography>
                        <Chip
                          label={result.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(result.status),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 18
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {result.description}
                      </Typography>
                    }
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: 'capitalize',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 500
                    }}
                  >
                    {result.type}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : searchValue.length > 2 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                No results found for "{searchValue}"
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Drawer>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: { xs: '90vw', sm: 380 },
            maxWidth: 400,
            maxHeight: 500,
            borderRadius: 3,
            mt: 1,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(26, 39, 82, 0.1)',
            // Ensure notifications popover has proper z-index
            zIndex: 1350,
          }
        }}
      >
        {/* Notifications Header */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2752' }}>
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={refreshNotifications}
                  disabled={notificationsLoading}
                  sx={{ color: '#1a2752' }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {unreadNotifications > 0 && (
                <Tooltip title="Mark all as read">
                  <IconButton
                    size="small"
                    onClick={markAllAsRead}
                    disabled={notificationsLoading}
                    sx={{ color: '#dc267f' }}
                  >
                    <MarkReadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {unreadNotifications > 0 && (
              <Chip
                label={`${unreadNotifications} new`}
                size="small"
                sx={{
                  backgroundColor: '#dc267f',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {notifications.length} total notifications
            </Typography>
          </Box>
        </Box>

        {/* Notifications List */}
        <List sx={{ p: 0, maxHeight: 320, overflow: 'auto' }}>
          {notificationsLoading ? (
            Array.from({ length: 3 }, (_, i) => (
              <ListItem key={i} sx={{ py: 2 }}>
                <ListItemIcon>
                  <Skeleton variant="circular" width={45} height={45} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton variant="text" width="80%" />}
                  secondary={<Skeleton variant="text" width="60%" />}
                />
              </ListItem>
            ))
          ) : notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No notifications"
                secondary="You're all caught up!"
                sx={{ textAlign: 'center' }}
              />
            </ListItem>
          ) : (
            notifications.map((notification, index) => (
              <ListItem
                key={notification._id}
                button
                sx={{
                  borderBottom: index < notifications.length - 1 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                  backgroundColor: notification.read ? 'transparent' : 'rgba(220, 38, 127, 0.04)',
                  '&:hover': {
                    backgroundColor: notification.read ? 'rgba(26, 39, 82, 0.04)' : 'rgba(220, 38, 127, 0.08)',
                  },
                  py: 1.5,
                  position: 'relative'
                }}
                onClick={() => handleMarkRead(notification._id)}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      backgroundColor: getNotificationColor(notification.type),
                      width: 45,
                      height: 45,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: notification.read ? 500 : 700,
                          color: notification.read ? 'text.primary' : '#1a2752'
                        }}
                      >
                        {notification.title || notification.message}
                      </Typography>
                      {notification.priority && (
                        <Chip
                          label={notification.priority}
                          size="small"
                          sx={{
                            backgroundColor: getPriorityColor(notification.priority),
                            color: 'white',
                            fontSize: '0.65rem',
                            height: 16,
                            textTransform: 'capitalize'
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      {notification.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 0.5,
                            fontWeight: notification.read ? 400 : 500
                          }}
                        >
                          {notification.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                {!notification.read && (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#dc267f',
                    }}
                  />
                )}
              </ListItem>
            ))
          )}
        </List>

        {/* Notifications Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: '#1a2752',
              color: '#1a2752',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#dc267f',
                color: '#dc267f',
                backgroundColor: 'rgba(220, 38, 127, 0.04)'
              },
            }}
            onClick={() => {
              handleNotificationClose();
              navigate('/notifications');
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Popover>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            width: { xs: 260, sm: 280 },
            borderRadius: 3,
            mt: 1,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(26, 39, 82, 0.1)',
            overflow: 'visible',
            // Ensure user menu has proper z-index
            zIndex: 1350,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box 
          sx={{ 
            p: 2.5, 
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {loading ? (
              <>
                <Skeleton variant="circular" width={54} height={54} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rectangular" width={60} height={20} sx={{ mt: 0.5, borderRadius: 1 }} />
                </Box>
              </>
            ) : (
              <>
                <Avatar
                  sx={{
                    backgroundColor: '#1a2752',
                    width: 54,
                    height: 54,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(26, 39, 82, 0.3)',
                    flexShrink: 0
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#1a2752',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {user?.name || 'User Name'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 0.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {user?.email || 'user@example.com'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={user?.role || 'user'}
                      size="small"
                      icon={user?.role === 'admin' ? <AdminIcon /> : user?.role === 'coordinator' ? <BusinessIcon /> : <PersonIcon />}
                      sx={{
                        backgroundColor: user?.role === 'admin' ? '#dc267f' : user?.role === 'coordinator' ? '#ff9800' : '#4caf50',
                        color: 'white',
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                    {user?.department && (
                      <Typography variant="caption" color="text.secondary">
                        {user.department}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Menu Items */}
        <Box sx={{ py: 1 }}>
          <MenuItem 
            onClick={() => { 
              handleUserMenuClose(); 
              navigate('/profile'); 
            }}
            sx={{
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(26, 39, 82, 0.04)',
              }
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ width: 35, height: 35, backgroundColor: '#1a2752' }}>
                <AccountIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="My Profile"
              secondary="View and edit your profile"
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>

          <MenuItem 
            onClick={() => { 
              handleUserMenuClose(); 
              navigate('/settings'); 
            }}
            sx={{
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(26, 39, 82, 0.04)',
              }
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ width: 35, height: 35, backgroundColor: '#ff9800' }}>
                <SettingsIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              secondary="Preferences and configuration"
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>

          <MenuItem 
            onClick={() => { 
              handleUserMenuClose(); 
              navigate('/help'); 
            }}
            sx={{
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(26, 39, 82, 0.04)',
              }
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ width: 35, height: 35, backgroundColor: '#4caf50' }}>
                <HelpIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="Help & Support"
              secondary="Documentation and support"
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        </Box>

        <Divider />

        {/* Logout */}
        <MenuItem 
          onClick={handleLogout} 
          sx={{ 
            py: 1.5,
            color: '#dc267f',
            '&:hover': {
              backgroundColor: 'rgba(220, 38, 127, 0.04)',
            }
          }}
        >
          <ListItemIcon>
            <Avatar sx={{ width: 35, height: 35, backgroundColor: '#dc267f' }}>
              <LogoutIcon fontSize="small" sx={{ color: 'white' }} />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            secondary="Sign out of your account"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default Topbar;