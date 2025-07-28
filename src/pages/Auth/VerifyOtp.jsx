import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  InputAdornment
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../Api/axiosInstance';
import { toast } from 'react-toastify';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Update form state
    const otpString = newOtpValues.join('');
    setForm({ ...form, otp: otpString });

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear errors
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtpValues = pastedData.split('');
      setOtpValues(newOtpValues);
      setForm({ ...form, otp: pastedData });
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.otp.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/verify-otp', form);
      setSuccess(res.data.message || 'Verification successful!');
      toast.success('Email verified successfully! Redirecting to login...');

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.post('/auth/resend-otp', { email: form.email });
      toast.success('OTP resent successfully!');
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
      setForm({ ...form, otp: '' });
      inputRefs.current[0]?.focus();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
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

  const otpBoxVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1
      }
    }
  };

  const digitVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 }
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
                <VerifiedIcon 
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
                Verify Your Email
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: 'center', maxWidth: 400 }}
              >
                Enter the 6-digit verification code sent to
              </Typography>

              <Chip
                icon={<EmailIcon />}
                label={form.email}
                variant="outlined"
                sx={{
                  mt: 1,
                  borderColor: '#dc267f',
                  color: '#dc267f',
                  '& .MuiChip-icon': {
                    color: '#dc267f'
                  }
                }}
              />
            </Box>
          </motion.div>

          {/* Timer */}
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Code expires in: 
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    fontWeight: 'bold',
                    color: timeLeft < 60 ? '#dc267f' : '#1a2752'
                  }}
                >
                  {formatTime(timeLeft)}
                </Box>
              </Typography>
            </Box>
          </motion.div>

          {/* Error/Success Alerts */}
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
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: 20
                    }
                  }}
                >
                  {success}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Input */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <motion.div variants={itemVariants}>
              <Typography
                variant="subtitle1"
                sx={{
                  textAlign: 'center',
                  mb: 3,
                  fontWeight: 600,
                  color: '#1a2752'
                }}
              >
                Enter Verification Code
              </Typography>

              <motion.div variants={otpBoxVariants}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: { xs: 1, sm: 2 },
                    mb: 4
                  }}
                >
                  {otpValues.map((value, index) => (
                    <motion.div key={index} variants={digitVariants}>
                      <TextField
                        inputRef={(el) => (inputRefs.current[index] = el)}
                        value={value}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        inputProps={{
                          maxLength: 1,
                          style: {
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            padding: '16px 8px'
                          }
                        }}
                        sx={{
                          width: { xs: 45, sm: 56 },
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
                                borderWidth: 2
                              }
                            }
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || form.otp.length !== 6}
                sx={{
                  mt: 2,
                  mb: 3,
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
                  '&:disabled': {
                    backgroundColor: 'rgba(220, 38, 127, 0.3)',
                    transform: 'none',
                  },
                  transition: 'all 0.3s ease',
                }}
                startIcon={success ? <CheckIcon /> : <SecurityIcon />}
                endIcon={loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArrowIcon />
                )}
              >
                {loading ? 'Verifying...' : success ? 'Verified!' : 'Verify Email'}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Didn't receive the code?
                </Typography>
              </Divider>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleResendOtp}
                  disabled={!canResend || resendLoading}
                  startIcon={resendLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: canResend ? '#1a2752' : 'rgba(26, 39, 82, 0.3)',
                    color: canResend ? '#1a2752' : 'rgba(26, 39, 82, 0.3)',
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 3, sm: 4 },
                    '&:hover': {
                      borderColor: canResend ? '#dc267f' : 'rgba(26, 39, 82, 0.3)',
                      backgroundColor: canResend ? 'rgba(220, 38, 127, 0.04)' : 'transparent',
                      color: canResend ? '#dc267f' : 'rgba(26, 39, 82, 0.3)',
                      transform: canResend ? 'translateY(-1px)' : 'none',
                      boxShadow: canResend ? '0 4px 20px rgba(220, 38, 127, 0.2)' : 'none',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(26, 39, 82, 0.2)',
                      color: 'rgba(26, 39, 82, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {resendLoading ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
                </Button>
              </Box>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default VerifyOtp;