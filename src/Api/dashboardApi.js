import axiosInstance from './axiosInstance';

export const fetchDashboardData = async () => {
  try {
    const response = await axiosInstance.get('/dashboard');
    return response.data.data;
  } catch (error) {
    // Optionally, handle or log the error here or rethrow
    throw error;
  }
};

export const fetchActiveUsers = async () => {
  const response = await axiosInstance.get('/dashboard/active-users');
  return response.data.data;
};