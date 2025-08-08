import React, { useState, useEffect, useMemo } from 'react';
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
  Grid,
  OutlinedInput,
  CircularProgress,
  useMediaQuery,
  LinearProgress,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
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
  ErrorOutlined,
  Check,
  Close,
  Security,
  Info
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axiosPublic from '../../Api/axiosPublic';         // public client (no interceptors)
import axiosInstance from '../../Api/axiosInstance';     // for /auth/register only
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const THEME_PRIMARY = '#1a2752';
const THEME_ACCENT = '#dc267f';

/* ---------------------------- Password helpers ---------------------------- */
const hasUpper = (s) => /[A-Z]/.test(s);
const hasLower = (s) => /[a-z]/.test(s);
const hasNumber = (s) => /[0-9]/.test(s);
const hasSpecial = (s) => /[^A-Za-z0-9]/.test(s);
const minLength = (s) => (s || '').length >= 8;
const hasNoSpaces = (s) => !/\s/.test(s);
const isNotCommon = (s) => {
  const common = ['password', '12345678', 'qwerty', 'abc123', 'password123', '123456789'];
  return !common.includes((s || '').toLowerCase());
};

const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '#e0e0e0', checks: {} };

  const checks = {
    length: minLength(password),
    upper: hasUpper(password),
    lower: hasLower(password),
    number: hasNumber(password),
    special: hasSpecial(password),
    noSpaces: hasNoSpaces(password),
    notCommon: isNotCommon(password),
  };

  let score = 0;
  // Base points
  if (checks.length) score += 8;
  if (checks.upper) score += 8;
  if (checks.lower) score += 8;
  if (checks.number) score += 8;
  if (checks.special) score += 8;

  // Bonuses
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (checks.noSpaces) score += 10;
  if (checks.notCommon) score += 15;

  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 10;

  if (score < 40) return { score, label: 'Weak', color: '#f44336', checks };
  if (score < 70) return { score, label: 'Fair', color: '#ff9800', checks };
  if (score < 85) return { score, label: 'Good', color: '#2196f3', checks };
  if (score < 95) return { score, label: 'Strong', color: '#4caf50', checks };
  return { score, label: 'Excellent', color: '#2e7d32', checks };
};

