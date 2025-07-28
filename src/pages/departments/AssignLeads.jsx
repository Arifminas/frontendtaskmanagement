import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  Chip,
  Grid,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  AssignmentInd as AssignIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Group as GroupIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { TextField, InputAdornment } from '@mui/material';

// Import your API functions and utilities
import { fetchDepartments, assignLeads } from '../../Api/departments';
import { fetchUsers } from '../../api/users';
import { notifySuccess, notifyError } from '../../utils/notifications';

const AssignLeads = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // State management
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [deptRes, userRes] = await Promise.all([
          fetchDepartments(), 
          fetchUsers()
        ]);
        setDepartments(deptRes || []);
        setUsers(userRes || []);
        setFilteredUsers(userRes || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        notifyError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Handle department selection
  const handleDepartmentChange = (event) => {
    const deptId = event.target.value;
    setSelectedDepartment(deptId);
    setSelectedLeads([]); // Reset leads when department changes
    setShowUsers(!!deptId); // Show users section when department is selected
    
    // Find selected department info
    const dept = departments.find(d => d._id === deptId);
    setDepartmentInfo(dept);
  };

  // Handle lead selection toggle
  const handleLeadToggle = (userId) => {
    setSelectedLeads((prev) =>
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  // Handle select all leads
  const handleSelectAll = () => {
    if (selectedLeads.length === filteredUsers.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredUsers.map(user => user._id));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDepartment) {
      notifyError('Please select a department');
      return;
    }

    if (selectedLeads.length === 0) {
      notifyError('Please select at least one lead');
      return;
    }

    setSubmitting(true);
    try {
      await assignLeads({ 
        departmentId: selectedDepartment, 
        leads: selectedLeads 
      });
      notifySuccess(`Successfully assigned ${selectedLeads.length} lead(s) to ${departmentInfo?.name}`);
      
      // Reset form
      setSelectedDepartment('');
      setSelectedLeads([]);
      setShowUsers(false);
      setDepartmentInfo(null);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to assign leads:', error);
      notifyError('Failed to assign leads');
    } finally {
      setSubmitting(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Get user role color
  const getUserRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#dc267f';
      case 'manager': return '#ff9800';
      case 'coordinator': return '#1a2752';
      case 'user': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={48} />
          <Skeleton variant="text" width={200} height={24} sx={{ mt: 1 }} />
        </Box>
        
        <Card elevation={0} sx={{ border: '1px solid rgba(26, 39, 82, 0.1)' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Skeleton variant="rectangular" height={56} sx={{ mb: 3, borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              backgroundColor: '#1a2752',
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
            }}
          >
            <AssignIcon fontSize={isMobile ? 'medium' : 'large'} />
          </Avatar>
          <Box>
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              sx={{ 
                fontWeight: 700, 
                color: '#1a2752',
                mb: 0.5
              }}
            >
              Assign Department Leads
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Select a department and assign leads to manage operations
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Card 
        elevation={0} 
        sx={{ 
          border: '1px solid rgba(26, 39, 82, 0.1)',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%'
            }}
          >
            {/* Department Selection Section */}
            <Box sx={{ 
              p: { xs: 2, md: 3 }, 
              background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
              borderBottom: '1px solid rgba(26, 39, 82, 0.1)'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#1a2752', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <BusinessIcon fontSize="small" />
                Select Department
              </Typography>

              <FormControl 
                fullWidth 
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1a2752',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dc267f',
                      borderWidth: 2,
                    },
                  },
                }}
              >
                <InputLabel>Choose Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  label="Choose Department"
                  disabled={submitting}
                >
                  <MenuItem value="">
                    <em>Select a department</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Avatar
                          sx={{
                            backgroundColor: '#1a2752',
                            width: 32,
                            height: 32,
                          }}
                        >
                          <BusinessIcon fontSize="small" />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {dept.name}
                          </Typography>
                          {dept.description && (
                            <Typography variant="caption" color="text.secondary">
                              {dept.description}
                            </Typography>
                          )}
                        </Box>
                        {dept.currentLeads && (
                          <Chip
                            label={`${dept.currentLeads} leads`}
                            size="small"
                            sx={{
                              backgroundColor: '#4caf50',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Selected Department Info */}
              {departmentInfo && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 2, 
                    backgroundColor: 'rgba(26, 39, 82, 0.04)',
                    border: '1px solid rgba(26, 39, 82, 0.1)',
                    '& .MuiAlert-icon': {
                      color: '#1a2752'
                    }
                  }}
                >
                  <Typography variant="body2">
                    <strong>{departmentInfo.name}</strong> department selected
                    {departmentInfo.description && ` - ${departmentInfo.description}`}
                  </Typography>
                </Alert>
              )}
            </Box>

            {/* Users Selection Section */}
            <Collapse in={showUsers} timeout={300}>
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#1a2752',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <GroupIcon fontSize="small" />
                    Select Leads ({selectedLeads.length} selected)
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleSelectAll}
                      sx={{
                        borderColor: '#1a2752',
                        color: '#1a2752',
                        '&:hover': {
                          borderColor: '#dc267f',
                          color: '#dc267f',
                          backgroundColor: 'rgba(220, 38, 127, 0.04)'
                        }
                      }}
                    >
                      {selectedLeads.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </Stack>
                </Box>

                {/* Search Users */}
                <TextField
                  fullWidth
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(26, 39, 82, 0.7)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={clearSearch}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a2752',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dc267f',
                      },
                    }
                  }}
                />

                {/* Users List */}
                {filteredUsers.length === 0 ? (
                  <Paper 
                    sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      backgroundColor: 'rgba(26, 39, 82, 0.02)',
                      border: '1px solid rgba(26, 39, 82, 0.1)'
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 48, color: 'rgba(26, 39, 82, 0.3)', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      {searchTerm ? 'No users found' : 'No users available'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm 
                        ? `No users match "${searchTerm}"`
                        : 'No users are available to assign as leads'
                      }
                    </Typography>
                  </Paper>
                ) : (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      border: '1px solid rgba(26, 39, 82, 0.1)',
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <List sx={{ p: 0 }}>
                      {filteredUsers.map((user, index) => {
                        const isSelected = selectedLeads.includes(user._id);
                        return (
                          <ListItem
                            key={user._id}
                            button
                            onClick={() => handleLeadToggle(user._id)}
                            sx={{
                              borderBottom: index < filteredUsers.length - 1 ? '1px solid rgba(26, 39, 82, 0.1)' : 'none',
                              backgroundColor: isSelected ? 'rgba(220, 38, 127, 0.04)' : 'transparent',
                              '&:hover': {
                                backgroundColor: isSelected 
                                  ? 'rgba(220, 38, 127, 0.08)' 
                                  : 'rgba(26, 39, 82, 0.04)',
                              },
                              py: 2
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  backgroundColor: getUserRoleColor(user.role),
                                  width: 44,
                                  height: 44,
                                }}
                              >
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </Avatar>
                            </ListItemAvatar>
                            
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {user.name || 'Unknown User'}
                                  </Typography>
                                  <Chip
                                    label={user.role || 'user'}
                                    size="small"
                                    sx={{
                                      backgroundColor: getUserRoleColor(user.role),
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      textTransform: 'capitalize'
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {user.email || 'No email provided'}
                                  </Typography>
                                </Box>
                              }
                            />
                            
                            <ListItemSecondaryAction>
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleLeadToggle(user._id)}
                                icon={<UncheckIcon />}
                                checkedIcon={<CheckIcon />}
                                sx={{
                                  color: '#1a2752',
                                  '&.Mui-checked': {
                                    color: '#dc267f',
                                  },
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                )}
              </Box>
            </Collapse>

            {/* Action Buttons */}
            {showUsers && (
              <Box sx={{ 
                p: { xs: 2, md: 3 }, 
                borderTop: '1px solid rgba(26, 39, 82, 0.1)',
                backgroundColor: 'rgba(248, 250, 255, 0.5)'
              }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="flex-end"
                  alignItems="center"
                >
                  {selectedLeads.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {selectedLeads.length} lead(s) selected for assignment
                    </Typography>
                  )}
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!selectedDepartment || selectedLeads.length === 0 || submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AssignIcon />}
                    sx={{
                      backgroundColor: '#dc267f',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      minWidth: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        backgroundColor: '#b71c5c',
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(26, 39, 82, 0.3)',
                      },
                    }}
                  >
                    {submitting ? 'Assigning...' : `Assign ${selectedLeads.length} Lead(s)`}
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Summary Section */}
      {selectedDepartment && selectedLeads.length > 0 && (
        <Card 
          elevation={0} 
          sx={{ 
            mt: 3,
            border: '1px solid rgba(220, 38, 127, 0.2)',
            borderRadius: 3,
            backgroundColor: 'rgba(220, 38, 127, 0.02)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2 }}>
              Assignment Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: '#1a2752' }}>
                    <BusinessIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {departmentInfo?.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ backgroundColor: '#dc267f' }}>
                    <GroupIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Selected Leads
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedLeads.length} user(s)
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default AssignLeads;