import axiosInstance from './axiosInstance';

// Register new user
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

// Verify OTP after registration
export const verifyOtp = async (data) => {
  const response = await axiosInstance.post('/auth/verify-otp', data);
  return response.data;
};

// User login
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

// User logout
export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

// Forgot password (send email)
export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

// Refresh JWT token
export const refreshToken = async () => {
  const response = await axiosInstance.post('/auth/refresh-token');
  return response.data;
};
