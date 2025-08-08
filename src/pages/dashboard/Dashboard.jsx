import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
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
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccountCircle as OnlineIcon,
  AccessTime as OfflineIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDashboardData } from '../../Api/dashboardApi';
import axiosInstance from '../../Api/axiosInstance';
import { notifyError, notifySuccess } from '../../utils/notifications';

// Custom hook for debouncing
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef();

  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

// Custom hook for cache management
const useCache = (defaultTTL = 300000) => {
  const [cache, setCache] = useState({});

  const isCacheValid = useCallback((key) => {
    const cached = cache[key];
    return cached?.data && (Date.now() - cached.timestamp) < (cached.ttl || defaultTTL);
  }, [cache, defaultTTL]);

  const updateCache = useCallback((key, data, customTTL) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
        ttl: customTTL || defaultTTL
      }
    }));
  }, [defaultTTL]);

  const getCachedData = useCallback((key) => {
    return isCacheValid(key) ? cache[key].data : null;
  }, [cache, isCacheValid]);

  return { isCacheValid, updateCache, getCachedData };
};

// Performance optimized components
const StatsCard = React.memo(({ card, isMobile, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ scale: 1.02 }}
  >
    <Card
      sx={{
        background: card.bgGradient,
        color: 'white',
        borderRadius: 3,
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
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ height: '100%' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 700, mb: 0.5 }}>
              {card.value.toLocaleString()}
            </Typography>
            <Typography variant={isMobile ? "body2" : "subtitle1"} sx={{ opacity: 0.9, mb: 1 }}>
              {card.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {card.trend === 'up' ? <TrendingUpIcon fontSize="small" /> : <WarningIcon fontSize="small" />}
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {card.change}
              </Typography>
            </Stack>
          </Box>
          <Avatar sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
            {React.cloneElement(card.icon, { sx: { fontSize: 24 } })}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  </motion.div>
));

const TaskItem = React.memo(({ task, index, getStatusIcon, getStatusColor }) => (
  <motion.div
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
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ mt: 0.5 }}>{getStatusIcon(task.status)}</Box>
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mt: 1 }}>
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
            <Typography variant="caption" color="text.secondary" noWrap>
              Assigned to: {task.assignees?.map(a => a.name).join(', ') || 'Unassigned'}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  </motion.div>
));

