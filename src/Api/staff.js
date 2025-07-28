import axiosInstance from './axiosInstance';

// Get all staff members
export const fetchStaff = async () => {
  const response = await axiosInstance.get('/staff');
  return response.data.staff; // Adjust if backend returns differently
};

// Get single staff by ID
export const fetchStaffById = async (staffId) => {
  const response = await axiosInstance.get(`/staff/${staffId}`);
  return response.data.staff;
};

// Create new staff member
export const createStaff = async (data) => {
  const response = await axiosInstance.post('/staff', data);
  return response.data.staff;
};

// Update existing staff member
export const updateStaff = async (staffId, data) => {
  const response = await axiosInstance.put(`/staff/${staffId}`, data);
  return response.data.staff;
};

// Delete staff member
export const deleteStaff = async (staffId) => {
  const response = await axiosInstance.delete(`/staff/${staffId}`);
  return response.data;
};

// Transfer staff between branches
export const transferStaff = async (staffId, transferData) => {
  const response = await axiosInstance.post(`/staff/${staffId}/transfer`, transferData);
  return response.data;
};

// Get staff transfer history
export const fetchTransferHistory = async (staffId) => {
  const response = await axiosInstance.get(`/staff/${staffId}/transfer-history`);
  return response.data.history;
};
