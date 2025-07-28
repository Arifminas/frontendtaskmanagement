import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchAssetGroups,
  createAssetGroup,
  updateAssetGroup,
  deleteAssetGroup,
} from '../../Api/assetGroups';

export const getAssetGroups = createAsyncThunk(
  'assetGroups/getAssetGroups',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAssetGroups();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch asset groups');
    }
  }
);

export const addAssetGroup = createAsyncThunk(
  'assetGroups/addAssetGroup',
  async (data, { rejectWithValue }) => {
    try {
      return await createAssetGroup(data);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create asset group');
    }
  }
);

export const editAssetGroup = createAsyncThunk(
  'assetGroups/editAssetGroup',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateAssetGroup(id, data);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update asset group');
    }
  }
);

export const removeAssetGroup = createAsyncThunk(
  'assetGroups/removeAssetGroup',
  async (id, { rejectWithValue }) => {
    try {
      return await deleteAssetGroup(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete asset group');
    }
  }
);

const assetGroupSlice = createSlice({
  name: 'assetGroups',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAssetGroups(state) {
      state.list = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAssetGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssetGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getAssetGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addAssetGroup.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      .addCase(editAssetGroup.fulfilled, (state, action) => {
        const index = state.list.findIndex(ag => ag._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })

      .addCase(removeAssetGroup.fulfilled, (state, action) => {
        state.list = state.list.filter(ag => ag._id !== action.meta.arg);
      });
  },
});

export const { clearAssetGroups } = assetGroupSlice.actions;
export default assetGroupSlice.reducer;
