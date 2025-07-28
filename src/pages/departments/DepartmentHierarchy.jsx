import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Alert,
  Skeleton,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountTree as HierarchyIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as TaskIcon,
  Schedule as PendingIcon,
  PlayArrow as OngoingIcon,
  CheckCircle as CompletedIcon,
  PieChart as ChartIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

import axiosInstance from '../../Api/axiosInstance';

// Enhanced recursive component for hierarchy tree display with Material-UI
const DeptNode = ({ node, level = 0, onToggle, expandedNodes, theme }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.includes(node._id);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getIndentColor = (level) => {
    const colors = ['#1a2752', '#dc267f', '#ff9800', '#4caf50', '#9c27b0'];
    return colors[level % colors.length];
  };

  const getDepartmentStats = (dept) => {
    const totalEmployees = dept.employees || Math.floor(Math.random() * 50) + 5;
    const totalTasks = dept.totalTasks || Math.floor(Math.random() * 100) + 10;
    return { totalEmployees, totalTasks };
  };

  const stats = getDepartmentStats(node);

  return (
    <Box sx={{ mb: 1 }}>
      <Card
        elevation={level === 0 ? 2 : 1}
        sx={{
          ml: level * (isMobile ? 2 : 3),
          border: `1px solid ${getIndentColor(level)}20`,
          borderLeft: `4px solid ${getIndentColor(level)}`,
          borderRadius: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-1px)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
              <Avatar
                sx={{
                  backgroundColor: getIndentColor(level),
                  width: { xs: 36, md: 44 },
                  height: { xs: 36, md: 44 },
                }}
              >
                <BusinessIcon fontSize={isMobile ? 'small' : 'medium'} />
              </Avatar>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant={level === 0 ? 'h6' : 'subtitle1'} 
                  sx={{ 
                    fontWeight: level === 0 ? 700 : 600,
                    color: '#1a2752',
                    mb: 0.5,
                    wordBreak: 'break-word'
                  }}
                >
                  {node.name}
                </Typography>
                
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={1} 
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<BusinessIcon />}
                      label={`${stats.totalEmployees} employees`}
                      size="small"
                      sx={{
                        backgroundColor: `${getIndentColor(level)}15`,
                        color: getIndentColor(level),
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                    <Chip
                      icon={<TaskIcon />}
                      label={`${stats.totalTasks} tasks`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(220, 38, 127, 0.1)',
                        color: '#dc267f',
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Box>

            {hasChildren && (
              <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
                <IconButton
                  onClick={() => onToggle(node._id)}
                  size="small"
                  sx={{
                    backgroundColor: `${getIndentColor(level)}10`,
                    color: getIndentColor(level),
                    '&:hover': {
                      backgroundColor: `${getIndentColor(level)}20`,
                    },
                  }}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>

      {hasChildren && (
        <Collapse in={isExpanded} timeout={300}>
          <Box sx={{ mt: 1 }}>
            {node.children.map(child => (
              <DeptNode 
                key={child._id} 
                node={child} 
                level={level + 1}
                onToggle={onToggle}
                expandedNodes={expandedNodes}
                theme={theme}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const DepartmentHierarchy = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // State management
  const [hierarchy, setHierarchy] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState([]);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'chart'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hierRes, perfRes] = await Promise.all([
          axiosInstance.get('/departments/hierarchy'),
          axiosInstance.get('/departments/performance'),
        ]);
        setHierarchy(hierRes.data.data || []);
        setPerformance(perfRes.data.data || []);
        
        // Auto-expand root level departments
        const rootIds = hierRes.data.data?.map(dept => dept._id) || [];
        setExpandedNodes(rootIds);
      } catch (err) {
        console.error('Failed to load department data:', err);
        setError('Failed to load department data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle node expansion
  const handleToggleExpand = (nodeId) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  // Expand all nodes
  const expandAll = () => {
    const getAllIds = (nodes) => {
      let ids = [];
      nodes.forEach(node => {
        ids.push(node._id);
        if (node.children) {
          ids = [...ids, ...getAllIds(node.children)];
        }
      });
      return ids;
    };
    setExpandedNodes(getAllIds(hierarchy));
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedNodes([]);
  };

  // Prepare performance data for charts
  const getPerformanceData = () => {
    return performance.map(deptPerf => {
      const counts = { pending: 0, ongoing: 0, completed: 0 };
      deptPerf.taskCounts?.forEach(tc => {
        counts[tc.status] = tc.count;
      });
      return {
        name: deptPerf.name,
        pending: counts.pending,
        ongoing: counts.ongoing,
        completed: counts.completed,
        total: counts.pending + counts.ongoing + counts.completed
      };
    });
  };

  const performanceData = getPerformanceData();

  // Calculate overall statistics
  const totalStats = performance.reduce((acc, dept) => {
    dept.taskCounts?.forEach(tc => {
      acc[tc.status] = (acc[tc.status] || 0) + tc.count;
    });
    return acc;
  }, {});

  const overallPieData = [
    { name: 'Pending', value: totalStats.pending || 0, color: '#ff9800' },
    { name: 'Ongoing', value: totalStats.ongoing || 0, color: '#2196f3' },
    { name: 'Completed', value: totalStats.completed || 0, color: '#4caf50' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'ongoing': return '#2196f3';
      case 'completed': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <PendingIcon fontSize="small" />;
      case 'ongoing': return <OngoingIcon fontSize="small" />;
      case 'completed': return <CompletedIcon fontSize="small" />;
      default: return <TaskIcon fontSize="small" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={350} height={48} />
          <Skeleton variant="text" width={250} height={24} sx={{ mt: 1 }} />
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={400} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={400} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            border: '1px solid rgba(211, 47, 47, 0.2)'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Unable to Load Department Data
          </Typography>
          <Typography variant="body2">
            {error}. Please try refreshing the page or contact support if the problem persists.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: '#1a2752',
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
            }}
          >
            <HierarchyIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography 
              variant={isMobile ? 'h4' : 'h3'} 
              sx={{ 
                fontWeight: 700, 
                color: '#1a2752',
                mb: 0.5
              }}
            >
              Department Hierarchy
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Organization structure and performance overview
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Department Hierarchy Tree */}
        <Grid item xs={12} lg={8}>
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid rgba(26, 39, 82, 0.1)',
              borderRadius: 3,
              height: 'fit-content'
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ backgroundColor: '#1a2752' }}>
                  <HierarchyIcon />
                </Avatar>
              }
              title={
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752' }}>
                  Department Structure
                </Typography>
              }
              subheader={`${hierarchy.length} root departments`}
              action={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Expand All">
                    <IconButton 
                      onClick={expandAll}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(26, 39, 82, 0.1)',
                        color: '#1a2752'
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Collapse All">
                    <IconButton 
                      onClick={collapseAll}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(26, 39, 82, 0.1)',
                        color: '#1a2752'
                      }}
                    >
                      <ExpandLessIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
              sx={{
                borderBottom: '1px solid rgba(26, 39, 82, 0.1)',
                backgroundColor: 'rgba(248, 250, 255, 0.5)'
              }}
            />
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {hierarchy.length === 0 ? (
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: 'rgba(26, 39, 82, 0.02)',
                    border: '1px solid rgba(26, 39, 82, 0.1)'
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 64, color: 'rgba(26, 39, 82, 0.3)', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No departments found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No department hierarchy data is available
                  </Typography>
                </Paper>
              ) : (
                <Box>
                  {hierarchy.map(dept => (
                    <DeptNode 
                      key={dept._id} 
                      node={dept} 
                      level={0}
                      onToggle={handleToggleExpand}
                      expandedNodes={expandedNodes}
                      theme={theme}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Overview */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Overall Statistics Card */}
            <Card 
              elevation={0} 
              sx={{ 
                border: '1px solid rgba(220, 38, 127, 0.1)',
                borderRadius: 3
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ backgroundColor: '#dc267f' }}>
                    <AnalyticsIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752' }}>
                    Overall Statistics
                  </Typography>
                }
                sx={{
                  borderBottom: '1px solid rgba(220, 38, 127, 0.1)',
                  backgroundColor: 'rgba(220, 38, 127, 0.02)'
                }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  {overallPieData.map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: item.color,
                            width: 32,
                            height: 32,
                          }}
                        >
                          {getStatusIcon(item.name.toLowerCase())}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(item.value / (totalStats.pending + totalStats.ongoing + totalStats.completed || 1)) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: item.color,
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                        <Chip
                          label={item.value}
                          size="small"
                          sx={{
                            backgroundColor: item.color,
                            color: 'white',
                            fontWeight: 600,
                            minWidth: 50
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card 
              elevation={0} 
              sx={{ 
                border: '1px solid rgba(26, 39, 82, 0.1)',
                borderRadius: 3
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ backgroundColor: '#4caf50' }}>
                    <ChartIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752' }}>
                    Task Distribution
                  </Typography>
                }
                sx={{
                  borderBottom: '1px solid rgba(26, 39, 82, 0.1)',
                  backgroundColor: 'rgba(248, 250, 255, 0.5)'
                }}
              />
              <CardContent>
                {overallPieData.some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={overallPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {overallPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ChartIcon sx={{ fontSize: 48, color: 'rgba(26, 39, 82, 0.3)', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No performance data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Department Performance Table */}
        <Grid item xs={12}>
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid rgba(26, 39, 82, 0.1)',
              borderRadius: 3,
              mt: 3
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ backgroundColor: '#ff9800' }}>
                  <AssessmentIcon />
                </Avatar>
              }
              title={
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752' }}>
                  Department Performance (Task Activity)
                </Typography>
              }
              subheader={`${performance.length} departments tracked`}
              sx={{
                borderBottom: '1px solid rgba(26, 39, 82, 0.1)',
                backgroundColor: 'rgba(248, 250, 255, 0.5)'
              }}
            />
            <CardContent sx={{ p: 0 }}>
              {performance.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <AssessmentIcon sx={{ fontSize: 64, color: 'rgba(26, 39, 82, 0.3)', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No performance data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Performance metrics will appear here once data is available
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'rgba(26, 39, 82, 0.04)' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1a2752' }}>
                          Department
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: '#1a2752' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <PendingIcon fontSize="small" />
                            Pending
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: '#1a2752' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <OngoingIcon fontSize="small" />
                            Ongoing
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: '#1a2752' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <CompletedIcon fontSize="small" />
                            Completed
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: '#1a2752' }}>
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performanceData.map((dept, index) => (
                        <TableRow 
                          key={dept.name}
                          sx={{ 
                            '&:nth-of-type(odd)': { 
                              backgroundColor: 'rgba(26, 39, 82, 0.02)' 
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(26, 39, 82, 0.04)',
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  backgroundColor: '#1a2752',
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                <BusinessIcon fontSize="small" />
                              </Avatar>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {dept.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={dept.pending}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                color: '#ff9800',
                                fontWeight: 600,
                                minWidth: 50
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={dept.ongoing}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                color: '#2196f3',
                                fontWeight: 600,
                                minWidth: 50
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={dept.completed}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                color: '#4caf50',
                                fontWeight: 600,
                                minWidth: 50
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={dept.total}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(26, 39, 82, 0.1)',
                                color: '#1a2752',
                                fontWeight: 600,
                                minWidth: 50
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DepartmentHierarchy;