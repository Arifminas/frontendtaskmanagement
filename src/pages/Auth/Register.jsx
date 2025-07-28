import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../Api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear field-specific errors
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    
    // Clear general error
    if (error) setError('');
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.name.trim()) {
      errors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!form.department.trim()) {
      errors.department = 'Department is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        role: form.role,
      });
      
      toast.success(res.data.message || 'Registration successful! Please check your email for verification.');
      setError('');
      
      setTimeout(() => navigate('/verify-otp', { state: { email: form.email } }), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'coordinator': return <BusinessIcon />;
      default: return <PersonIcon />;
    }
  };

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        px: { xs: 2, sm: 3 }
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%' }}
      >
        <Paper
          elevation={isMobile ? 2 : 8}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: { xs: 2, sm: 3 },
            background: '#ffffff',
            border: '1px solid rgba(220, 38, 127, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: isMobile 
              ? '0 4px 20px rgba(26, 39, 82, 0.15)' 
              : '0 20px 40px rgba(26, 39, 82, 0.2)',
          }}
        >
          {/* Logo Section */}
          <motion.div variants={logoVariants}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 80, sm: 96 },
                  height: { xs: 80, sm: 96 },
                  borderRadius: '50%',
                  background: '#1a2752',
                  boxShadow: '0 8px 32px rgba(26, 39, 82, 0.4)',
                  overflow: 'hidden',
                  mb: 1
                }}
              >
                <img
                  src="/src/img/logo.png"
                  alt="Company Logo"
                  style={{
                    width: '70%',
                    height: '70%',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <PersonAddIcon 
                  sx={{ 
                    fontSize: { xs: 28, sm: 32 },
                    color: 'white',
                    display: 'none'
                  }} 
                />
              </Box>
              
              <Typography
                component="h1"
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  mt: 2,
                  fontWeight: 700,
                  color: '#1a2752',
                  textAlign: 'center'
                }}
              >
                Create Account
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: 'center', maxWidth: 400 }}
              >
                Join us today! Fill in your details to get started
              </Typography>
            </Box>
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

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
              {/* Name Field */}
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div variants={itemVariants} style={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={form.name}
                    onChange={handleChange}
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.25)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dc267f',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#dc267f',
                      }
                    }}
                  />
                </motion.div>
              </Grid>

              {/* Email Field */}
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div variants={itemVariants} style={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.25)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dc267f',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#dc267f',
                      }
                    }}
                  />
                </motion.div>
              </Grid>

              {/* Password Field */}
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div variants={itemVariants} style={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password}
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
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.25)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dc267f',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#dc267f',
                      }
                    }}
                  />
                </motion.div>
              </Grid>

              {/* Confirm Password Field */}
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div variants={itemVariants} style={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={!!fieldErrors.confirmPassword}
                    helperText={fieldErrors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.25)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dc267f',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#dc267f',
                      }
                    }}
                  />
                </motion.div>
              </Grid>

              {/* Department Field */}
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div variants={itemVariants} style={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="department"
                    label="Department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    error={!!fieldErrors.department}
                    helperText={fieldErrors.department}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.25)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dc267f',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#dc267f',
                      }
                    }}
                  />
                </motion.div>
              </Grid>

              {/* Role Field */}
              <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div variants={itemVariants} style={{ width: '100%' }}>
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 20px rgba(220, 38, 127, 0.25)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dc267f',
                          }
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#dc267f',
                      }
                    }}
                  >
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role"
                      name="role"
                      value={form.role}
                      label="Role"
                      onChange={handleChange}
                      startAdornment={
                        <InputAdornment position="start">
                          {getRoleIcon(form.role)}
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="user">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" />
                          User
                        </Box>
                      </MenuItem>
                      <MenuItem value="coordinator">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" />
                          Coordinator
                        </Box>
                      </MenuItem>
                      <MenuItem value="admin">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AdminIcon fontSize="small" />
                          Admin
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
            </Grid>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: loading ? 'rgba(220, 38, 127, 0.6)' : '#dc267f',
                  color: '#ffffff',
                  boxShadow: '0 8px 32px rgba(220, 38, 127, 0.4)',
                  '&:hover': {
                    backgroundColor: loading ? 'rgba(220, 38, 127, 0.6)' : '#b91c5c',
                    boxShadow: '0 12px 40px rgba(220, 38, 127, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  transition: 'all 0.3s ease',
                }}
                endIcon={loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArrowIcon />
                )}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Already have an account?
                </Typography>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  startIcon={<PersonIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#1a2752',
                    color: '#1a2752',
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 3, sm: 4 },
                    '&:hover': {
                      borderColor: '#dc267f',
                      backgroundColor: 'rgba(220, 38, 127, 0.04)',
                      color: '#dc267f',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 20px rgba(220, 38, 127, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Sign In Instead
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Register;