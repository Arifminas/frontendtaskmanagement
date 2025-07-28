import axiosInstance from './axiosInstance';

// Fetch all departments
export const fetchDepartments = async () => {
  const response = await axiosInstance.get('/departments');
  return response.data.data; // according to backend response
};

// Fetch single department by ID
export const fetchDepartmentById = async (deptId) => {
  const response = await axiosInstance.get(`/departments/${deptId}`);
  return response.data.data; // according to backend response
};

// Create a new department
export const createDepartment = async (data) => {
  const response = await axiosInstance.post('/departments', data);
  return response.data.data;
};

// Update existing department
export const updateDepartment = async (deptId, data) => {
  const response = await axiosInstance.put(`/departments/${deptId}`, data);
  return response.data.data;
};

// Delete a department
export const deleteDepartment = async (deptId) => {
  const response = await axiosInstance.delete(`/departments/${deptId}`);
  return response.data;
};

export const assignLeads = async (data) => {
  const response = await axiosInstance.put('/departments/assign-leads', data);
  return response.data.data;
};

export const fetchDepartmentsWithLocation = async () => {
  const res = await axiosInstance.get('/departments/map');
  return res.data.data;
};

