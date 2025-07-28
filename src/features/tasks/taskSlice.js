import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../Api/axiosInstance';


// Fetch task list ok 
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/tasks');
      return response.data.tasks;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch tasks');
    }
  }
);

// Create new task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/tasks', taskData);
      return response.data.task;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to create task');
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/tasks/${id}`, updatedData);
      return response.data.task;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update task');
    }
  }
);

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearTasks(state) {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTasks } = taskSlice.actions;

export default taskSlice.reducer;
