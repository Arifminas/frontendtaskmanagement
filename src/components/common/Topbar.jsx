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
  Stack,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Close as CloseIcon,
  Task as TaskIcon,
  Clear as ClearIcon,
  AccountCircle as AccountIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as MarkReadIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';

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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const searchRef = useRef(null);

  // Memoized values
  const unreadNotifications = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const userInitial = useMemo(
    () => user?.name?.charAt(0)?.toUpperCase() || 'U',
    [user?.name]
  );

  // Navigation menu items
  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await getUserNotifications();
      setNotifications(res || []);
    } catch (err) {
      console.error('Fetch notifications failed:', err);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Socket listener
  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (data) => {
      setNotifications(prev => [data, ...prev]);
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
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
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [onLogout, navigate, handleUserMenuClose]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (value) => {
      if (value.length > 2) {
        setSearchLoading(true);
        try {
          const { tasks = [], users = [], notifications = [] } = await performGlobalSearch(value);
          
          const results = [
            ...tasks.map(t => ({
              type: 'task',
              label: t.title,
              sub: `Status: ${t.status}, Priority: ${t.priority}`,
              path: `/tasks/${t._id}`,
              status: t.status,
              priority: t.priority
            })),
            ...users.map(u => ({
              type: 'user',
              label: u.name,
              sub: u.email,
              path: `/users/${u._id}`
            })),
            ...notifications.map(n => ({
              type: 'notification',
              label: n.message,
              sub: new Date(n.createdAt).toLocaleString(),
              path: `/notifications`
            }))
          ];
          
          setSearchResults(results);
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
      }
    }, 300),
    []
  );

  const handleSearch = useCallback((value) => {
    setSearchValue(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleSearchSelect = useCallback((result) => {
    if (result?.path) {
      navigate(result.path);
    }
    clearSearch();
    setShowMobileSearch(false);
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setSearchValue('');
    setSearchResults([]);
    setSearchOpen(false);
    setSearchLoading(false);
    debouncedSearch.cancel();
  }, [debouncedSearch]);

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

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper functions
  const getSearchIcon = (type) => {
    const icons = {
      task: TaskIcon,
      user: PersonIcon,
      notification: NotificationsIcon
    };
    const Icon = icons[type] || SearchIcon;
    return <Icon fontSize="small" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#4caf50',
      'In Progress': '#4caf50',
      'Pending': '#ff9800',
      'Inactive': '#9e9e9e'
    };
    return colors[status] || '#1a2752';
  };

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
          {/* Left Section - Logo only on desktop */}
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
                  }}
                >
                  Task & Asset Management
                </Typography>
              </>
            )}
          </Box>

          {/* Center Section - Search Bar */}
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
              placeholder="Search tasks, users, assets..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </InputAdornment>
                ),
                endAdornment: searchValue && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
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
                }
              }}
            />

            {/* Search Results */}
            {searchOpen && searchResults.length > 0 && (
              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 1,
                  maxHeight: 400,
                  overflow: 'auto',
                  zIndex: theme.zIndex.modal,
                }}
              >
                <List sx={{ p: 0 }}>
                  {searchResults.map((result, index) => (
                    <ListItem
                      key={index}
                      button
                      onClick={() => handleSearchSelect(result)}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 0 }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: getStatusColor(result.status) }}>
                          {getSearchIcon(result.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={result.label}
                        secondary={result.sub}
                        primaryTypographyProps={{ noWrap: true }}
                        secondaryTypographyProps={{ noWrap: true }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>

          {/* Right Section - All Icons */}
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center" 
            sx={{ flex: { xs: '0 0 auto', lg: '1 1 0' }, justifyContent: 'flex-end' }}
          >
            {/* Fullscreen Toggle - Desktop Only */}
            {!isMobile && !isTablet && (
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <IconButton color="inherit" onClick={toggleFullscreen}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            )}

            {/* Dark Mode Toggle */}
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton color="inherit" onClick={onToggleDarkMode}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationOpen}>
                <Badge badgeContent={unreadNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Account">
              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    backgroundColor: '#dc267f',
                    width: 36,
                    height: 36,
                  }}
                >
                  {userInitial}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: { xs: '90vw', sm: 360 }, maxWidth: 400, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={fetchNotifications}>
                <RefreshIcon />
              </IconButton>
              {unreadNotifications > 0 && (
                <IconButton size="small" onClick={markAllAsRead}>
                  <MarkReadIcon />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Box>

        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notificationsLoading ? (
            [...Array(3)].map((_, i) => (
              <ListItem key={i}>
                <ListItemIcon>
                  <Skeleton variant="circular" width={40} height={40} />
                </ListItemIcon>
                <ListItemText
                  primary={<Skeleton />}
                  secondary={<Skeleton />}
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
            notifications.map((notification) => (
              <ListItem
                key={notification._id}
                button
                onClick={() => handleMarkRead(notification._id)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ backgroundColor: notification.read ? 'grey.400' : 'primary.main' }}>
                    <NotificationsIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString()}
                  primaryTypographyProps={{
                    fontWeight: notification.read ? 400 : 600
                  }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Popover>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: { width: 280, mt: 1 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ backgroundColor: 'primary.main', width: 48, height: 48 }}>
              {userInitial}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap fontWeight={600}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user?.email || 'user@example.com'}
              </Typography>
              <Chip
                label={user?.role || 'user'}
                size="small"
                sx={{ mt: 0.5, textTransform: 'capitalize' }}
                color={user?.role === 'admin' ? 'error' : 'primary'}
              />
            </Box>
          </Stack>
        </Box>

        <MenuItem onClick={() => { handleUserMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <AccountIcon />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>

        <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        <MenuItem onClick={() => { handleUserMenuClose(); navigate('/help'); }}>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default Topbar;