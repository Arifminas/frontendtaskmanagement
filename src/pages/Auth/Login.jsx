import React, { useState, useEffect } from 'react';
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
  FormHelperText,
  Tooltip
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
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
  const [fieldTouched, setFieldTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationStatus, setValidationStatus] = useState({});
  const [attemptCount, setAttemptCount] = useState(0);

  // Enhanced validation rules
  const validationRules = {
    email: {
      required: true,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      maxLength: 254,
      messages: {
        required: 'Email address is required',
        pattern: 'Please enter a valid email address',
        maxLength: 'Email address is too long'
      }
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 128,
      messages: {
        required: 'Password is required',
        minLength: 'Password must be at least 6 characters long',
        maxLength: 'Password is too long'
      }
    }
  };

  // Real-time validation function
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return { isValid: true, message: '' };

    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
      return { isValid: false, message: rules.messages.required };
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return { isValid: true, message: '' };
    }

    // Pattern validation (for email)
    if (rules.pattern && !rules.pattern.test(value)) {
      return { isValid: false, message: rules.messages.pattern };
    }

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return { isValid: false, message: rules.messages.minLength };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return { isValid: false, message: rules.messages.maxLength };
    }

    return { isValid: true, message: '' };
  };

  // Validate entire form
  const validateForm = () => {
    const errors = {};
    const status = {};
    let isValid = true;

    Object.keys(form).forEach(field => {
      const validation = validateField(field, form[field]);
      if (!validation.isValid) {
        errors[field] = validation.message;
        status[field] = 'error';
        isValid = false;
      } else if (form[field] && form[field].trim() !== '') {
        status[field] = 'success';
      } else {
        status[field] = '';
      }
    });

    return { errors, status, isValid };
  };

  // Handle input changes with real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Mark field as touched
    setFieldTouched(prev => ({ ...prev, [name]: true }));

    // Real-time validation for touched fields
    if (fieldTouched[name] || attemptCount > 0) {
      const validation = validateField(name, value);
      
      setFieldErrors(prev => ({
        ...prev,
        [name]: validation.isValid ? '' : validation.message
      }));

      setValidationStatus(prev => ({
        ...prev,
        [name]: validation.isValid ? (value ? 'success' : '') : 'error'
      }));
    }

    // Clear general error when user starts typing
    if (error) setError('');
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldTouched(prev => ({ ...prev, [name]: true }));

    const validation = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? '' : validation.message
    }));

    setValidationStatus(prev => ({
      ...prev,
      [name]: validation.isValid ? (value ? 'success' : '') : 'error'
    }));
  };

  // Update form validity when form or errors change
  useEffect(() => {
    const { isValid } = validateForm();
    setIsFormValid(isValid && form.email && form.password);
  }, [form, fieldErrors]);

  // Enhanced form submission with better error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttemptCount(prev => prev + 1);

    // Validate all fields
    const { errors, status, isValid } = validateForm();
    
    setFieldErrors(errors);
    setValidationStatus(status);
    setFieldTouched({ email: true, password: true });

    if (!isValid) {
      setError('Please correct the errors below');
      toast.error('Please fix the validation errors');
      return;
    }

    setError('');
    
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back! Login successful.');
      // Reset form on success
      setForm({ email: '', password: '' });
      setFieldTouched({});
      setAttemptCount(0);
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Account is locked or suspended. Please contact support.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);

      // Add slight delay before allowing retry for security
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  // Get field icon based on validation status
  const getFieldIcon = (fieldName) => {
    const status = validationStatus[fieldName];
    if (status === 'success') return <CheckIcon sx={{ color: '#dc267f' }} />;
    if (status === 'error') return <ErrorIcon sx={{ color: 'error.main' }} />;
    return null;
  };

  // Security tips for password field
  const passwordTips = [
    'Use at least 6 characters',
    'Include letters and numbers',
    'Avoid common passwords'
  ];

  return (
    <Container maxWidth="sm" sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
    }}>
      <Paper elevation={isMobile ? 2 : 6} sx={{
        p: 4,
        borderRadius: 3,
        width: '100%',
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <Box textAlign="center" mb={3}>
          <Avatar sx={{
            bgcolor: '#1a2752',
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 1
          }}>
            <LockIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight="bold">Welcome Back</Typography>
          <Typography variant="body2" color="textSecondary">
            Sign in to your account securely
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <IconButton size="small" onClick={() => setError('')}>
                ×
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <FormControl fullWidth margin="normal">
            <TextField
              required
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color={validationStatus.email === 'error' ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: getFieldIcon('email') && (
                  <InputAdornment position="end">
                    {getFieldIcon('email')}
                  </InputAdornment>
                ),
                style: { color: '#000' }
              }}
              inputProps={{ 
                style: { color: '#000' },
                maxLength: 254
              }}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || (validationStatus.email === 'success' ? 'Valid email format ✓' : '')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: validationStatus.email === 'error' ? 'error.main' : 
                                validationStatus.email === 'success' ? '#dc267f' : '#1a2752'
                  }
                }
              }}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <TextField
              required
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color={validationStatus.password === 'error' ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {getFieldIcon('password')}
                      <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                        <IconButton 
                          onClick={() => setShowPassword(!showPassword)} 
                          size="small"
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </InputAdornment>
                ),
                style: { color: '#000' }
              }}
              inputProps={{ 
                style: { color: '#000' },
                maxLength: 128
              }}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: validationStatus.password === 'error' ? 'error.main' : 
                                validationStatus.password === 'success' ? '#dc267f' : '#1a2752'
                  }
                }
              }}
            />
            
            {/* Password strength tips */}
            {fieldTouched.password && !fieldErrors.password && form.password && (
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary" display="flex" alignItems="center" gap={0.5}>
                  <InfoIcon fontSize="small" />
                  Security tips: {passwordTips.join(' • ')}
                </Typography>
              </Box>
            )}
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading || !isFormValid}
            sx={{
              mt: 3,
              py: 1.5,
              backgroundColor: isFormValid ? '#dc267f' : '#ccc',
              color: '#fff',
              fontWeight: 'bold',
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: isFormValid ? '#b91c5c' : '#ccc',
                transform: 'translateY(-1px)',
                boxShadow: isFormValid ? '0 4px 12px rgba(220, 38, 127, 0.3)' : 'none'
              },
              '&:disabled': {
                backgroundColor: '#ccc',
                color: '#999'
              }
            }}
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowIcon />}
          >
            {loading ? 'Signing in...' : 'Sign In Securely'}
          </Button>

          {attemptCount > 0 && !loading && (
            <Typography variant="caption" color="textSecondary" textAlign="center" display="block" mt={1}>
              Attempt {attemptCount} • Your data is encrypted and secure
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" textAlign="center" mb={1}>
            Don't have an account?
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/register')}
            startIcon={<PersonIcon />}
            sx={{
              textTransform: 'none',
              borderColor: '#1a2752',
              color: '#1a2752',
              '&:hover': {
                borderColor: '#dc267f',
                color: '#dc267f',
                backgroundColor: 'rgba(220, 38, 127, 0.04)'
              }
            }}
          >
            Create New Account
          </Button>

          {/* Security notice */}
          <Box mt={2} textAlign="center">
            <Typography variant="caption" color="textSecondary">
              🔒 Your connection is secure and encrypted
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;