import axiosInstance from './axiosInstance';

// Fetch all users
export const fetchUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data.data; // backend returns { success: true, data: [users] }
};

// Fetch single user by ID
export const fetchUserById = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data.data; // backend returns { success: true, data: user }
};

// Create new user
export const createUser = async (userData) => {
  const response = await axiosInstance.post('/users', userData);
  return response.data.data;
};

// Update user by ID
export const updateUser = async (userId, userData) => {
  const response = await axiosInstance.put(`/users/${userId}`, userData);
  return response.data.data;
};



// Update current logged-in user's profile
// export const updateCurrentUser = async (userData) => {
//   const response = await axiosInstance.put('/users/me', userData);
//   return response.data.data;
// };

// Change password for current user
export const changePassword = async (passwordData) => {
  const response = await axiosInstance.put('/users/change-password', passwordData);
  return response.data;
};

// Delete user by ID
export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};

// Get current logged-in user's profile
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/users/me');
  return response.data.data;
};

export const updateUserProfile = async (userData) => {
  const response = await axiosInstance.put('/users/me', userData);
  return response.data.data;
};


