import axiosInstance from './axiosInstance';

// Fetch all public chat messages
export const fetchPublicMessages = async () => {
  const response = await axiosInstance.get('/chat/public');
  return response.data.messages;  // Adjust if your backend returns differently
};

// Fetch department-specific chat messages
export const fetchDepartmentMessages = async (departmentId) => {
  const response = await axiosInstance.get(`/chat/department/${departmentId}`);
  return response.data.messages;
};

// Send a message to public chat
export const sendPublicMessage = async (message) => {
  const response = await axiosInstance.post('/chat/public', { message });
  return response.data;
};

// Send a message to department chat
export const sendDepartmentMessage = async (departmentId, message) => {
  const response = await axiosInstance.post(`/chat/department/${departmentId}`, { message });
  return response.data;
};
