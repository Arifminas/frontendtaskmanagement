import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Update as UpdateIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Assignment as AssignmentIcon,
  SwapHoriz as SwapIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUsers, updateUser } from '../../Api/users';
import { notifySuccess, notifyError } from '../../utils/notifications';

const RoleAssignment = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRoleFilter, setCurrentRoleFilter] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState('single'); // 'single' or 'bulk'
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Select Users', 'Choose Role', 'Confirm Changes'];

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData || []);
      } catch (err) {
        setError('Failed to fetch users');
        notifyError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc267f';
      case 'coordinator': return '#ff9800';
      case 'user': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'coordinator': return <BusinessIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin': return 'Full system access and user management';
      case 'coordinator': return 'Department management and task coordination';
      case 'user': return 'Standard user access and task participation';
      default: return '';
    }
  };

  const handleSelectUser = (userId) => {
    if (assignmentMode === 'single') {
      setSelectedUsers([userId]);
      // Auto-advance to role selection for single mode
      if (activeStep === 0) {
        setActiveStep(1);
      }
    } else {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
    setError('');
  };

  const handleSelectAll = () => {
    const filteredUserIds = filteredUsers.map(user => user._id);
    if (selectedUsers.length === filteredUserIds.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUserIds);
    }
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setError('');
    // Auto-advance to confirmation for single user
    if (assignmentMode === 'single' && activeStep === 1) {
      setActiveStep(2);
    }
  };

  const handleUpdateRole = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmRoleUpdate = async () => {
    setShowConfirmDialog(false);
    setUpdating(true);
    setError('');

    try {
      // Update all selected users
      const updatePromises = selectedUsers.map(userId =>
        updateUser(userId, { role: selectedRole })
      );
      
      await Promise.all(updatePromises);
      
      notifySuccess(`Role updated successfully for ${selectedUsers.length} user(s)`);
      
      // Update user list locally
      setUsers(prevUsers =>
        prevUsers.map(user =>
          selectedUsers.includes(user._id) 
            ? { ...user, role: selectedRole }
            : user
        )
      );
      
      // Reset form
      setSelectedUsers([]);
      setSelectedRole('');
      setActiveStep(0);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update role(s)';
      setError(msg);
      notifyError(msg);
    } finally {
      setUpdating(false);
    }
  };

  const resetForm = () => {
    setSelectedUsers([]);
    setSelectedRole('');
    setActiveStep(0);
    setError('');
  };

  // Apply filters
  const filteredUsers = users.filter(user => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = user.name?.toLowerCase().includes(query);
      const matchesEmail = user.email?.toLowerCase().includes(query);
      if (!matchesName && !matchesEmail) return false;
    }
    
    // Role filter
    if (currentRoleFilter && user.role !== currentRoleFilter) return false;
    
    return true;
  });

  const selectedUsersList = users.filter(user => selectedUsers.includes(user._id));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#1a2752' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%' }}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  backgroundColor: '#dc267f',
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                }}
              >
                <AssignmentIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Role Assignment
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage user roles and permissions across the system
                </Typography>
              </Box>
            </Box>

            {/* Assignment Mode Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small">
                <RadioGroup
                  row
                  value={assignmentMode}
                  onChange={(e) => {
                    setAssignmentMode(e.target.value);
                    resetForm();
                  }}
                  sx={{ color: 'white' }}
                >
                  <FormControlLabel 
                    value="single" 
                    control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#dc267f' } }} />} 
                    label="Single User" 
                  />
                  <FormControlLabel 
                    value="bulk" 
                    control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#dc267f' } }} />} 
                    label="Bulk Assignment" 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Paper>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div variants={itemVariants}>
          <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-active': { color: '#dc267f' },
                        '&.Mui-completed': { color: '#1a2752' },
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: 20
                  }
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Grid container spacing={3}>
          {/* User Selection Panel */}
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {/* Search and Filter Header */}
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(26, 39, 82, 0.1)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2 }}>
                    Step 1: Select Users
                  </Typography>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                          endAdornment: searchQuery && (
                            <IconButton
                              size="small"
                              onClick={() => setSearchQuery('')}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#dc267f',
                            }
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Filter by Role</InputLabel>
                        <Select
                          value={currentRoleFilter}
                          label="Filter by Role"
                          onChange={(e) => setCurrentRoleFilter(e.target.value)}
                          sx={{
                            borderRadius: 2,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#dc267f',
                            }
                          }}
                        >
                          <MenuItem value="">All Roles</MenuItem>
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="coordinator">Coordinator</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {assignmentMode === 'bulk' && (
                      <Grid item xs={12} sm={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleSelectAll}
                          sx={{
                            borderColor: '#1a2752',
                            color: '#1a2752',
                            '&:hover': {
                              borderColor: '#dc267f',
                              color: '#dc267f'
                            }
                          }}
                        >
                          {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Users Table/List */}
                {isMobile ? (
                  // Mobile Card View
                  <Box sx={{ p: 2 }}>
                    {filteredUsers.map(user => (
                      <Card
                        key={user._id}
                        sx={{
                          mb: 2,
                          border: selectedUsers.includes(user._id) ? '2px solid #dc267f' : '1px solid rgba(26, 39, 82, 0.1)',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 20px rgba(26, 39, 82, 0.15)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => handleSelectUser(user._id)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {assignmentMode === 'bulk' ? (
                              <Checkbox
                                checked={selectedUsers.includes(user._id)}
                                sx={{
                                  color: '#1a2752',
                                  '&.Mui-checked': { color: '#dc267f' }
                                }}
                              />
                            ) : (
                              <Radio
                                checked={selectedUsers.includes(user._id)}
                                sx={{
                                  color: '#1a2752',
                                  '&.Mui-checked': { color: '#dc267f' }
                                }}
                              />
                            )}
                            
                            <Avatar sx={{ backgroundColor: '#1a2752' }}>
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a2752' }}>
                                {user.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                            
                            <Chip
                              icon={getRoleIcon(user.role)}
                              label={user.role}
                              size="small"
                              sx={{
                                backgroundColor: getRoleColor(user.role),
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  // Desktop Table View
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(26, 39, 82, 0.04)' }}>
                          <TableCell padding="checkbox">
                            {assignmentMode === 'bulk' && (
                              <Checkbox
                                indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                                checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                                onChange={handleSelectAll}
                                sx={{
                                  color: '#1a2752',
                                  '&.Mui-checked': { color: '#dc267f' },
                                  '&.MuiCheckbox-indeterminate': { color: '#dc267f' }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#1a2752' }}>User</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#1a2752' }}>Current Role</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#1a2752' }}>Department</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.map(user => (
                          <TableRow
                            key={user._id}
                            hover
                            selected={selectedUsers.includes(user._id)}
                            onClick={() => handleSelectUser(user._id)}
                            sx={{
                              cursor: 'pointer',
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(220, 38, 127, 0.08)',
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(26, 39, 82, 0.04)',
                              }
                            }}
                          >
                            <TableCell padding="checkbox">
                              {assignmentMode === 'bulk' ? (
                                <Checkbox
                                  checked={selectedUsers.includes(user._id)}
                                  sx={{
                                    color: '#1a2752',
                                    '&.Mui-checked': { color: '#dc267f' }
                                  }}
                                />
                              ) : (
                                <Radio
                                  checked={selectedUsers.includes(user._id)}
                                  sx={{
                                    color: '#1a2752',
                                    '&.Mui-checked': { color: '#dc267f' }
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, backgroundColor: '#1a2752' }}>
                                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752' }}>
                                    {user.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {user.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getRoleIcon(user.role)}
                                label={user.role}
                                size="small"
                                sx={{
                                  backgroundColor: getRoleColor(user.role),
                                  color: 'white',
                                  fontWeight: 600,
                                  textTransform: 'capitalize'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {user.department?.name || 'No department'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </motion.div>
          </Grid>

          {/* Role Selection and Action Panel */}
          <Grid item xs={12} lg={4}>
            <motion.div variants={itemVariants}>
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {/* Selected Users Summary */}
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(26, 39, 82, 0.1)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2 }}>
                    Selected Users ({selectedUsers.length})
                  </Typography>
                  
                  {selectedUsersList.length > 0 ? (
                    <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {selectedUsersList.map(user => (
                        <Box key={user._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, backgroundColor: '#1a2752', fontSize: '0.875rem' }}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Current: {user.role}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No users selected
                    </Typography>
                  )}
                </Box>

                {/* Role Selection */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2 }}>
                    Step 2: Select New Role
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Assign Role</InputLabel>
                    <Select
                      value={selectedRole}
                      label="Assign Role"
                      onChange={handleRoleChange}
                      disabled={selectedUsers.length === 0}
                      sx={{
                        borderRadius: 2,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#dc267f',
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>-- Select Role --</em>
                      </MenuItem>
                      <MenuItem value="user">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <PersonIcon fontSize="small" />
                          <Box>
                            <Typography>User</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Standard access
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="coordinator">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <BusinessIcon fontSize="small" />
                          <Box>
                            <Typography>Coordinator</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Management access
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="admin">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <AdminIcon fontSize="small" />
                          <Box>
                            <Typography>Admin</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Full system access
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* Role Description */}
                  {selectedRole && (
                    <Card
                      sx={{
                        mb: 3,
                        backgroundColor: 'rgba(26, 39, 82, 0.04)',
                        border: '1px solid rgba(26, 39, 82, 0.1)'
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getRoleIcon(selectedRole)}
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752' }}>
                            {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Role
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {getRoleDescription(selectedRole)}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <UpdateIcon />}
                      onClick={handleUpdateRole}
                      disabled={updating || selectedUsers.length === 0 || !selectedRole}
                      sx={{
                        backgroundColor: '#dc267f',
                        fontWeight: 600,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: '#b91c5c',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(220, 38, 127, 0.3)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {updating ? 'Updating Roles...' : `Update Role${selectedUsers.length > 1 ? 's' : ''}`}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={resetForm}
                      disabled={updating}
                      sx={{
                        borderColor: '#1a2752',
                        color: '#1a2752',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#dc267f',
                          color: '#dc267f',
                          backgroundColor: 'rgba(220, 38, 127, 0.04)'
                        }
                      }}
                    >
                      Reset Selection
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <Dialog
          open={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <WarningIcon />
            Confirm Role Assignment
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to assign the <strong>{selectedRole}</strong> role to the following {selectedUsers.length} user(s)?
            </Typography>
            
            <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid rgba(26, 39, 82, 0.1)', borderRadius: 2, p: 2 }}>
              {selectedUsersList.map(user => (
                <Box key={user._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, backgroundColor: '#1a2752' }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      {user.role}
                    </Typography>
                    <SwapIcon fontSize="small" sx={{ mx: 1, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ color: getRoleColor(selectedRole), fontWeight: 600 }}>
                      {selectedRole}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Alert
              severity="info"
              sx={{ mt: 2, borderRadius: 2 }}
              icon={<InfoIcon />}
            >
              This action will immediately change user permissions. Users may need to log out and log back in for changes to take full effect.
            </Alert>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setShowConfirmDialog(false)}
              variant="outlined"
              sx={{
                borderColor: '#1a2752',
                color: '#1a2752',
                '&:hover': {
                  borderColor: '#dc267f',
                  color: '#dc267f'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRoleUpdate}
              variant="contained"
              startIcon={<CheckIcon />}
              sx={{
                backgroundColor: '#dc267f',
                '&:hover': { backgroundColor: '#b91c5c' }
              }}
            >
              Confirm Assignment
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default RoleAssignment;