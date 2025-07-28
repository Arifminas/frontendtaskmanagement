import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Skeleton,
  Fade,
  Grow,
  Zoom,
  Stack
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as TaskIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  PlayArrow as OngoingIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccountCircle as OnlineIcon,
  AccessTime as OfflineIcon,
  Update as UpdateIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDashboardData } from '../../Api/dashboardApi';
import axiosInstance from '../../Api/axiosInstance';
import { notifyError, notifySuccess } from '../../utils/notifications';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const [dashboardData, setDashboardData] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUsersLoading, setActiveUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUsersError, setActiveUsersError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Cache management
  const [dataCache, setDataCache] = useState({
    dashboard: { data: null, timestamp: 0, ttl: 300000 }, // 5 minutes TTL
    activeUsers: { data: null, timestamp: 0, ttl: 180000 } // 3 minutes TTL
  });

  // Refs for cleanup
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastRequestTime = useRef({ dashboard: 0, activeUsers: 0 });

  // Minimum time between requests (rate limiting)
  const MIN_REQUEST_INTERVAL = 30000; // 30 seconds
  const REFRESH_INTERVAL = 300000; // 5 minutes instead of 1 minute

  // Check if cached data is still valid
  const isCacheValid = useCallback((cacheKey) => {
    const cached = dataCache[cacheKey];
    return cached.data && (Date.now() - cached.timestamp) < cached.ttl;
  }, [dataCache]);

  // Update cache
  const updateCache = useCallback((cacheKey, data, customTTL = null) => {
    setDataCache(prev => ({
      ...prev,
      [cacheKey]: {
        data,
        timestamp: Date.now(),
        ttl: customTTL || prev[cacheKey].ttl
      }
    }));
  }, []);

  // Check rate limiting
  const canMakeRequest = useCallback((requestType) => {
    const now = Date.now();
    const lastRequest = lastRequestTime.current[requestType];
    return (now - lastRequest) >= MIN_REQUEST_INTERVAL;
  }, []);

  const loadDashboard = useCallback(async (showRefreshing = false, forceRefresh = false) => {
    // Check cache first unless forced refresh
    if (!forceRefresh && isCacheValid('dashboard') && dashboardData) {
      if (showRefreshing) {
        notifySuccess('Dashboard data loaded from cache');
      }
      return;
    }

    // Rate limiting check
    if (!forceRefresh && !canMakeRequest('dashboard')) {
      console.log('Dashboard request rate limited');
      return;
    }

    if (showRefreshing) setRefreshing(true);
    if (!dashboardData) setLoading(true);

    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Update last request time
      lastRequestTime.current.dashboard = Date.now();

      const data = await fetchDashboardData({
        signal: abortControllerRef.current.signal
      });

      setDashboardData(data);
      setLastUpdated(new Date());
      setError('');

      // Update cache
      updateCache('dashboard', data);

      if (showRefreshing) {
        notifySuccess('Dashboard data refreshed');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Dashboard request aborted');
        return;
      }

      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before refreshing again.');
        notifyError('Rate limit exceeded. Please wait before refreshing again.');
      } else {
        setError('Failed to load dashboard data');
        notifyError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dashboardData, isCacheValid, canMakeRequest, updateCache]);

  const loadActiveUsers = useCallback(async (forceRefresh = false) => {
    // Skip if already cached and not forcing refresh
    if (!forceRefresh && isCacheValid('activeUsers') && activeUsers.length > 0) {
      return;
    }

    // Rate limiting check
    if (!forceRefresh && !canMakeRequest('activeUsers')) {
      console.log('Active users request rate limited');
      return;
    }

    setActiveUsersLoading(true);

    try {
      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Update last request time
      lastRequestTime.current.activeUsers = Date.now();

      // Make API call
      const res = await axiosInstance.get('/dashboard/active-users', {
        signal,
        timeout: 10000,
      });

      // Debug log for clarity
      console.log('Active users response:', res.data);

      // Handle flexible response format
      const users = res.data?.data ?? res.data ?? [];

      if (!Array.isArray(users)) {
        throw new Error('Invalid active users response format');
      }

      // Set state and cache
      setActiveUsers(users);
      updateCache('activeUsers', users);
      setActiveUsersError('');
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Active users request aborted');
        return;
      }

      console.error('Active users load failed:', err);

      if (err.response?.status === 429) {
        setActiveUsersError('Rate limit exceeded. Active users will refresh automatically.');
      } else {
        setActiveUsersError(err.message || 'Failed to load active users');
        notifyError(err.message || 'Failed to load active users');
      }
    } finally {
      setActiveUsersLoading(false);
    }
  }, [isCacheValid, canMakeRequest, updateCache, activeUsers.length]);

  // Load data from cache on component mount
  useEffect(() => {
    const cachedDashboard = dataCache.dashboard;
    const cachedActiveUsers = dataCache.activeUsers;

    if (isCacheValid('dashboard') && cachedDashboard.data) {
      setDashboardData(cachedDashboard.data);
      setLastUpdated(new Date(cachedDashboard.timestamp));
      setLoading(false);
    }

    if (isCacheValid('activeUsers') && cachedActiveUsers.data) {
      setActiveUsers(cachedActiveUsers.data);
      setActiveUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load with staggered requests to reduce server load
    const initializeData = async () => {
      await loadDashboard();

      // Delay active users request by 2 seconds to prevent simultaneous API calls
      setTimeout(() => {
        loadActiveUsers();
      }, 2000);
    };

    initializeData();

    // Set up interval with longer refresh time
    intervalRef.current = setInterval(() => {
      // Stagger the refresh calls
      loadDashboard();

      // Load active users 30 seconds after dashboard
      setTimeout(() => {
        loadActiveUsers();
      }, 30000);
    }, REFRESH_INTERVAL);

    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadDashboard, loadActiveUsers]);

  const handleRefresh = useCallback(() => {
    // Check if user is not spam clicking refresh
    const now = Date.now();
    const lastRefresh = lastRequestTime.current.dashboard;

    if (now - lastRefresh < 10000) { // 10 second cooldown
      notifyError('Please wait 10 seconds before refreshing again');
      return;
    }

    loadDashboard(true, true);

    // Stagger active users refresh
    setTimeout(() => {
      loadActiveUsers(true);
    }, 3000);
  }, [loadDashboard, loadActiveUsers]);

  // Debounced refresh for user interactions
  const debouncedRefresh = useCallback(
    debounce(() => {
      handleRefresh();
    }, 1000),
    [handleRefresh]
  );

  // Simple debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading && !dashboardData) {
    return (
      <Box sx={{
        width: '100%',
        minHeight: '100vh',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3, md: 4 },
        maxWidth: '100%'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 3 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: { xs: 3, md: 4 } }}
          >
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={{ xs: '100%', sm: 200 }} height={40} />
              <Skeleton variant="text" width={{ xs: '80%', sm: 150 }} height={20} />
            </Box>
          </Stack>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 2 }}>
            <Grid item xs={12} lg={8}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Box sx={{
        width: '100%',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3, md: 4 }
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert
            severity="error"
            sx={{ borderRadius: 2 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshIcon />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </motion.div>
      </Box>
    );
  }

  const {
    usersCount = 0,
    tasksByStatus = {},
    overdueCount = 0,
    activeUsersCount = 0,
    recentTasks = [],
    role,
  } = dashboardData || {};

  // Calculate totals and percentages
  const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);
  const completionRate = totalTasks > 0 ? ((tasksByStatus.completed || 0) / totalTasks * 100).toFixed(1) : 0;
  const overdueRate = totalTasks > 0 ? (overdueCount / totalTasks * 100).toFixed(1) : 0;

  // Prepare chart data
  const pieData = [
    { name: 'Completed', value: tasksByStatus.completed || 0, color: '#4caf50' },
    { name: 'Ongoing', value: tasksByStatus.ongoing || 0, color: '#ff9800' },
    { name: 'Pending', value: tasksByStatus.pending || 0, color: '#2196f3' },
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'Pending', value: tasksByStatus.pending || 0, fill: '#2196f3' },
    { name: 'Ongoing', value: tasksByStatus.ongoing || 0, fill: '#ff9800' },
    { name: 'Completed', value: tasksByStatus.completed || 0, fill: '#4caf50' },
  ];

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Users',
      value: usersCount,
      icon: <PeopleIcon />,
      color: '#1a2752',
      bgGradient: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: <TaskIcon />,
      color: '#4caf50',
      bgGradient: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: activeUsersCount,
      icon: <TrendingUpIcon />,
      color: '#ff9800',
      bgGradient: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Overdue Tasks',
      value: overdueCount,
      icon: <WarningIcon />,
      color: '#dc267f',
      bgGradient: 'linear-gradient(135deg, #dc267f 0%, #e91e63 100%)',
      change: '-5%',
      trend: 'down'
    }
  ];

  const formatLastLogin = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CompletedIcon sx={{ color: '#4caf50' }} />;
      case 'ongoing': return <OngoingIcon sx={{ color: '#ff9800' }} />;
      default: return <PendingIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'ongoing': return '#ff9800';
      default: return '#2196f3';
    }
  };

  return (
    <Box sx={{
      width: '100%',
      padding: 0,
      minHeight: '100vh',
      px: { xs: 1, sm: 2, md: 3 },
      py: { xs: 2, sm: 3, md: 4 },
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 3 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            sx={{ mb: { xs: 3, md: 4 } }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  background: 'linear-gradient(135deg, #1a2752 0%, #dc267f 100%)',
                }}
              >
                <DashboardIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 0.5,
                    wordBreak: 'break-word'
                  }}
                >
                  Dashboard
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  Welcome back! Here's what's happening with your projects.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {lastUpdated && (
                <Box sx={{
                  textAlign: { xs: 'left', sm: 'right' },
                  display: { xs: 'none', md: 'block' },
                  minWidth: 120
                }}>
                  <Typography variant="caption" color="text.secondary">
                    Last updated
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {lastUpdated.toLocaleTimeString()}
                  </Typography>
                </Box>
              )}

              <Tooltip title="Refresh Dashboard">
                <IconButton
                  onClick={debouncedRefresh}
                  disabled={refreshing}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'scale(1.05)'
                    },
                    '&:disabled': {
                      backgroundColor: 'action.disabled',
                      color: 'action.disabled'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <motion.div
                    animate={{ rotate: refreshing ? 360 : 0 }}
                    transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                  >
                    <RefreshIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </motion.div>
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </motion.div>

        {/* Stats Cards */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  sx={{
                    background: card.bgGradient,
                    color: 'white',
                    borderRadius: { xs: 2, md: 3 },
                    overflow: 'hidden',
                    position: 'relative',
                    height: { xs: 120, sm: 140 },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '30%',
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50px 0 0 50px',
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      sx={{ height: '100%' }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant={isMobile ? "h4" : "h3"}
                          sx={{ fontWeight: 700, mb: 0.5 }}
                        >
                          {card.value.toLocaleString()}
                        </Typography>
                        <Typography
                          variant={isMobile ? "body2" : "subtitle1"}
                          sx={{ opacity: 0.9, mb: 1 }}
                        >
                          {card.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {card.trend === 'up' ?
                            <TrendingUpIcon fontSize="small" /> :
                            <WarningIcon fontSize="small" />
                          }
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {card.change}
                          </Typography>
                        </Stack>
                      </Box>
                      <Avatar
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          width: { xs: 40, sm: 56 },
                          height: { xs: 40, sm: 56 },
                        }}
                      >
                        {React.cloneElement(card.icon, {
                          sx: { fontSize: { xs: 20, sm: 24 } }
                        })}
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Charts and Analytics */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          {/* Task Status Chart */}
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: { xs: 2, md: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%'
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ mb: 3 }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Task Analytics
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                      Overview of task distribution and progress
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} flexWrap="wrap">
                    <Chip
                      icon={<SpeedIcon />}
                      label={`${completionRate}% Complete`}
                      color="success"
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                    />
                    <Chip
                      icon={<WarningIcon />}
                      label={`${overdueRate}% Overdue`}
                      color="error"
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                    />
                  </Stack>
                </Stack>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Task Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={isMobile ? 150 : 200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={isMobile ? 30 : 40}
                            outerRadius={isMobile ? 60 : 80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Task Counts
                      </Typography>
                      <ResponsiveContainer width="100%" height={isMobile ? 150 : 200}>
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            fontSize={isMobile ? 10 : 12}
                          />
                          <YAxis fontSize={isMobile ? 10 : 12} />
                          <RechartsTooltip />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} lg={4}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: { xs: 2, md: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 3 }}>
                  Performance Metrics
                </Typography>

                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2">Task Completion Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {completionRate}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(completionRate)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4caf50',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2">User Activity</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {((activeUsersCount / Math.max(usersCount, 1)) * 100).toFixed(1)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(activeUsersCount / Math.max(usersCount, 1)) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#ff9800',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2">Overdue Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {overdueRate}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(overdueRate)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(220, 38, 127, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#dc267f',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      p: { xs: 2, md: 2 },
                      backgroundColor: 'primary.main',
                      borderRadius: 2,
                      color: 'white',
                      textAlign: 'center'
                    }}
                  >
                    <StarIcon sx={{ fontSize: { xs: 24, sm: 32 }, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      System Health
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>
                      98.5%
                    </Typography>
                    <Typography variant="caption">
                      All systems operational
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Recent Tasks and Active Users */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Recent Tasks */}
          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: { xs: 2, md: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Recent Tasks
                  </Typography>
                  <Chip
                    icon={<TimelineIcon />}
                    label={`${recentTasks.length} tasks`}
                    variant="outlined"
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                  />
                </Stack>

                {recentTasks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <TaskIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No recent tasks available
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: { xs: 250, md: 300 }, overflow: 'auto' }}>
                    {recentTasks.map((task, index) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Box
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            p: 2,
                            backgroundColor: 'action.hover',
                            '&:hover': {
                              backgroundColor: 'action.selected',
                              transform: 'translateX(4px)',
                            },
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            console.log('Navigate to task:', task._id);
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Box sx={{ mt: 0.5 }}>
                              {getStatusIcon(task.status)}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {task.title}
                              </Typography>
                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1}
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                sx={{ mt: 1 }}
                              >
                                <Chip
                                  label={task.status}
                                  size="small"
                                  sx={{
                                    backgroundColor: getStatusColor(task.status),
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    height: 20,
                                    textTransform: 'capitalize'
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  Assigned to: {task.assignees?.map(a => a.name).join(', ') || 'Unassigned'}

                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>

          {/* Active Users */}
          <Grid item xs={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: { xs: 2, md: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Active Users
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      icon={<OnlineIcon />}
                      label={`${activeUsers.filter(u => u.isOnline).length} online`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      icon={<OfflineIcon />}
                      label={`${activeUsers.filter(u => !u.isOnline).length} offline`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>

                {activeUsersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : activeUsersError ? (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {activeUsersError}
                  </Alert>
                ) : activeUsers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No active users found
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: { xs: 250, md: 300 }, overflow: 'auto' }}>
                    {activeUsers.map((user, index) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Box
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            p: 2,
                            backgroundColor: 'action.hover',
                            '&:hover': {
                              backgroundColor: 'action.selected',
                              transform: 'translateX(4px)',
                            },
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            console.log('Navigate to user:', user._id);
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Badge
                              badgeContent=""
                              color={user.isOnline ? 'success' : 'default'}
                              variant="dot"
                              anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                              }}
                            >
                              <Avatar
                                sx={{
                                  backgroundColor: 'primary.main',
                                  width: { xs: 36, sm: 40 },
                                  height: { xs: 36, sm: 40 },
                                  fontSize: { xs: '0.9rem', sm: '1rem' }
                                }}
                              >
                                {user.name?.charAt(0)?.toUpperCase()}
                              </Avatar>
                            </Badge>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1}
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                sx={{ mb: 0.5 }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 600,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1
                                  }}
                                >
                                  {user.name}
                                </Typography>
                                <Chip
                                  label={user.isOnline ? 'Online' : 'Offline'}
                                  size="small"
                                  color={user.isOnline ? 'success' : 'default'}
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Stack>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mb: 0.5
                                }}
                              >
                                {user.email}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Last login: {formatLastLogin(user.lastLogin)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Role-specific sections */}
        <AnimatePresence>
          {role === 'coordinator' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  mt: { xs: 2, md: 3 },
                  borderRadius: { xs: 2, md: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%)',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ backgroundColor: '#ff9800' }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Department Statistics (Coordinator View)
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                      Manage your department's performance and team productivity
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 700, color: '#ff9800' }}>
                        85%
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Team Efficiency
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 700, color: '#4caf50' }}>
                        23
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Projects Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 700, color: '#2196f3' }}>
                        12
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Team Members
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}

          {role === 'user' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  mt: { xs: 2, md: 3 },
                  borderRadius: { xs: 2, md: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ backgroundColor: '#4caf50' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Your Task Activity
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                      Track your personal productivity and task completion
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                      <Typography variant={isMobile ? "h5" : "h3"} sx={{ fontWeight: 700, color: '#4caf50' }}>
                        8
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                      <Typography variant={isMobile ? "h5" : "h3"} sx={{ fontWeight: 700, color: '#ff9800' }}>
                        3
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                      <Typography variant={isMobile ? "h5" : "h3"} sx={{ fontWeight: 700, color: '#2196f3' }}>
                        2
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pending
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                      <Typography variant={isMobile ? "h5" : "h3"} sx={{ fontWeight: 700, color: '#dc267f' }}>
                        1
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Overdue
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Weekly Goal Progress
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">8 of 10 tasks completed</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>80%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={80}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#4caf50',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions Footer */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              mt: { xs: 3, md: 4 },
              borderRadius: { xs: 2, md: 3 },
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, rgba(26, 39, 82, 0.05) 0%, rgba(220, 38, 127, 0.05) 100%)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {[
                { icon: <TaskIcon />, label: 'Create Task', color: '#1a2752' },
                { icon: <PeopleIcon />, label: 'Manage Users', color: '#4caf50' },
                { icon: <AnalyticsIcon />, label: 'View Reports', color: '#ff9800' },
                { icon: <ScheduleIcon />, label: 'Schedule Meeting', color: '#dc267f' }
              ].map((action, index) => (
                <Grid item xs={6} sm={3} key={action.label}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      height: { xs: 80, sm: 100 },
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(26, 39, 82, 0.15)',
                      }
                    }}
                  >
                    <CardContent
                      sx={{
                        textAlign: 'center',
                        py: { xs: 1.5, sm: 3 },
                        px: { xs: 1, sm: 2 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Avatar
                        sx={{
                          backgroundColor: action.color,
                          mx: 'auto',
                          mb: { xs: 0.5, sm: 2 },
                          width: { xs: 32, sm: 40 },
                          height: { xs: 32, sm: 40 }
                        }}
                      >
                        {React.cloneElement(action.icon, {
                          sx: { fontSize: { xs: 16, sm: 20 } }
                        })}
                      </Avatar>
                      <Typography
                        variant={isMobile ? "caption" : "subtitle2"}
                        sx={{
                          fontWeight: 600,
                          textAlign: 'center',
                          lineHeight: 1.2
                        }}
                      >
                        {action.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>
      </motion.div>
    </Box>
  );
  
};

export default Dashboard;