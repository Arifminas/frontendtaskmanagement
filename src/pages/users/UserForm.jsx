import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Chip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUserById, createUser, updateUser } from '../../api/users';
import { fetchDepartments } from '../../Api/departments';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserForm = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
  });

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [activeStep, setActiveStep] = useState(0);

  const isEditMode = !!userId;
  const canEditRole = user?.role === 'admin';
  const canEditDepartment = user?.role === 'admin';

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    if (!password && !isEditMode) return false;
    if (password && password.length < 6) return false;
    return true;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateForm = () => {
    const errors = {};

    if (!validateName(form.name)) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!isEditMode && !form.password) {
      errors.password = 'Password is required';
    } else if (form.password && !validatePassword(form.password)) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!form.role) {
      errors.role = 'Role is required';
    }

    if (!form.department) {
      errors.department = 'Department is required';
    }

    return errors;
  };

  const handleFieldValidation = (fieldName, value) => {
    const errors = { ...fieldErrors };

    switch (fieldName) {
      case 'name':
        if (!validateName(value)) {
          errors.name = 'Name must be at least 2 characters long';
        } else {
          delete errors.name;
        }
        break;
      case 'email':
        if (!value) {
          errors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!isEditMode && !value) {
          errors.password = 'Password is required';
        } else if (value && !validatePassword(value)) {
          errors.password = 'Password must be at least 6 characters long';
        } else {
          delete errors.password;
        }
        break;
      case 'role':
        if (!value) {
          errors.role = 'Role is required';
        } else {
          delete errors.role;
        }
        break;
      case 'department':
        if (!value) {
          errors.department = 'Department is required';
        } else {
          delete errors.department;
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
  };

  useEffect(() => {
    const loadDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const depts = await fetchDepartments();
        setDepartments(depts);
      } catch (err) {
        notifyError('Failed to load departments');
      } finally {
        setDepartmentsLoading(false);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    if (userId) {
      const loadUser = async () => {
        setLoading(true);
        try {
          const res = await fetchUserById(userId);
          const userData = res.data || res;
          setForm({
            name: userData.name || '',
            email: userData.email || '',
            password: '',
            role: userData.role || 'user',
            department: userData.department?._id || userData.department || '',
          });
        } catch {
          notifyError('Failed to load user details');
        } finally {
          setLoading(false);
        }
      };
      loadUser();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Mark field as touched
    setTouched({ ...touched, [name]: true });
    
    // Validate field if it's been touched
    if (touched[name]) {
      handleFieldValidation(name, value);
    }

    // Clear general error
    if (error) setError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    handleFieldValidation(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({
        name: true,
        email: true,
        password: true,
        role: true,
        department: true
      });
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (userId) {
        const updateData = { ...form };
        if (!form.password) delete updateData.password;

        await updateUser(userId, updateData);
        notifySuccess('User updated successfully');
      } else {
        await createUser(form);
        notifySuccess('User created successfully');
      }
      navigate('/users');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save user';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'coordinator': return <BusinessIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc267f';
      case 'coordinator': return '#ff9800';
      case 'user': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const steps = ['Personal Info', 'Role & Department', 'Review'];

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

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }
    }
  };

  if (loading && isEditMode) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#1a2752' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%' }}
      >
        {/* Header */}
        <motion.div variants={logoVariants}>
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
                {isEditMode ? <EditIcon sx={{ fontSize: { xs: 28, sm: 32 } }} /> : <AddIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {isEditMode ? 'Edit User' : 'Add New User'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {isEditMode ? 'Update user information and permissions' : 'Create a new user account with role and department'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={() => navigate('/users')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#dc267f',
                    backgroundColor: 'rgba(220, 38, 127, 0.1)'
                  }
                }}
              >
                Back to Users
              </Button>
            </Box>
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

        {/* Main Form */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(26, 39, 82, 0.1)',
            border: '1px solid rgba(26, 39, 82, 0.1)'
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            {/* Form Content */}
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Grid container spacing={3}>
                {/* Personal Information Section */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card
                      elevation={1}
                      sx={{
                        borderRadius: 2,
                        border: '1px solid rgba(26, 39, 82, 0.1)',
                        mb: 3
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon />
                          Personal Information
                        </Typography>
                        
                        <Grid container spacing={3}>
                          {/* Name Field */}
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Full Name"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={!!fieldErrors.name && touched.name}
                              helperText={fieldErrors.name && touched.name ? fieldErrors.name : 'Enter the user\'s full name'}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#dc267f',
                                  }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#dc267f',
                                }
                              }}
                            />
                          </Grid>

                          {/* Email Field */}
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email Address"
                              name="email"
                              type="email"
                              value={form.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={!!fieldErrors.email && touched.email}
                              helperText={fieldErrors.email && touched.email ? fieldErrors.email : 'Enter a valid email address'}
                              required
                              disabled={isEditMode}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#dc267f',
                                  }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#dc267f',
                                }
                              }}
                            />
                          </Grid>

                          {/* Password Field - Only for new users */}
                          {!isEditMode && (
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!fieldErrors.password && touched.password}
                                helperText={fieldErrors.password && touched.password ? fieldErrors.password : 'Minimum 6 characters required'}
                                required={!isEditMode}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <LockIcon color="action" />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={togglePasswordVisibility}
                                        edge="end"
                                        size="small"
                                      >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#dc267f',
                                    }
                                  },
                                  '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#dc267f',
                                  }
                                }}
                              />
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Role and Department Section */}
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card
                      elevation={1}
                      sx={{
                        borderRadius: 2,
                        border: '1px solid rgba(26, 39, 82, 0.1)',
                        mb: 3
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2752', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon />
                          Role & Department
                        </Typography>
                        
                        <Grid container spacing={3}>
                          {/* Role Field */}
                          <Grid item xs={12} sm={6}>
                            <FormControl 
                              fullWidth 
                              error={!!fieldErrors.role && touched.role}
                              disabled={!canEditRole}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#dc267f',
                                  }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#dc267f',
                                }
                              }}
                            >
                              <InputLabel>Role</InputLabel>
                              <Select
                                name="role"
                                value={form.role}
                                label="Role"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                startAdornment={
                                  <InputAdornment position="start">
                                    {getRoleIcon(form.role)}
                                  </InputAdornment>
                                }
                              >
                                <MenuItem value="user">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon fontSize="small" />
                                    <span>User</span>
                                    <Chip
                                      label="Standard"
                                      size="small"
                                      sx={{
                                        backgroundColor: getRoleColor('user'),
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        ml: 1
                                      }}
                                    />
                                  </Box>
                                </MenuItem>
                                <MenuItem value="coordinator">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BusinessIcon fontSize="small" />
                                    <span>Coordinator</span>
                                    <Chip
                                      label="Manager"
                                      size="small"
                                      sx={{
                                        backgroundColor: getRoleColor('coordinator'),
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        ml: 1
                                      }}
                                    />
                                  </Box>
                                </MenuItem>
                                <MenuItem value="admin">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AdminIcon fontSize="small" />
                                    <span>Admin</span>
                                    <Chip
                                      label="Full Access"
                                      size="small"
                                      sx={{
                                        backgroundColor: getRoleColor('admin'),
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        ml: 1
                                      }}
                                    />
                                  </Box>
                                </MenuItem>
                              </Select>
                              {fieldErrors.role && touched.role && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                  {fieldErrors.role}
                                </Typography>
                              )}
                              {!canEditRole && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                                  Only administrators can change user roles
                                </Typography>
                              )}
                            </FormControl>
                          </Grid>

                          {/* Department Field */}
                          <Grid item xs={12} sm={6}>
                            <FormControl 
                              fullWidth 
                              error={!!fieldErrors.department && touched.department}
                              disabled={!canEditDepartment || departmentsLoading}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#dc267f',
                                  }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#dc267f',
                                }
                              }}
                            >
                              <InputLabel>Department</InputLabel>
                              <Select
                                name="department"
                                value={form.department}
                                label="Department"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                startAdornment={
                                  <InputAdornment position="start">
                                    <BusinessIcon color="action" />
                                  </InputAdornment>
                                }
                              >
                                <MenuItem value="">
                                  <em>Select Department</em>
                                </MenuItem>
                                {departments.map((dept) => (
                                  <MenuItem key={dept._id} value={dept._id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <BusinessIcon fontSize="small" />
                                      {dept.name}
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                              {fieldErrors.department && touched.department && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                  {fieldErrors.department}
                                </Typography>
                              )}
                              {!canEditDepartment && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                                  Only administrators can change user departments
                                </Typography>
                              )}
                              {departmentsLoading && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                                  Loading departments...
                                </Typography>
                              )}
                            </FormControl>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Form Actions */}
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/users')}
                sx={{
                  borderColor: '#1a2752',
                  color: '#1a2752',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    borderColor: '#dc267f',
                    color: '#dc267f',
                    backgroundColor: 'rgba(220, 38, 127, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
                sx={{
                  backgroundColor: '#dc267f',
                  fontWeight: 600,
                  px: 4,
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
                {loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default UserForm;