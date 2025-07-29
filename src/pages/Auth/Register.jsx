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
  EmailOutlined,
  PersonOutlined,
  LockOutlined,
  BusinessOutlined,
  AdminPanelSettingsOutlined,
  LoginOutlined,
  CheckCircleOutlined,
  ErrorOutlined
} from '@mui/icons-material';
import axiosInstance from '../../Api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Validation
  const validate = (field, value) => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value?.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== form.password) return 'Passwords do not match';
        return '';
      case 'department':
        if (!value?.trim()) return 'Department is required';
        return '';
      default:
        return '';
    }
  };

  const getValidationIcon = (field) => {
    if (!touched[field] || !form[field]) return null;
    const error = validate(field, form[field]);
    return error ? 
      <ErrorOutlined sx={{ color: '#f44336', fontSize: 20 }} /> :
      <CheckCircleOutlined sx={{ color: '#dc267f', fontSize: 20 }} />;
  };

  const isFormValid = () => {
    const fields = ['name', 'email', 'password', 'confirmPassword', 'department'];
    return fields.every(field => 
      form[field] && !validate(field, form[field])
    );
  };

  // Event handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    
    // Re-validate confirm password if password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validate('confirmPassword', form.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
    
    if (generalError) setGeneralError('');
  }, [touched, generalError, form.confirmPassword]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    const fields = ['name', 'email', 'password', 'confirmPassword', 'department'];
    
    fields.forEach(field => {
      const error = validate(field, form[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.fromEntries(fields.map(field => [field, true])));
      setGeneralError('Please fix the errors below');
      return;
    }

    try {
      const res = await axiosInstance.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        role: form.role,
      });
      
      toast.success(res.data.message || 'Registration successful!');
      setTimeout(() => navigate('/verify-otp', { state: { email: form.email } }), 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setGeneralError(errorMsg);
      toast.error(errorMsg);
    }
  }, [form, navigate]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': 
        return <AdminPanelSettingsOutlined />;
      case 'coordinator': 
        return <BusinessOutlined />;
      default: 
        return <PersonOutlined />;
    }
  };

  // Common text field styles
  const textFieldStyles = {
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
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a2752 0%, #dc267f 100%)',
        p: 2,
        boxSizing: 'border-box'
      }}
    >
      <Container 
        maxWidth="md" 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Paper 
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.98)',
            width: '100%',
            maxWidth: 800,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Avatar 
              sx={{
                background: 'linear-gradient(45deg, #1a2752, #dc267f)',
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 2
              }}
            >
              <PersonAddIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight={600} color="#1a2752" mb={0.5}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join us today! Fill in your details to get started
            </Typography>
          </Box>

          {/* Error Alert */}
          {generalError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 1,
                width: '100%',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              {generalError}
            </Alert>
          )}

          {/* Form */}
          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
              {/* Name Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  autoComplete="name"
                  sx={textFieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlined sx={{ color: '#666666' }} />
                      </InputAdornment>
                    ),
                    endAdornment: getValidationIcon('name') && (
                      <InputAdornment position="end">
                        {getValidationIcon('name')}
                      </InputAdornment>
                    ),
                    style: { color: '#1a2752', fontSize: '16px', fontWeight: 500 }
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
              </Grid>

              {/* Email Field */}
              <Grid item xs={12} sm={6}>
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
                  sx={textFieldStyles}
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
                    style: { color: '#1a2752', fontSize: '16px', fontWeight: 500 }
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
              </Grid>

              {/* Password Field */}
              <Grid item xs={12} sm={6}>
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
                  autoComplete="new-password"
                  sx={textFieldStyles}
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
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    ),
                    style: { color: '#1a2752', fontSize: '16px', fontWeight: 500 }
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
              </Grid>

              {/* Confirm Password Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                  autoComplete="new-password"
                  sx={textFieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#666666' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box display="flex" gap={0.5}>
                          {getValidationIcon('confirmPassword')}
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: '#666666' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    ),
                    style: { color: '#1a2752', fontSize: '16px', fontWeight: 500 }
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
              </Grid>

              {/* Department Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="department"
                  label="Department"
                  value={form.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.department)}
                  helperText={errors.department}
                  sx={textFieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlined sx={{ color: '#666666' }} />
                      </InputAdornment>
                    ),
                    endAdornment: getValidationIcon('department') && (
                      <InputAdornment position="end">
                        {getValidationIcon('department')}
                      </InputAdornment>
                    ),
                    style: { color: '#1a2752', fontSize: '16px', fontWeight: 500 }
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
              </Grid>

              {/* Role Field */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel sx={{ color: '#666666', '&.Mui-focused': { color: '#1a2752' } }}>
                    Role
                  </InputLabel>
                  <Select
                    name="role"
                    value={form.role}
                    label="Role"
                    onChange={handleChange}
                    sx={{
                      '& .MuiSelect-select': {
                        color: '#1a2752 !important',
                        fontSize: '16px',
                        fontWeight: 500
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1a2752'
                      }
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        {getRoleIcon(form.role)}
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="user">
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonOutlined fontSize="small" />
                        User
                      </Box>
                    </MenuItem>
                    <MenuItem value="coordinator">
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessOutlined fontSize="small" />
                        Coordinator
                      </Box>
                    </MenuItem>
                    <MenuItem value="admin">
                      <Box display="flex" alignItems="center" gap={1}>
                        <AdminPanelSettingsOutlined fontSize="small" />
                        Admin
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              fullWidth
              type="submit"
              disabled={!isFormValid()}
              endIcon={<PersonAddIcon />}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                maxWidth: 400,
                mx: 'auto',
                display: 'block',
                background: isFormValid() 
                  ? 'linear-gradient(45deg, #dc267f, #1a2752)' 
                  : '#e0e0e0',
                color: isFormValid() ? '#ffffff' : '#9e9e9e',
                '&:hover': {
                  background: isFormValid() 
                    ? 'linear-gradient(45deg, #b91c5c, #1a2752)' 
                    : '#e0e0e0'
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              Create Account
            </Button>

            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant="body2" textAlign="center" color="text.secondary" mb={1}>
                Already have an account?
              </Typography>

              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                startIcon={<LoginOutlined />}
                sx={{
                  borderRadius: 1.5,
                  borderColor: '#1a2752',
                  color: '#1a2752',
                  fontWeight: 500,
                  textTransform: 'none',
                  maxWidth: 400,
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: 200,
                  '&:hover': {
                    borderColor: '#dc267f',
                    color: '#dc267f',
                    background: 'rgba(220, 38, 127, 0.04)'
                  }
                }}
              >
                Sign In Instead
              </Button>
            </Box>
          </Box>

          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              textAlign: 'center', 
              display: 'block', 
              mt: 2,
              width: '100%'
            }}
          >
            🔒 Secure & encrypted registration
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;