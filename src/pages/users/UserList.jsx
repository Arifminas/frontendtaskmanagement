import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Fab,
  Tooltip,
  Avatar,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUsers, deleteUser } from '../../api/users';
import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useAuth } from '../../contexts/AuthContext';

// User View Modal Component
const UserViewModal = ({ open, onClose, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!user) return null;

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1a2752 0%, #2a3f6f 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              backgroundColor: '#dc267f',
              width: 56,
              height: 56,
              fontSize: '1.5rem'
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              User Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {user.name}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box sx={{ p: 3 }}>
            {/* User Information Cards */}
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid rgba(26, 39, 82, 0.1)'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon />
                    Personal Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 0.5 }}>
                          Full Name
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {user.name || 'Not specified'}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 0.5 }}>
                          Email Address
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body1" color="text.secondary">
                            {user.email || 'Not specified'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 0.5 }}>
                          User ID
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {user._id}
                        </Typography>
                      </Box>
                    </Grid>

                    {user.createdAt && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 0.5 }}>
                            Created Date
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Role and Department Information */}
              <Grid item xs={12}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid rgba(26, 39, 82, 0.1)'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon />
                    Role & Department
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 1 }}>
                          Role
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRoleIcon(user.role)}
                          <Chip
                            label={user.role}
                            sx={{
                              backgroundColor: getRoleColor(user.role),
                              color: 'white',
                              fontWeight: 600,
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752', mb: 1 }}>
                          Department
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" color="action" />
                          <Typography variant="body1" color="text.secondary">
                            {user.department?.name || 'Not assigned'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: '1px solid rgba(26, 39, 82, 0.1)',
          justifyContent: 'center'
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#1a2752',
            color: '#1a2752',
            fontWeight: 600,
            px: 4,
            '&:hover': {
              borderColor: '#dc267f',
              color: '#dc267f',
              backgroundColor: 'rgba(220, 38, 127, 0.04)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Mobile User Card Component
const UserCard = ({ user, onView, onEdit, onDelete, canEdit, canDelete }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(26, 39, 82, 0.1)',
          border: '1px solid rgba(26, 39, 82, 0.1)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(26, 39, 82, 0.15)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  backgroundColor: '#1a2752',
                  width: 48,
                  height: 48,
                  fontSize: '1.2rem'
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2752' }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getRoleIcon(user.role)}
              <Chip
                label={user.role}
                size="small"
                sx={{
                  backgroundColor: getRoleColor(user.role),
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>

          {/* Department */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <BusinessIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {user.department?.name || 'No department assigned'}
            </Typography>
          </Box>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<ViewIcon />}
              onClick={() => onView(user)}
              sx={{
                backgroundColor: '#1a2752',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#0f1a3a'
                }
              }}
            >
              View
            </Button>
            
            {canEdit && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onEdit(user._id)}
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
                Edit
              </Button>
            )}

            {canDelete && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete(user._id)}
                sx={{
                  borderColor: '#dc267f',
                  color: '#dc267f',
                  '&:hover': {
                    borderColor: '#b91c5c',
                    color: '#b91c5c',
                    backgroundColor: 'rgba(220, 38, 127, 0.04)'
                  }
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </CardActions>
      </Card>
    </motion.div>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const canEdit = user?.role === 'admin' || user?.role === 'coordinator';
  const canDelete = user?.role === 'admin';
  const canCreate = user?.role === 'admin' || user?.role === 'coordinator';

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      notifySuccess('User deleted successfully');
      setUsers(users.filter(userItem => userItem._id !== id));
    } catch {
      notifyError('Failed to delete user');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  const handleEditUser = (userId) => {
    navigate(`/users/edit/${userId}`);
  };

  // Apply filters and search
  const filteredUsers = users.filter(userItem => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = userItem.name?.toLowerCase().includes(query);
      const matchesEmail = userItem.email?.toLowerCase().includes(query);
      const matchesDepartment = userItem.department?.name?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesEmail && !matchesDepartment) {
        return false;
      }
    }
    
    // Role filter
    if (roleFilter && userItem.role !== roleFilter) return false;
    
    return true;
  });

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

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#1a2752' }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                User Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Manage user accounts, roles, and permissions
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', minWidth: isMobile ? '200px' : '300px' }}>
                <TextField
                  size="small"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />
                    ),
                    endAdornment: searchQuery && (
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: '1px solid rgba(255, 255, 255, 0.5)',
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
              </Box>
              
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#dc267f',
                    backgroundColor: 'rgba(220, 38, 127, 0.1)'
                  }
                }}
              >
                {isMobile ? '' : 'Filters'}
              </Button>
              
              {canCreate && (
                isMobile ? (
                  <Fab
                    color="primary"
                    onClick={() => navigate('/users/create')}
                    sx={{
                      backgroundColor: '#dc267f',
                      '&:hover': { backgroundColor: '#b91c5c' }
                    }}
                  >
                    <AddIcon />
                  </Fab>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/users/create')}
                    sx={{
                      backgroundColor: '#dc267f',
                      '&:hover': { backgroundColor: '#b91c5c' },
                      fontWeight: 600
                    }}
                  >
                    Create User
                  </Button>
                )
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Filters */}
      <Collapse in={showFilters}>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: '1px solid rgba(26, 39, 82, 0.1)'
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(e) => setRoleFilter(e.target.value)}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dc267f'
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

              {/* Search Results Info */}
              {(searchQuery || roleFilter) && (
                <Grid item xs={12} md={9}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      {filteredUsers.length} of {users.length} users shown
                    </Typography>
                    
                    {(searchQuery || roleFilter) && (
                      <Button
                        size="small"
                        onClick={() => {
                          setSearchQuery('');
                          setRoleFilter('');
                        }}
                        sx={{
                          color: '#dc267f',
                          textTransform: 'none',
                          fontWeight: 600,
                          minWidth: 'auto',
                          '&:hover': {
                            backgroundColor: 'rgba(220, 38, 127, 0.04)'
                          }
                        }}
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </motion.div>
      </Collapse>

      {/* Content */}
      {filteredUsers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: '2px dashed rgba(26, 39, 82, 0.2)'
            }}
          >
            <PersonIcon sx={{ fontSize: 64, color: 'rgba(26, 39, 82, 0.3)', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#1a2752', fontWeight: 600, mb: 1 }}>
              No users found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery || roleFilter
                ? 'No users match your current filters or search criteria.' 
                : 'No users have been created yet.'}
            </Typography>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/users/create')}
                sx={{
                  backgroundColor: '#dc267f',
                  '&:hover': { backgroundColor: '#b91c5c' }
                }}
              >
                Create First User
              </Button>
            )}
          </Paper>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isMobile ? (
            // Mobile Card View
            <Box>
              {filteredUsers.map(userItem => (
                <UserCard
                  key={userItem._id}
                  user={userItem}
                  onView={handleViewUser}
                  onEdit={handleEditUser}
                  onDelete={handleDelete}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              ))}
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(26, 39, 82, 0.1)',
                border: '1px solid rgba(26, 39, 82, 0.1)'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(26, 39, 82, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a2752' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map(userItem => (
                    <TableRow
                      key={userItem._id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(26, 39, 82, 0.02)'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40, backgroundColor: '#1a2752', fontSize: '1rem' }}>
                            {userItem.name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a2752' }}>
                              {userItem.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {userItem.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRoleIcon(userItem.role)}
                          <Chip
                            label={userItem.role}
                            size="small"
                            sx={{
                              backgroundColor: getRoleColor(userItem.role),
                              color: 'white',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {userItem.department?.name || 'No department'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View User Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewUser(userItem)}
                              sx={{ color: '#1a2752' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {canEdit && (
                            <Tooltip title="Edit User">
                              <IconButton
                                size="small"
                                onClick={() => handleEditUser(userItem._id)}
                                sx={{ color: '#1a2752' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {canDelete && (
                            <Tooltip title="Delete User">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(userItem._id)}
                                sx={{ color: '#dc267f' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </motion.div>
      )}

      {/* User View Modal */}
      <UserViewModal
        open={showViewModal}
        onClose={handleCloseViewModal}
        user={selectedUser}
      />
    </Container>
  );
};

export default UserList;