/* ------------------------- Password strength component ------------------------- */
const PasswordStrengthMeter = ({ password, show }) => {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  const requirements = [
    { key: 'length', label: 'At least 8 characters', met: strength.checks?.length },
    { key: 'upper', label: 'One uppercase letter', met: strength.checks?.upper },
    { key: 'lower', label: 'One lowercase letter', met: strength.checks?.lower },
    { key: 'number', label: 'One number', met: strength.checks?.number },
    { key: 'special', label: 'One special character', met: strength.checks?.special },
  ];

  return (
    <Collapse in={show && password.length > 0}>
      <Box sx={{ mt: 1, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        {/* Strength Indicator */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              Password Strength
            </Typography>
            <Chip
              label={strength.label}
              size="small"
              sx={{ backgroundColor: strength.color, color: 'white', fontWeight: 600, minWidth: 70 }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={strength.score}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': { backgroundColor: strength.color, borderRadius: 3 },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {strength.score}/100 strength score
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Requirements */}
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security fontSize="small" />
          Password Requirements
        </Typography>
        <List dense sx={{ py: 0 }}>
          {requirements.map((req) => (
            <ListItem key={req.key} sx={{ px: 0, py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {req.met ? (
                  <Check sx={{ color: '#4caf50', fontSize: 18 }} />
                ) : (
                  <Close sx={{ color: '#f44336', fontSize: 18 }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={req.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                    color: req.met ? '#4caf50' : '#666',
                    fontWeight: req.met ? 500 : 400,
                  },
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Tips */}
        {strength.score < 70 && (
          <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Info sx={{ fontSize: 16, color: '#856404', mt: 0.1 }} />
              <span style={{ color: '#856404' }}>
                <strong>Tip:</strong> Use a longer password with a mix of characters. Avoid common words and personal info.
              </span>
            </Typography>
          </Box>
        )}
      </Box>
    </Collapse>
  );
};

/* -------------------------------- Register -------------------------------- */
const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));

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
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Departments
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [deptError, setDeptError] = useState('');

  /* ------------------------ Fetch departments (public) ------------------------ */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setDeptLoading(true);
      setDeptError('');
      try {
        const res = await axiosPublic.get('/departments/public');
        if (!mounted) return;
        const list = res?.data?.data || [];
        const normalized = list
          .map((d) => ({ _id: d._id, name: d.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setDepartments(normalized);
      } catch (err) {
        if (!mounted) return;
        console.error('Departments public fetch failed:', err);
        const msg = err?.response?.data?.message || 'Failed to load departments.';
        setDeptError(msg);
      } finally {
        if (mounted) setDeptLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /* ------------------------------- Validation ------------------------------- */
  const validate = (field, value, currentForm = form) => {
    switch (field) {
      case 'name': {
        const v = (value || '').trim();
        if (!v) return 'Name is required';
        if (v.length < 2) return 'Name must be at least 2 characters';
        if (v.length > 50) return 'Name must be less than 50 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(v)) return 'Only letters, spaces, hyphens, and apostrophes';
        return '';
      }
      case 'email': {
        const v = (value || '').trim();
        if (!v) return 'Email is required';
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(v)) return 'Please enter a valid email address';
        if (v.length > 254) return 'Email address is too long';
        return '';
      }
      case 'password': {
        const v = value || '';
        if (!v) return 'Password is required';
        const { checks } = calculatePasswordStrength(v);
        if (!checks.length) return 'At least 8 characters required';
        if (!checks.upper) return 'Include at least one uppercase letter';
        if (!checks.lower) return 'Include at least one lowercase letter';
        if (!checks.number) return 'Include at least one number';
        if (!checks.special) return 'Include at least one special character';
        if (!checks.noSpaces) return 'Password cannot contain spaces';
        if (!checks.notCommon) return 'Choose a less common password';
        return '';
      }
      case 'confirmPassword': {
        const v = value || '';
        if (!v) return 'Please confirm your password';
        if (v !== (currentForm.password || '')) return 'Passwords do not match';
        return '';
      }
      case 'department': {
        const v = value || '';
        if (!v) return 'Please select a department';
        return '';
      }
      default:
        return '';
    }
  };

  const getValidationIcon = (field) => {
    if (!touched[field] || !form[field]) return null;
    const err = validate(field, form[field], form);
    return err
      ? <ErrorOutlined sx={{ color: '#f44336', fontSize: 20 }} />
      : <CheckCircleOutlined sx={{ color: THEME_ACCENT, fontSize: 20 }} />;
  };

  const isFormValid = () => {
    const fields = ['name', 'email', 'password', 'confirmPassword', 'department'];
    return fields.every((f) => form[f] && !validate(f, form[f], form));
  };

  /* -------------------------------- Handlers -------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value, nextForm) }));
    }

    if (name === 'password' && touched.confirmPassword && nextForm.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validate('confirmPassword', nextForm.confirmPassword, nextForm),
      }));
    }

    if (name === 'confirmPassword' && touched.password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validate('confirmPassword', value, nextForm),
      }));
    }

    if (generalError) setGeneralError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value, form) }));
  };

  const handlePasswordFocus = () => setShowPasswordHelp(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fields = ['name', 'email', 'password', 'confirmPassword', 'department'];
    const nextErrors = {};
    fields.forEach((f) => {
      const err = validate(f, form[f], form);
      if (err) nextErrors[f] = err;
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const nextTouched = fields.reduce((acc, f) => ((acc[f] = true), acc), {});
      setTouched(nextTouched);
      setGeneralError('Please fix the errors below before submitting');
      return;
    }

    const passwordStrength = calculatePasswordStrength(form.password);
    if (passwordStrength.score < 40) {
      setGeneralError('Please choose a stronger password for better security');
      return;
    }

    setSubmitting(true);
    try {
      const deptName = departments.find(d => d._id === form.department)?.name;
      if (!deptName) {
        setGeneralError('Please select a valid department');
        return;
      }
      const res = await axiosInstance.post(
        '/auth/register',
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          department: deptName,
          role: form.role,
        },
        { skipAuthRedirect: true }
      );

      toast.success(res?.data?.message || 'Registration successful!');
      setTimeout(() => navigate('/verify-otp', { state: { email: form.email.trim() } }), 800);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setGeneralError(errorMsg);
      toast.error(errorMsg);
      console.log('Submitting department:', { selectedId: form.department, name: deptName });
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------- Styles --------------------------------- */
  const textFieldStyles = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      backgroundColor: '#ffffff',
      transition: 'all 0.2s ease-in-out',
      '& input': {
        color: `${THEME_PRIMARY} !important`,
        fontSize: '16px',
        fontWeight: 500,
        WebkitTextFillColor: `${THEME_PRIMARY} !important`,
        '&:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
          WebkitTextFillColor: `${THEME_PRIMARY} !important`,
          backgroundColor: '#ffffff !important',
        },
      },
      '&:hover fieldset': { borderColor: '#999' },
      '&.Mui-focused fieldset': { borderColor: THEME_PRIMARY, borderWidth: 2 },
      '&.Mui-error fieldset': { borderColor: '#f44336' },
    },
    '& .MuiInputLabel-root': {
      color: '#666666',
      fontSize: '16px',
      '&.Mui-focused': { color: THEME_PRIMARY },
      '&.Mui-error': { color: '#f44336' },
    },
    '& .MuiFormHelperText-root': {
      color: '#f44336',
      fontSize: '14px',
      marginLeft: 0,
      marginTop: '6px',
    },
  };

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${THEME_PRIMARY} 0%, ${THEME_ACCENT} 100%)`,
        p: { xs: 1, sm: 2, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}
      >
        <Paper
          elevation={12}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            width: '100%',
            maxWidth: { xs: '100%', sm: 600, md: 900 },
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5 },
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 }, width: '100%' }}>
            <Avatar
              sx={{
                background: `linear-gradient(45deg, ${THEME_PRIMARY}, ${THEME_ACCENT})`,
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                mb: 1,
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                mx: 'auto',
              }}
            >
              <PersonAddIcon fontSize="large" />
            </Avatar>
            <Typography variant={isXs ? 'h5' : 'h4'} fontWeight={700} color={THEME_PRIMARY} sx={{ lineHeight: 1.2 }}>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto' }}>
              Join us today! Fill in your details to get started with a secure account
            </Typography>
          </Box>

          {/* Alerts */}
          {generalError && (
            <Alert
              severity="error"
              sx={{
                mb: { xs: 2, sm: 3 },
                borderRadius: 1.5,
                width: '100%',
                maxWidth: 700,
                mx: 'auto',
                '& .MuiAlert-message': { fontSize: '0.95rem' },
              }}
            >
              {generalError}
            </Alert>
          )}

          {!deptLoading && deptError && (
            <Alert
              severity="warning"
              sx={{ mb: 2, width: '100%', maxWidth: 700, mx: 'auto', borderRadius: 1.5 }}
            >
              {deptError} You can continue filling the form, but department selection is unavailable.
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
            <Grid container spacing={isSm ? 2 : 3} justifyContent="center" alignItems="flex-start">
              {/* Name */}
              <Grid item xs={12} md={6}>
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
                      <InputAdornment position="end">{getValidationIcon('name')}</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
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
                      <InputAdornment position="end">{getValidationIcon('email')}</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handlePasswordFocus}
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
                        <Box display="flex" gap={0.5} alignItems="center">
                          {getValidationIcon('password')}
                          <IconButton
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                            size="small"
                            sx={{ color: '#666666' }}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
                <PasswordStrengthMeter password={form.password} show={showPasswordHelp || touched.password} />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} md={6}>
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
                        <Box display="flex" gap={0.5} alignItems="center">
                          {getValidationIcon('confirmPassword')}
                          <IconButton
                            onClick={() => setShowConfirmPassword((s) => !s)}
                            edge="end"
                            size="small"
                            sx={{ color: '#666666' }}
                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={textFieldStyles} error={Boolean(errors.department)}>
                  <InputLabel sx={{ color: '#666666', '&.Mui-focused': { color: THEME_PRIMARY } }}>
                    Department
                  </InputLabel>
                  <Select
                    name="department"
                    label="Department"
                    value={form.department}
                    onChange={handleChange}
                    onBlur={(e) => {
                      setTouched((t) => ({ ...t, department: true }));
                      setErrors((prev) => ({
                        ...prev,
                        department: validate('department', e.target.value, form),
                      }));
                    }}
                    input={
                      <OutlinedInput
                        label="Department"
                        startAdornment={
                          <InputAdornment position="start">
                            <BusinessOutlined sx={{ color: '#666666' }} />
                          </InputAdornment>
                        }
                        sx={{
                          '& .MuiSelect-select': {
                            color: `${THEME_PRIMARY} !important`,
                            fontSize: '16px',
                            fontWeight: 500,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: THEME_PRIMARY,
                            borderWidth: 2,
                          },
                        }}
                      />
                    }
                    displayEmpty
                    disabled={deptLoading}
                    renderValue={(selected) => {
                      if (!selected) return 'Select Department';
                      const d = departments.find((x) => x._id === selected);
                      return d ? d.name : 'Select Department';
                    }}
                    MenuProps={{ PaperProps: { style: { maxHeight: 320, borderRadius: 8 } } }}
                  >
                    {deptLoading ? (
                      <MenuItem disabled value="">
                        <Box display="flex" alignItems="center" gap={1}>
                          <CircularProgress size={18} /> Loading departments...
                        </Box>
                      </MenuItem>
                    ) : departments.length > 0 ? (
                      departments.map((d) => (
                        <MenuItem key={d._id} value={d._id}>
                          {d.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        No departments available
                      </MenuItem>
                    )}
                  </Select>

                  {errors.department && (
                    <Typography variant="caption" sx={{ mt: 0.5, color: '#f44336', ml: 0 }}>
                      {errors.department}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Role */}
              <Grid item xs={12}>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel sx={{ color: '#666666', '&.Mui-focused': { color: THEME_PRIMARY } }}>
                    Role
                  </InputLabel>
                  <Select
                    name="role"
                    value={form.role}
                    label="Role"
                    onChange={handleChange}
                    input={
                      <OutlinedInput
                        label="Role"
                        startAdornment={
                          <InputAdornment position="start">
                            {form.role === 'admin'
                              ? <AdminPanelSettingsOutlined sx={{ color: '#666666' }} />
                              : form.role === 'coordinator'
                                ? <BusinessOutlined sx={{ color: '#666666' }} />
                                : <PersonOutlined sx={{ color: '#666666' }} />
                            }
                          </InputAdornment>
                        }
                        sx={{
                          '& .MuiSelect-select': {
                            color: `${THEME_PRIMARY} !important`,
                            fontSize: '16px',
                            fontWeight: 500,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: THEME_PRIMARY,
                            borderWidth: 2,
                          },
                        }}
                      />
                    }
                  >
                    <MenuItem value="user">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <PersonOutlined fontSize="small" sx={{ color: '#666' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>User</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Standard access with basic permissions
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="coordinator">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <BusinessOutlined fontSize="small" sx={{ color: '#666' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Coordinator</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Manage department activities and users
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="admin">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <AdminPanelSettingsOutlined fontSize="small" sx={{ color: '#666' }} />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>Admin</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Full system access and management
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Submit & progress */}
            <Box sx={{ mt: 4, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Button
                fullWidth
                type="submit"
                disabled={!isFormValid() || submitting}
                endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  maxWidth: 480,
                  width: '100%',
                  background: isFormValid() && !submitting
                    ? `linear-gradient(45deg, ${THEME_ACCENT}, ${THEME_PRIMARY})`
                    : '#e0e0e0',
                  color: isFormValid() && !submitting ? '#ffffff' : '#9e9e9e',
                  boxShadow: isFormValid() && !submitting ? '0 8px 20px rgba(220, 38, 127, 0.3)' : 'none',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: isFormValid() && !submitting
                      ? `linear-gradient(45deg, #b91c5c, ${THEME_PRIMARY})`
                      : '#e0e0e0',
                    transform: isFormValid() && !submitting ? 'translateY(-2px)' : 'none',
                    boxShadow: isFormValid() && !submitting ? '0 12px 24px rgba(220, 38, 127, 0.4)' : 'none',
                  },
                  '&:disabled': { background: '#e0e0e0', color: '#9e9e9e', transform: 'none', boxShadow: 'none' },
                }}
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </Button>

              {!submitting && (
                <Box sx={{ width: '100%', maxWidth: 480 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Form Completion
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((Object.values(form).filter(Boolean).length / 6) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(Object.values(form).filter(Boolean).length / 6) * 100}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': { backgroundColor: THEME_ACCENT, borderRadius: 2 },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Login link */}
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant="body2" textAlign="center" color="text.secondary" mb={2}>
                Already have an account?
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                startIcon={<LoginOutlined />}
                disabled={submitting}
                sx={{
                  borderRadius: 2,
                  borderColor: THEME_PRIMARY,
                  color: THEME_PRIMARY,
                  fontWeight: 500,
                  textTransform: 'none',
                  maxWidth: 480,
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: 240 },
                  py: { xs: 1.25, sm: 1.5 },
                  px: { xs: 2, sm: 4 },
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: THEME_ACCENT,
                    color: THEME_ACCENT,
                    background: 'rgba(220, 38, 127, 0.04)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Sign In Instead
              </Button>
            </Box>
          </Box>

          {/* Security Footer */}
          <Box sx={{ textAlign: 'center', mt: 3, width: '100%' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
            >
              <Security fontSize="small" />
              Secure & encrypted registration with advanced password protection
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
