import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
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
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' });
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!form.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email is invalid';
    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await login(form.email, form.password);
      toast.success('Welcome back! Login successful!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const logoVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }
    }
  };

  return (
    <Container
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
        variants={!prefersReducedMotion ? containerVariants : undefined}
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
            boxShadow: '0 8px 32px rgba(26, 39, 82, 0.1)'
          }}
        >
          <motion.div variants={!prefersReducedMotion ? logoVariants : undefined}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  borderRadius: '50%',
                  background: '#1a2752',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src="/src/img/logo.png"
                  alt="Logo"
                  style={{
                    width: '60%',
                    height: '60%',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <LockIcon sx={{ color: 'white', display: 'none' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please sign in to continue
              </Typography>
            </Box>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <motion.div variants={!prefersReducedMotion ? itemVariants : undefined}>
              <TextField
                fullWidth
                required
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                  style: { color: '#000' }
                }}
                sx={{
                  mt: 2,
                  '& input': { color: '#000' },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#dc267f',
                  }
                }}
              />
            </motion.div>

            <motion.div variants={!prefersReducedMotion ? itemVariants : undefined}>
              <TextField
                fullWidth
                required
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  style: { color: '#000' }
                }}
                sx={{
                  mt: 2,
                  '& input': { color: '#000' },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#dc267f',
                  }
                }}
              />
            </motion.div>

            <motion.div variants={!prefersReducedMotion ? itemVariants : undefined}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowIcon />}
                sx={{
                  mt: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  backgroundColor: '#dc267f',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#b91c5c'
                  }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </motion.div>

            <Divider sx={{ my: 3 }} />

            <motion.div variants={!prefersReducedMotion ? itemVariants : undefined}>
              <Box textAlign="center">
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Don't have an account?
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  startIcon={<PersonIcon />}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#1a2752',
                    color: '#1a2752',
                    '&:hover': {
                      borderColor: '#dc267f',
                      color: '#dc267f'
                    }
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
