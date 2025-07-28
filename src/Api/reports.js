import axiosInstance from './axiosInstance';

// Get count of tasks by status
export const fetchTaskStatusCount = async () => {
  const response = await axiosInstance.get('/reports/task-status-count');
  return response.data;
};

// Get user reports with optional query params (e.g., date range)
export const fetchUserReports = async (params) => {
  const response = await axiosInstance.get('/reports/user', { params });
  return response.data;
};

// Get department reports with optional query params
export const fetchDepartmentReports = async (params) => {
  const response = await axiosInstance.get('/reports/department', { params });
  return response.data;
};

// Get asset reports with optional query params
export const fetchAssetReports = async (params) => {
  const response = await axiosInstance.get('/reports/asset', { params });
  return response.data;
};

export const getTaskStatusCount = async () => {
  const response = await axiosInstance.get('/reports/task-status-count');
  return response.data;
};