import React, { useState, useCallback } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  IconButton,
  InputAdornment,
  CircularProgress
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
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false); // NEW

  // Validation
  const validate = (field, value) => {
    switch (field) {
      case 'email':
        if (!value?.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Minimum 6 characters required';
        return '';
      default:
        return '';
    }
  };

  const getValidationIcon = (field) => {
    if (!touched[field] || !form[field]) return null;
    const error = validate(field, form[field]);
    return error
      ? <ErrorOutlined sx={{ color: '#f44336', fontSize: 20 }} />
      : <CheckCircleOutlined sx={{ color: '#dc267f', fontSize: 20 }} />;
  };

  const isFormValid = () => {
    return form.email &&
      form.password &&
      !validate('email', form.email) &&
      !validate('password', form.password);
  };

  // Event handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    if (generalError) setGeneralError('');
  }, [touched, generalError]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (submitting) return;            // NEW: guard against double submit
    const newErrors = {};
    ['email', 'password'].forEach(field => {
      const error = validate(field, form[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ email: true, password: true });
      setGeneralError('Please fix the errors below');
      return;
    }

    try {
      setSubmitting(true);             // NEW: start loading
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
    } catch (err) {
      const status = err?.response?.status;
      const apiMsg = err?.response?.data?.message;

      let errorMsg = 'Login failed';
      if (status === 401) errorMsg = 'Invalid credentials';
      else if (status === 429) errorMsg = apiMsg || 'Too many attempts. Please wait a moment and try again.';
      else if (apiMsg) errorMsg = apiMsg;

      setGeneralError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);            // NEW: stop loading
    }
  }, [form, login, submitting]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a2752 0%, #dc267f 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.98)',
          width: '100%',
          maxWidth: 400
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Avatar
            sx={{
              background: 'linear-gradient(45deg, #1a2752, #dc267f)',
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2
            }}
          >
            <LockOutlined fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight={600} color="#1a2752" mb={0.5}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue securely
          </Typography>
        </Box>

        {/* Error Alert */}
        {generalError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {generalError}
          </Alert>
        )}

        {/* Form */}
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
            disabled={submitting}                 // NEW
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                backgroundColor: '#ffffff',
                '& input': {
                  color: '#1a2752 !important',
                  fontSize: '16px',
                  fontWeight: 500,
                  WebkitTextFillColor: '#1a2752 !important',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                    WebkitTextFillColor: '#1a2752 !important',
                    backgroundColor: '#ffffff !important'
                  }
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a2752'
                }
              },
              '& .MuiInputLabel-root': {
                color: '#666666',
                fontSize: '16px',
                '&.Mui-focused': {
                  color: '#1a2752'
                }
              },
              '& .MuiFormHelperText-root': {
                color: '#f44336',
                fontSize: '14px'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined sx={{ color: '#666666' }} />
                </InputAdornment>
              ),
              endAdornment: getValidationIcon('email') && (
                <InputAdornment position="end">
                  {getValidationIcon('email')}
                </InputAdornment>
              ),
              style: {
                color: '#1a2752',
                fontSize: '16px',
                fontWeight: 500
              }
            }}
            inputProps={{
              style: {
                color: '#1a2752',
                fontSize: '16px',
                fontWeight: 500,
                WebkitTextFillColor: '#1a2752'
              }
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
            disabled={submitting}                 // NEW
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                backgroundColor: '#ffffff',
                '& input': {
                  color: '#1a2752 !important',
                  fontSize: '16px',
                  fontWeight: 500,
                  WebkitTextFillColor: '#1a2752 !important',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                    WebkitTextFillColor: '#1a2752 !important',
                    backgroundColor: '#ffffff !important'
                  }
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a2752'
                }
              },
              '& .MuiInputLabel-root': {
                color: '#666666',
                fontSize: '16px',
                '&.Mui-focused': {
                  color: '#1a2752'
                }
              },
              '& .MuiFormHelperText-root': {
                color: '#f44336',
                fontSize: '14px'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: '#666666' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box display="flex" gap={0.5}>
                    {getValidationIcon('password')}
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: '#666666' }}
                      disabled={submitting}       // NEW
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Box>
                </InputAdornment>
              ),
              style: {
                color: '#1a2752',
                fontSize: '16px',
                fontWeight: 500
              }
            }}
            inputProps={{
              style: {
                color: '#1a2752',
                fontSize: '16px',
                fontWeight: 500,
                WebkitTextFillColor: '#1a2752'
              }
            }}
          />

          <Button
            fullWidth
            type="submit"
            disabled={!isFormValid() || submitting}               // UPDATED
            endIcon={submitting ? <CircularProgress size={18} /> : <LoginOutlined />} // UPDATED
            sx={{
              py: 1.5,
              borderRadius: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: (!isFormValid() || submitting)
                ? '#e0e0e0'
                : 'linear-gradient(45deg, #dc267f, #1a2752)',
              color: (!isFormValid() || submitting) ? '#9e9e9e' : '#ffffff',
              mb: 2,
              '&:hover': {
                background: (!isFormValid() || submitting)
                  ? '#d1d1d1ff'
                  : 'linear-gradient(45deg, #b91c5c, #1a2752)'
              },
              '&:disabled': {
                background: '#ceccccff',
                color: '#b91c5c'
              }
            }}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>

          <Typography variant="body2" textAlign="center" color="text.secondary" mb={1}>
            Don't have an account?
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/register')}
            startIcon={<PersonAddOutlined />}
            disabled={submitting}                          // NEW
            sx={{
              borderRadius: 1.5,
              borderColor: '#1a2752',
              color: '#1a2752',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#dc267f',
                color: '#dc267f',
                background: 'rgba(220, 38, 127, 0.04)'
              }
            }}
          >
            Create Account
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={2}>
          🔒 Secure & encrypted connection
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
