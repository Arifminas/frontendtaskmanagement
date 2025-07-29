import React, { useState, useCallback, useMemo } from 'react';
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
  IconButton,
  InputAdornment,
  Fade,
  Slide
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  EmailOutlined,
  PersonAddOutlined,
  LoginOutlined,
  CheckCircleOutlined,
  ErrorOutlined
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Validation rules
  const validators = {
    email: (value) => {
      if (!value?.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
      return '';
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Minimum 6 characters required';
      return '';
    }
  };

  // Memoized validation status
  const validationStatus = useMemo(() => {
    const status = {};
    Object.keys(form).forEach(field => {
      const error = validators[field]?.(form[field]);
      const hasValue = Boolean(form[field]?.trim());
      status[field] = error ? 'error' : hasValue ? 'success' : '';
    });
    return status;
  }, [form]);

  const isFormValid = useMemo(() => 
    Object.values(validators).every(validator => 
      Object.keys(form).some(field => !validator(form[field]))
    ) && form.email && form.password
  , [form]);

  // Event handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validators[name]?.(value) || '';
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    
    if (generalError) setGeneralError('');
  }, [touched, generalError]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validators[name]?.(value) || '';
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(validators).forEach(field => {
      const error = validators[field](form[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(newErrors).length > 0) {
      setGeneralError('Please fix the errors below');
      return;
    }

    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
    } catch (err) {
      const errorMsg = err.response?.status === 401 
        ? 'Invalid credentials' 
        : err.response?.data?.message || 'Login failed';
      setGeneralError(errorMsg);
      toast.error(errorMsg);
    }
  }, [form, login]);

  // Professional styling with browser compatibility
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a2752 0%, #dc267f 100%)',
      padding: '1rem',
      boxSizing: 'border-box'
    },
    paper: {
      padding: '2.5rem',
      borderRadius: '1rem',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)', // Safari support
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
      overflow: 'hidden'
    },
    avatar: {
      background: 'linear-gradient(45deg, #1a2752, #dc267f)',
      width: 64,
      height: 64,
      margin: '0 auto 1rem'
    },
    textField: {
      marginBottom: '1.5rem',
      '& .MuiOutlinedInput-root': {
        borderRadius: '0.75rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        },
        '&.Mui-focused': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 20px rgba(26, 39, 82, 0.2)',
          '& fieldset': {
            borderColor: '#1a2752'
          }
        }
      },
      '& .MuiOutlinedInput-input': {
        padding: '1rem 0.875rem'
      }
    },
    button: {
      padding: '0.875rem',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none',
      background: isFormValid 
        ? 'linear-gradient(45deg, #dc267f, #1a2752)' 
        : '#e0e0e0',
      color: isFormValid ? '#ffffff' : '#9e9e9e',
      border: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: isFormValid ? 'translateY(-2px)' : 'none',
        boxShadow: isFormValid ? '0 8px 25px rgba(220, 38, 127, 0.4)' : 'none',
        background: isFormValid ? 'linear-gradient(45deg, #b91c5c, #1a2752)' : '#e0e0e0'
      },
      '&:disabled': {
        background: '#e0e0e0',
        color: '#9e9e9e'
      }
    },
    createButton: {
      borderRadius: '0.75rem',
      borderColor: '#1a2752',
      color: '#1a2752',
      fontWeight: 500,
      textTransform: 'none',
      '&:hover': {
        borderColor: '#dc267f',
        color: '#dc267f',
        background: 'rgba(220, 38, 127, 0.04)'
      }
    }
  };

  const getFieldIcon = (field) => {
    const status = validationStatus[field];
    if (status === 'success') return <CheckCircleOutlined sx={{ color: '#dc267f' }} />;
    if (status === 'error') return <ErrorOutlined sx={{ color: '#f44336' }} />;
    return null;
  };

  return (
    <Box sx={styles.container}>
      <Slide direction="up" in timeout={600}>
        <Paper elevation={0} sx={styles.paper}>
          <Fade in timeout={800}>
            <Box textAlign="center" mb={3}>
              <Avatar sx={styles.avatar}>
                <LockOutlined fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight={700} color="#1a2752" mb={0.5}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue securely
              </Typography>
            </Box>
          </Fade>

          {generalError && (
            <Fade in>
              <Alert severity="error" sx={{ mb: 2, borderRadius: '0.5rem' }}>
                {generalError}
              </Alert>
            </Fade>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="email"
              type="email"
              label="Email Address"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.email)}
              helperText={errors.email}
              autoComplete="email"
              sx={styles.textField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: getFieldIcon('email') && (
                  <InputAdornment position="end">
                    {getFieldIcon('email')}
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(errors.password)}
              helperText={errors.password}
              autoComplete="current-password"
              sx={styles.textField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box display="flex" gap={0.5}>
                      {getFieldIcon('password')}
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Box>
                  </InputAdornment>
                )
              }}
            />

            <Button
              fullWidth
              type="submit"
              disabled={loading || !isFormValid}
              sx={styles.button}
              endIcon={loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <LoginOutlined />
              )}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box textAlign="center" my={2}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/register')}
              startIcon={<PersonAddOutlined />}
              sx={styles.createButton}
            >
              Create Account
            </Button>
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="caption" color="text.secondary">
              🔒 Secure & encrypted connection
            </Typography>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
};

export default Login;