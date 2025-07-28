import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../Api/notificationApi';

export const fetchNotifications = createAsyncThunk('notifications/fetch', api.getUserNotifications);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], loading: false },
  reducers: {
    markRead: (state, action) => {
      const notif = state.items.find(n => n._id === action.payload);
      if (notif) notif.isRead = true;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      });
  },
});

export const { markRead, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
