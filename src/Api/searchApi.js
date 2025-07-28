// src/api/searchApi.js
import axiosInstance from './axiosInstance';

export const performGlobalSearch = async (query) => {
  const res = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
  
  // return full structured object so frontend can destructure
  return {
    tasks: res.data?.data?.tasks || [],
    users: res.data?.data?.users || [],
    notifications: res.data?.data?.notifications || [],
  };
};

export const searchTasks = async (query) => {
  const res = await axiosInstance.get(`/search/tasks?q=${encodeURIComponent(query)}`);
  return res.data.data;
};

export const searchUsers = async (query) => {
  const res = await axiosInstance.get(`/search/users?q=${encodeURIComponent(query)}`);
  return res.data.data;
};

export const searchNotifications = async (query) => {
  const res = await axiosInstance.get(`/search/notifications?q=${encodeURIComponent(query)}`);
  return res.data.data;
};

// 🔍 All-in-one route (if needed)
export const searchAll = async (query) => {
  const res = await axiosInstance.get(`/search/all?q=${encodeURIComponent(query)}`);
  return res.data.data;
};
