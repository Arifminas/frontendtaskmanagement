import axiosInstance from './axiosInstance';

export const getUserNotifications = async () => {
  const res = await axiosInstance.get('/notifications');
  return res.data.data;
};

export const markNotificationAsRead = async (id) => {
  await axiosInstance.put(`/notifications/${id}/read`);
};