const UserItem = React.memo(({ user, index, formatLastLogin }) => (
  <motion.div
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
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Badge
          badgeContent=""
          color={user.isOnline ? 'success' : 'default'}
          variant="dot"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Avatar sx={{ backgroundColor: 'primary.main', width: 40, height: 40 }}>
            {user.name?.charAt(0)?.toUpperCase()}
          </Avatar>
        </Badge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }} noWrap>
              {user.name}
            </Typography>
            <Chip
              label={user.isOnline ? 'Online' : 'Offline'}
              size="small"
              color={user.isOnline ? 'success' : 'default'}
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
            {user.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last login: {formatLastLogin(user.lastLogin)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  </motion.div>
));

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isCacheValid, updateCache, getCachedData } = useCache();

  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUsersLoading, setActiveUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUsersError, setActiveUsersError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const controllersRef = useRef({ dashboard: null, activeUsers: null });
  const lastRequestTime = useRef({ dashboard: 0, activeUsers: 0 });

  // Constants
  const MIN_REQUEST_INTERVAL = 30000;
  const REFRESH_INTERVAL = 300000;

  // Rate limiting check
  const canMakeRequest = useCallback((requestType) => {
    const now = Date.now();
    const lastRequest = lastRequestTime.current[requestType];
    return (now - lastRequest) >= MIN_REQUEST_INTERVAL;
  }, []);

  // Data fetching functions
  const loadDashboard = useCallback(async (showRefreshing = false, forceRefresh = false) => {
    const cachedData = getCachedData('dashboard');
    if (!forceRefresh && cachedData && dashboardData) {
      if (showRefreshing) notifySuccess('Dashboard data loaded from cache');
      return;
    }

    if (!forceRefresh && !canMakeRequest('dashboard')) {
      console.log('Dashboard request rate limited');
      return;
    }

    if (showRefreshing) setRefreshing(true);
    if (!dashboardData) setLoading(true);

    try {
      if (controllersRef.current.dashboard) {
        controllersRef.current.dashboard.abort();
      }
      controllersRef.current.dashboard = new AbortController();

      lastRequestTime.current.dashboard = Date.now();

      const data = await fetchDashboardData({
        signal: controllersRef.current.dashboard.signal
      });

      setDashboardData(data);
      setLastUpdated(new Date());
      setError('');
      updateCache('dashboard', data);

      if (showRefreshing) notifySuccess('Dashboard data refreshed');
    } catch (err) {
      if (
     err?.name === 'AbortError' ||
     err?.code === 'ERR_CANCELED' ||
     err?.message === 'canceled'
    ) return;

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
  }, [dashboardData, getCachedData, canMakeRequest, updateCache]);

  const loadActiveUsers = useCallback(async (forceRefresh = false) => {
    const cachedData = getCachedData('activeUsers');
    if (!forceRefresh && cachedData && activeUsers.length > 0) {
      return;
    }

    if (!forceRefresh && !canMakeRequest('activeUsers')) {
      console.log('Active users request rate limited');
      return;
    }

    setActiveUsersLoading(true);

    try {
      if (controllersRef.current.activeUsers) {
     controllersRef.current.activeUsers.abort();
   }
   controllersRef.current.activeUsers = new AbortController();

      lastRequestTime.current.activeUsers = Date.now();

      const res = await axiosInstance.get('/dashboard/active-users', {
        signal: controllersRef.current.activeUsers.signal,
        timeout: 0, // no timeout (or bump this to 30000)
      });

      const users = res.data?.data ?? res.data ?? [];
      if (!Array.isArray(users)) {
        throw new Error('Invalid active users response format');
      }

      setActiveUsers(users);
      updateCache('activeUsers', users);
      setActiveUsersError('');
    } catch (err) {
      if (
     err?.name === 'AbortError' ||
     err?.code === 'ERR_CANCELED' ||
     err?.message === 'canceled'
   ) return;

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
  }, [getCachedData, canMakeRequest, updateCache, activeUsers.length]);

  // Debounced refresh handler
  const debouncedRefresh = useDebounce(useCallback(() => {
    const now = Date.now();
    const lastRefresh = lastRequestTime.current.dashboard;

    if (now - lastRefresh < 10000) {
      notifyError('Please wait 10 seconds before refreshing again');
      return;
    }

    loadDashboard(true, true);
    setTimeout(() => loadActiveUsers(true), 3000);
  }, [loadDashboard, loadActiveUsers]), 1000);

  // Effects
  useEffect(() => {
    const cachedDashboard = getCachedData('dashboard');
    const cachedActiveUsers = getCachedData('activeUsers');

    if (cachedDashboard) {
      setDashboardData(cachedDashboard);
      setLoading(false);
    }

    if (cachedActiveUsers) {
      setActiveUsers(cachedActiveUsers);
      setActiveUsersLoading(false);
    }
  }, [getCachedData]);

  useEffect(() => {
    const initializeData = async () => {
      await loadDashboard();
      setTimeout(() => loadActiveUsers(), 2000);
    };

    initializeData();

    intervalRef.current = setInterval(() => {
      loadDashboard();
      setTimeout(() => loadActiveUsers(), 30000);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      controllersRef.current.dashboard?.abort();
      controllersRef.current.activeUsers?.abort();
    };
  }, [loadDashboard, loadActiveUsers]);

  // Memoized values
  const {
    usersCount = 0,
    tasksByStatus = {},
    overdueCount = 0,
    activeUsersCount = 0,
    recentTasks = [],
    role,
  } = dashboardData || {};

  const totalTasks = useMemo(() =>
    Object.values(tasksByStatus).reduce((a, b) => a + b, 0),
    [tasksByStatus]
  );

  const completionRate = useMemo(() =>
    totalTasks > 0 ? ((tasksByStatus.completed || 0) / totalTasks * 100).toFixed(1) : 0,
    [totalTasks, tasksByStatus.completed]
  );

  const overdueRate = useMemo(() =>
    totalTasks > 0 ? (overdueCount / totalTasks * 100).toFixed(1) : 0,
    [totalTasks, overdueCount]
  );

  const chartData = useMemo(() => ({
    pieData: [
      { name: 'Completed', value: tasksByStatus.completed || 0, color: '#4caf50' },
      { name: 'Ongoing', value: tasksByStatus.ongoing || 0, color: '#ff9800' },
      { name: 'Pending', value: tasksByStatus.pending || 0, color: '#2196f3' },
    ].filter(item => item.value > 0),
    barData: [
      { name: 'Pending', value: tasksByStatus.pending || 0, fill: '#2196f3' },
      { name: 'Ongoing', value: tasksByStatus.ongoing || 0, fill: '#ff9800' },
      { name: 'Completed', value: tasksByStatus.completed || 0, fill: '#4caf50' },
    ]
  }), [tasksByStatus]);

  const statsCards = useMemo(() => [
    {
      title: 'Total Users',
      value: usersCount,
      icon: <PeopleIcon />,
      bgGradient: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: <TaskIcon />,
      bgGradient: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: activeUsersCount,
      icon: <TrendingUpIcon />,
      bgGradient: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Overdue Tasks',
      value: overdueCount,
      icon: <WarningIcon />,
      bgGradient: 'linear-gradient(135deg, #dc267f 0%, #e91e63 100%)',
      change: '-5%',
      trend: 'down'
    }
  ], [usersCount, totalTasks, activeUsersCount, overdueCount]);

  // Utility functions
  const formatLastLogin = useCallback((dateStr) => {
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
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'completed': return <CompletedIcon sx={{ color: '#4caf50' }} />;
      case 'ongoing': return <OngoingIcon sx={{ color: '#ff9800' }} />;
      default: return <PendingIcon sx={{ color: '#2196f3' }} />;
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'ongoing': return '#ff9800';
      default: return '#2196f3';
    }
  }, []);

  // Loading state
  if (loading && !dashboardData) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" sx={{ mb: 4 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={20} />
            </Box>
          </Stack>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Alert
            severity="error"
            sx={{ borderRadius: 2 }}
            action={
              <IconButton color="inherit" size="small" onClick={debouncedRefresh} disabled={refreshing}>
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

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 4 }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <Avatar
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                background: 'linear-gradient(135deg, #1a2752 0%, #dc267f 100%)',
              }}
            >
              <DashboardIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 0.5 }}>
                Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Welcome back! Here's what's happening with your projects.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            {lastUpdated && (
              <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                <Typography variant="caption" color="text.secondary">Last updated</Typography>
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
                  '&:hover': { backgroundColor: 'primary.dark', transform: 'scale(1.05)' },
                  '&:disabled': { backgroundColor: 'action.disabled' },
                  transition: 'all 0.3s ease'
                }}
              >
                <motion.div
                  animate={{ rotate: refreshing ? 360 : 0 }}
                  transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshIcon />
                </motion.div>
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <StatsCard card={card} isMobile={isMobile} index={index} />
            </Grid>
          ))}
        </Grid>

        {/* Charts and Analytics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Task Status Chart */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                height: { xs: 'auto', lg: '100%' },
                minHeight: { xs: 400, sm: 450, lg: 500 }
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ mb: { xs: 2, sm: 3 } }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                    Task Analytics
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: { xs: 'block', sm: 'block' },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      mt: 0.5
                    }}
                  >
                    Overview of task distribution and progress
                  </Typography>
                </Box>
                <Stack
                  direction={{ xs: 'row', sm: 'row' }}
                  spacing={1}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'space-between', sm: 'flex-end' },
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Chip
                    icon={<SpeedIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    label={`${completionRate}% Complete`}
                    color="success"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      height: { xs: 24, sm: 32 }
                    }}
                  />
                  <Chip
                    icon={<WarningIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    label={`${overdueRate}% Overdue`}
                    color="error"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      height: { xs: 24, sm: 32 }
                    }}
                  />
                </Stack>
              </Stack>

              <Box sx={{ width: '100%', height: { xs: 320, sm: 350, lg: 380 } }}>
                <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ height: '100%' }}>
                  <Grid item xs={12} md={6} sx={{ height: { xs: 'auto', md: '100%' } }}>
                    <Box sx={{
                      height: { xs: 240, md: '100%' },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                        sx={{
                          textAlign: 'center',
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          mb: { xs: 1, sm: 2 }
                        }}
                      >
                        Task Distribution
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        height: { xs: 200, md: 'calc(100% - 40px)' },
                        minHeight: 180
                      }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                            <Pie
                              data={chartData.pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={isMobile ? 25 : 35}
                              outerRadius={isMobile ? 60 : 75}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {chartData.pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.8rem'
                              }}
                            />
                            <Legend
                              wrapperStyle={{
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                paddingTop: '10px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ height: { xs: 'auto', md: '100%' } }}>
                    <Box sx={{
                      height: { xs: 240, md: '100%' },
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          mb: { xs: 1, sm: 2 }
                        }}
                      >
                        Task Counts by Status
                      </Typography>
                      <Box sx={{
                        width: '100%',
                        height: { xs: 200, md: 'calc(100% - 40px)' },
                        minHeight: 180
                      }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData.barData}
                            margin={{
                              top: 10,
                              right: isMobile ? 10 : 20,
                              left: isMobile ? 10 : 20,
                              bottom: 20
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                              opacity={0.7}
                            />
                            <XAxis
                              dataKey="name"
                              fontSize={isMobile ? 10 : 12}
                              tick={{ fill: '#666' }}
                              axisLine={{ stroke: '#e0e0e0' }}
                              tickLine={{ stroke: '#e0e0e0' }}
                            />
                            <YAxis
                              fontSize={isMobile ? 10 : 12}
                              tick={{ fill: '#666' }}
                              axisLine={{ stroke: '#e0e0e0' }}
                              tickLine={{ stroke: '#e0e0e0' }}
                              width={isMobile ? 30 : 40}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '0.8rem'
                              }}
                              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            />
                            <Bar
                              dataKey="value"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={isMobile ? 40 : 60}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Performance Metrics</Typography>

              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Task Completion Rate</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{completionRate}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(completionRate)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50', borderRadius: 4 },
                    }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
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
                      '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800', borderRadius: 4 },
                    }}
                  />
                </Box>

                <Box sx={{ p: 2, backgroundColor: 'primary.main', borderRadius: 2, color: 'white', textAlign: 'center' }}>
                  <StarIcon sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>System Health</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>98.5%</Typography>
                  <Typography variant="caption">All systems operational</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Tasks and Active Users */}
        <Grid container spacing={3}>
          {/* Recent Tasks */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Tasks</Typography>
                <Chip icon={<TaskIcon />} label={`${recentTasks.length} tasks`} variant="outlined" color="primary" />
              </Stack>

              {recentTasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TaskIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">No recent tasks available</Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {recentTasks.map((task, index) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      index={index}
                      getStatusIcon={getStatusIcon}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Active Users */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Active Users</Typography>
                <Stack direction="row" spacing={1}>
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
                <Alert severity="error" sx={{ borderRadius: 2 }}>{activeUsersError}</Alert>
              ) : activeUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">No active users found</Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {activeUsers.map((user, index) => (
                    <UserItem
                      key={user._id}
                      user={user}
                      index={index}
                      formatLastLogin={formatLastLogin}
                    />
                  ))}
                </Box>
              )}
            </Paper>
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
                  p: 3,
                  mt: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%)',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ backgroundColor: '#ff9800' }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Department Statistics (Coordinator View)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                      Manage your department's performance and team productivity
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={3}>
                  {[
                    { label: 'Team Efficiency', value: '85%', color: '#ff9800' },
                    { label: 'Projects Completed', value: '23', color: '#4caf50' },
                    { label: 'Team Members', value: '12', color: '#2196f3' }
                  ].map((stat) => (
                    <Grid item xs={12} sm={4} key={stat.label}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
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
                  p: 3,
                  mt: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ backgroundColor: '#4caf50' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Your Task Activity</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                      Track your personal productivity and task completion
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={3}>
                  {[
                    { label: 'Completed', value: '8', color: '#4caf50' },
                    { label: 'In Progress', value: '3', color: '#ff9800' },
                    { label: 'Pending', value: '2', color: '#2196f3' },
                    { label: 'Overdue', value: '1', color: '#dc267f' }
                  ].map((stat) => (
                    <Grid item xs={6} sm={3} key={stat.label}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Weekly Goal Progress</Typography>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
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
                      '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50', borderRadius: 4 },
                    }}
                  />
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions Footer */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, rgba(26, 39, 82, 0.05) 0%, rgba(220, 38, 127, 0.05) 100%)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
          <Grid container spacing={2}>
            {[
              { icon: <TaskIcon />, label: 'Create Task', color: '#1a2752' },
              { icon: <PeopleIcon />, label: 'Manage Users', color: '#4caf50' },
              { icon: <AnalyticsIcon />, label: 'View Reports', color: '#ff9800' },
              { icon: <ScheduleIcon />, label: 'Schedule Meeting', color: '#dc267f' }
            ].map((action) => (
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
                      py: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Avatar sx={{ backgroundColor: action.color, mb: 2, width: 40, height: 40 }}>
                      {React.cloneElement(action.icon, { sx: { fontSize: 20 } })}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                      {action.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Dashboard;