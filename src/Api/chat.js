// src/Api/chat.js
import axiosInstance from './axiosInstance';

// Public history
export const fetchPublicMessages = async (params = {}) => {
  const res = await axiosInstance.get('/chat/public', { params });
  return res.data?.data || [];
};

// Department history
export const fetchDepartmentMessages = async (departmentId, params = {}) => {
  const res = await axiosInstance.get(`/chat/department/${departmentId}`, { params });
  return res.data?.data || [];
};

// POST public message (REST fallback / optional)
export const sendPublicMessage = async (message) => {
  const res = await axiosInstance.post('/chat/public', { message });
  return res.data?.data;
};

// POST department message (REST fallback / optional)
export const sendDepartmentMessage = async (departmentId, message) => {
  const res = await axiosInstance.post('/chat/department', { departmentId, message });
  return res.data?.data;
};
