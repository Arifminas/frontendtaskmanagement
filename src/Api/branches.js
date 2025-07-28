import axiosInstance from './axiosInstance';

// Get all branches
export const fetchBranches = async () => {
  const response = await axiosInstance.get('/branches');
  return response.data.branches;
};

// Get single branch by ID
export const fetchBranchById = async (branchId) => {
  const response = await axiosInstance.get(`/branches/${branchId}`);
  return response.data.branch;
};

// Create new branch
export const createBranch = async (branchData) => {
  const response = await axiosInstance.post('/branches', branchData);
  return response.data.branch;
};

// Update existing branch
export const updateBranch = async (branchId, branchData) => {
  const response = await axiosInstance.put(`/branches/${branchId}`, branchData);
  return response.data.branch;
};

// Delete branch
export const deleteBranch = async (branchId) => {
  const response = await axiosInstance.delete(`/branches/${branchId}`);
  return response.data.message;
};

export const getBranches = async () => {
  const response = await axiosInstance.get('/branches');
  return response.data.branches;  // adjust if your API returns differently
};
