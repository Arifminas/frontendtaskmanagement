import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../Api/axiosInstance';

// Fetch departments list
export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/departments');
      return response.data.departments;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch departments');
    }
  }
);

// Create a new department
export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/departments', departmentData);
      return response.data.department;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to create department');
    }
  }
);

// Update existing department
export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/departments/${id}`, updatedData);
      return response.data.department;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update department');
    }
  }
);

// Slice
const departmentSlice = createSlice({
  name: 'departments',
  initialState: {
    departments: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearDepartments(state) {
      state.departments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(dep => dep._id === action.payload._id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      });
  },
});

export const { clearDepartments } = departmentSlice.actions;
export default departmentSlice.reducer;
