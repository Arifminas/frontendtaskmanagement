import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  List,
  ListItem,
  Popover,
  useTheme,
  useMediaQuery,
  Tooltip,
  Skeleton,
  Paper,
  Stack,
  alpha,
  CircularProgress,
  Fade,
  ClickAwayListener
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Task as TaskIcon,
  Clear as ClearIcon,
  AccountCircle as AccountIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as MarkReadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

// Import your API functions and socket hook
import { getUserNotifications, markNotificationAsRead } from '../../Api/notificationApi';
import { performGlobalSearch } from '../../Api/searchApi';
import { useSocket } from '../../contexts/SocketContext';

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
  const [searchLoading, setSearchLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Memoized values
  const unreadNotifications = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const userInitial = useMemo(
    () => user?.name?.charAt(0)?.toUpperCase() || 'U',
    [user?.name]
  );

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const res = await getUserNotifications();
      setNotifications(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Fetch notifications failed:', err);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  // Socket listener for real-time notifications
  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (data) => {
      setNotifications(prev => [data, ...prev]);
    };

    socket.on('newNotification', handleNewNotification);
    return () => socket.off('newNotification', handleNewNotification);
  }, [socket]);

  // Event handlers
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
      // Clear any stored tokens/data
      localStorage.removeItem('token');
      sessionStorage.clear();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation even if logout fails
      navigate('/login', { replace: true });
    }
  }, [onLogout, navigate, handleUserMenuClose]);

  // Enhanced debounced search with better error handling
  const debouncedSearch = useCallback(
    debounce(async (value) => {
      if (!value || value.length < 2) {
        setSearchResults([]);
        setSearchOpen(false);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await performGlobalSearch(value);
        const { tasks = [], users = [], notifications: searchNotifications = [] } = response || {};
        
        const results = [
          ...tasks.map(t => ({
            id: t._id,
            type: 'task',
            label: t.title || 'Untitled Task',
            sub: `Status: ${t.status || 'Unknown'} • Priority: ${t.priority || 'Normal'}`,
            path: `/tasks/${t._id}`,
            status: t.status,
            priority: t.priority,
            icon: TaskIcon,
            color: getStatusColor(t.status)
          })),
          ...users.map(u => ({
            id: u._id,
            type: 'user',
            label: u.name || 'Unknown User',
            sub: u.email || 'No email',
            path: `/users/${u._id}`,
            icon: PersonIcon,
            color: '#2196f3'
          })),
          ...searchNotifications.map(n => ({
            id: n._id,
            type: 'notification',
            label: n.message || 'Notification',
            sub: new Date(n.createdAt).toLocaleString(),
            path: `/notifications`,
            icon: NotificationsIcon,
            color: '#ff9800'
          }))
        ];
        
        setSearchResults(results);
        setSearchOpen(results.length > 0);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        setSearchOpen(false);
      } finally {
        setSearchLoading(false);
      }
    }, 400),
    []
  );

  const handleSearch = useCallback((value) => {
    setSearchValue(value);
    if (value.trim()) {
      debouncedSearch(value.trim());
    } else {
      clearSearch();
    }
  }, [debouncedSearch]);

  const handleSearchSelect = useCallback((result, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (result?.path) {
      try {
        // Clear search state first
        clearSearch();
        
        // Navigate to the selected item
        if (result.path.startsWith('http')) {
          window.open(result.path, '_blank');
        } else {
          navigate(result.path);
        }
        
        // Track search analytics (optional)
        console.log('Search selected:', result.type, result.label);
      } catch (error) {
        console.error('Navigation failed:', error);
      }
    }
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setSearchValue('');
    setSearchResults([]);
    setSearchOpen(false);
    setSearchLoading(false);
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
    if (searchValue.trim() && searchResults.length > 0) {
      setSearchOpen(true);
    }
  }, [searchValue, searchResults.length]);

  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
    // Delay closing to allow for click events
    setTimeout(() => {
      if (!searchFocused) {
        setSearchOpen(false);
      }
    }, 200);
  }, [searchFocused]);

  const handleClickAway = useCallback(() => {
    setSearchOpen(false);
    setSearchFocused(false);
  }, []);

  // Keyboard navigation for search results
  const handleSearchKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      clearSearch();
      searchInputRef.current?.blur();
    } else if (event.key === 'Enter' && searchResults.length > 0) {
      handleSearchSelect(searchResults[0], event);
    }
  }, [searchResults, clearSearch, handleSearchSelect]);

  const handleMarkRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Mark as read failed:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all as read failed:', err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [notifications]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.log('Failed to exit fullscreen:', err);
      });
    }
  }, []);

  // Handle fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Helper functions
  const getStatusColor = useCallback((status) => {
    const colors = {
      'completed': '#4caf50',
      'in-progress': '#2196f3',
      'ongoing': '#2196f3',
      'pending': '#ff9800',
      'overdue': '#f44336',
      'cancelled': '#9e9e9e',
      'active': '#4caf50',
      'inactive': '#9e9e9e'
    };
    return colors[status?.toLowerCase()] || '#1a2752';
  }, []);

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      'high': '#f44336',
      'medium': '#ff9800',
      'low': '#4caf50',
      'urgent': '#d32f2f',
      'critical': '#b71c1c'
    };
    return colors[priority?.toLowerCase()] || '#666';
  }, []);

  const handleNavigation = useCallback((path) => {
    handleUserMenuClose();
    navigate(path);
  }, [navigate, handleUserMenuClose]);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 }, 
            minHeight: { xs: 56, sm: 64 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Left Section - Logo */}
          <Box sx={{ 
            flex: { xs: '0 0 auto', lg: '1 1 0' },
            display: 'flex',
            alignItems: 'center'
          }}>
            {!isMobile && !isTablet && (
              <>
                <Avatar
                  sx={{
                    backgroundColor: '#dc267f',
                    mr: 2,
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  <TaskIcon />
                </Avatar>
                <Typography
                  variant="h6"
                  noWrap
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  Task & Asset Management
                </Typography>
              </>
            )}
          </Box>

          {/* Center Section - Enhanced Search Bar */}
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box
              ref={searchRef}
              sx={{
                position: 'relative',
                flex: { xs: '1 1 auto', lg: '0 0 auto' },
                maxWidth: { xs: '100%', sm: 400, md: 500, lg: 600 },
                mx: { xs: 0, lg: 3 },
                mr: { xs: 1, sm: 2 }
              }}
            >
              <TextField
                ref={searchInputRef}
                placeholder="Search tasks, users, assets..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onKeyDown={handleSearchKeyDown}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {searchLoading ? (
                        <CircularProgress size={20} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
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
                        sx={{ 
                          transition: 'transform 0.2s ease',
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        <ClearIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: alpha(theme.palette.common.white, searchFocused ? 0.25 : 0.15),
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: searchFocused ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.25),
                    },
                    '& input': {
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        opacity: 1,
                      },
                    },
                    transition: 'all 0.3s ease'
                  }
                }}
              />

              {/* Enhanced Search Results */}
              <Fade in={searchOpen && searchResults.length > 0}>
                <Paper
                  elevation={8}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    mt: 1,
                    maxHeight: 400,
                    overflow: 'hidden',
                    zIndex: theme.zIndex.modal,
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <List sx={{ p: 0 }}>
                      {searchResults.map((result, index) => {
                        const IconComponent = result.icon;
                        return (
                          <ListItem
                            key={`${result.type}-${result.id}-${index}`}
                            onClick={(e) => handleSearchSelect(result, e)}
                            sx={{
                              cursor: 'pointer',
                              borderBottom: index < searchResults.length - 1 ? '1px solid' : 'none',
                              borderColor: 'divider',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                transform: 'translateX(4px)'
                              },
                              transition: 'all 0.2s ease',
                              py: 1.5
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  backgroundColor: result.color,
                                  fontSize: '0.9rem'
                                }}
                              >
                                <IconComponent fontSize="small" />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {result.label}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {result.sub}
                                </Typography>
                              }
                              sx={{ mr: 1 }}
                            />
                            <ArrowForwardIcon 
                              fontSize="small" 
                              sx={{ 
                                color: 'text.secondary',
                                opacity: 0.5,
                                transition: 'opacity 0.2s ease'
                              }} 
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                  
                  {searchResults.length > 0 && (
                    <Box sx={{ 
                      p: 1, 
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Fade>
            </Box>
          </ClickAwayListener>

          {/* Right Section - Action Icons */}
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center" 
            sx={{ flex: { xs: '0 0 auto', lg: '1 1 0' }, justifyContent: 'flex-end' }}
          >
            {/* Fullscreen Toggle - Desktop Only */}
            {!isMobile && !isTablet && (
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <IconButton 
                  color="inherit" 
                  onClick={toggleFullscreen}
                  sx={{ 
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            )}

            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton 
                color="inherit" 
                onClick={onToggleDarkMode}
                sx={{ 
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title={`${unreadNotifications} unread notifications`}>
              <IconButton 
                color="inherit" 
                onClick={handleNotificationOpen}
                sx={{ 
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <Badge 
                  badgeContent={unreadNotifications} 
                  color="error"
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      minWidth: 18,
                      height: 18
                    }
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title={`${user?.name || 'User'} - Click for menu`}>
              <IconButton 
                onClick={handleUserMenuOpen} 
                sx={{ 
                  p: 0.5,
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: '#dc267f',
                    width: 36,
                    height: 36,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {userInitial}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Enhanced Notifications Popover */}
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { 
            width: { xs: '90vw', sm: 360 }, 
            maxWidth: 400, 
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
              {unreadNotifications > 0 && (
                <Chip 
                  label={unreadNotifications} 
                  size="small" 
                  color="error" 
                  sx={{ ml: 1, fontSize: '0.7rem' }} 
                />
              )}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton 
                  size="small" 
                  onClick={fetchNotifications}
                  disabled={notificationsLoading}
                  sx={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.1)' } }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              {unreadNotifications > 0 && (
                <Tooltip title="Mark all as read">
                  <IconButton 
                    size="small" 
                    onClick={markAllAsRead}
                    disabled={notificationsLoading}
                    sx={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.1)' } }}
                  >
                    <MarkReadIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Box>

        <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
          {notificationsLoading ? (
            [...Array(3)].map((_, i) => (
              <ListItem key={i} sx={{ py: 2 }}>
                <ListItemIcon>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton width="80%" />}
                  secondary={<Skeleton width="60%" />}
                />
              </ListItem>
            ))
          ) : notifications.length === 0 ? (
            <ListItem sx={{ py: 4 }}>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    No notifications
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    You're all caught up! 🎉
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification._id}
                onClick={() => handleMarkRead(notification._id)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                  borderLeft: notification.read ? 'none' : `3px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, notification.read ? 0.05 : 0.1),
                  },
                  transition: 'all 0.2s ease',
                  py: 1.5
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ 
                    backgroundColor: notification.read ? 'grey.400' : 'primary.main',
                    width: 36,
                    height: 36
                  }}>
                    <NotificationsIcon fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: notification.read ? 400 : 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Popover>

      {/* Enhanced User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: { 
            width: 300, 
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              sx={{ 
                backgroundColor: 'primary.main', 
                width: 56, 
                height: 56,
                fontSize: '1.2rem',
                fontWeight: 700
              }}
            >
              {userInitial}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap sx={{ fontWeight: 600, mb: 0.5 }}>
                {user?.name || 'User Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                {user?.email || 'user@example.com'}
              </Typography>
              <Chip
                label={user?.role || 'user'}
                size="small"
                sx={{ 
                  textTransform: 'capitalize',
                  fontSize: '0.7rem',
                  height: 20
                }}
                color={user?.role === 'admin' ? 'error' : user?.role === 'coordinator' ? 'warning' : 'primary'}
              />
            </Box>
          </Stack>
        </Box>

        <MenuItem 
          onClick={() => handleNavigation('/profile')}
          sx={{ 
            py: 1.5,
            '&:hover': { 
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ListItemIcon>
            <AccountIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="My Profile" 
            secondary="View and edit profile"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        <MenuItem 
          onClick={() => handleNavigation('/settings')}
          sx={{ 
            py: 1.5,
            '&:hover': { 
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ListItemIcon>
            <SettingsIcon color="action" />
          </ListItemIcon>
          <ListItemText 
            primary="Settings" 
            secondary="Preferences & configuration"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        <MenuItem 
          onClick={() => handleNavigation('/help')}
          sx={{ 
            py: 1.5,
            '&:hover': { 
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ListItemIcon>
            <HelpIcon color="info" />
          </ListItemIcon>
          <ListItemText 
            primary="Help & Support" 
            secondary="Get assistance"
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem 
          onClick={handleLogout} 
          sx={{ 
            py: 1.5,
            color: 'error.main',
            '&:hover': { 
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              transform: 'translateX(4px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <ListItemIcon>
            <LogoutIcon color="error" />
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