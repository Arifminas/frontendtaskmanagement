import axiosInstance from './axiosInstance';

// Create new task
export const createTask = async (taskData) => {
  const response = await axiosInstance.post('/tasks', taskData);
  return response.data.data;
};

// Get tasks assigned to current user
export const fetchMyTasks = async () => {
  const response = await axiosInstance.get('/tasks/');
  return response.data.data;  // Your backend sends { success: true, data: tasks }
};

// Get task details by ID
export const fetchTaskById = async (taskId) => {
  const response = await axiosInstance.get(`/tasks/${taskId}`);
  return response.data.data;
};

// Update task status (e.g., pending, ongoing, completed)
export const updateTaskStatus = async (taskId, status) => {
  const response = await axiosInstance.patch(`/tasks/${taskId}/status`, { status });
  return response.data.task;
};

// Add comment to a task
export const addTaskComment = async (taskId, text) => {
  const response = await axiosInstance.post(`/tasks/${taskId}/comments`, { text });
  return response.data.comment;
};

// Fetch comments for a specific task
export const fetchTaskComments = async (taskId) => {
  const response = await axiosInstance.get(`/tasks/${taskId}/comments`);
  return response.data.comments; // array of comments
};

export const updateTask = async (taskId, updatedData) => {
  try {
    const response = await axiosInstance.put(`/tasks/${taskId}`, updatedData);
    return response.data.data; // return updated task data
  } catch (error) {
    // Throw error to be handled by caller
    throw error.response?.data || error;
  }
};

// Upload attachment to a task
// export const uploadTaskAttachment = async (taskId, formData) => {
//   const response = await axiosInstance.post(`/tasks/${taskId}/attachments`, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data.attachment;
// };

export const uploadTaskAttachments = async (taskId, files) => {
  if (!taskId) throw new Error('Task ID is required');
  if (!files || files.length === 0) throw new Error('No files to upload');

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('attachments', files[i]);
  }
  formData.append('taskId', taskId);

  const response = await axiosInstance.post('/tasks/upload-attachments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data; // { success: true, data: task }
};

export const getTaskHistory = async (taskId) => {
  try {
    const response = await axiosInstance.get(`/tasks/${taskId}/history`);
    return response.data.data; // should match your backend response: { success: true, data: [...] }
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchRecommendedTasks = async () => {
  const response = await axiosInstance.get('/tasks/recommendations');
  return response.data.data;
};