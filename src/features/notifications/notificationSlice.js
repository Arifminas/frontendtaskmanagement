import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],  // Array of notifications { id, type, message, read }
  },
  reducers: {
    addNotification(state, action) {
      state.list.push(action.payload);
    },
    removeNotification(state, action) {
      state.list = state.list.filter(n => n.id !== action.payload);
    },
    markAsRead(state, action) {
      const notification = state.list.find(n => n.id === action.payload);
      if (notification) notification.read = true;
    },
    clearNotifications(state) {
      state.list = [];
    },
  },
});

export const { addNotification, removeNotification, markAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
