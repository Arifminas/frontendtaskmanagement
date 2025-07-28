import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Fetch assets list
export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/assets');
      return response.data.assets;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch assets');
    }
  }
);

// Create asset
export const createAsset = createAsyncThunk(
  'assets/createAsset',
  async (assetData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/assets', assetData);
      return response.data.asset;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to create asset');
    }
  }
);

// Update asset
export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/assets/${id}`, updatedData);
      return response.data.asset;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update asset');
    }
  }
);

// Slice
const assetSlice = createSlice({
  name: 'assets',
  initialState: {
    assets: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAssets(state) {
      state.assets = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assets = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.assets.push(action.payload);
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        const index = state.assets.findIndex(asset => asset._id === action.payload._id);
        if (index !== -1) {
          state.assets[index] = action.payload;
        }
      });
  },
});

export const { clearAssets } = assetSlice.actions;
export default assetSlice.reducer;
