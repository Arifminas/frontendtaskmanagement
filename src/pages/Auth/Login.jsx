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
  InputAdornment
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const validateForm = () => {
    const errors = {};
    
    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
    
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! Login successful!');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  return (
    <Container
      component="main"
      maxWidth="sm"
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
                  src="/src/img/logo.png" // Change this to your actual logo filename
                  alt="Company Logo"
                  style={{
                    width: '70%',
                    height: '70%',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)', // Makes logo white, remove if logo should keep original colors
                  }}
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <LockIcon 
                  sx={{ 
                    fontSize: { xs: 28, sm: 32 },
                    color: 'white',
                    display: 'none' // Hidden by default, shown only if image fails
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
                Welcome Back
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: 'center', maxWidth: 300 }}
              >
                Please sign in to your account to continue
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
            <motion.div variants={itemVariants}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
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

            <motion.div variants={itemVariants}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
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
                {loading ? 'Signing In...' : 'Sign In'}
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
                  Don't have an account?
                </Typography>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/register')}
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
                  Create Account
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Login;