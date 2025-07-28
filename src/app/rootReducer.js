import { combineReducers } from '@reduxjs/toolkit';

// Import your slices here
import authReducer from '../features/auth/authSlice';
import taskReducer from '../features/tasks/taskSlice';
import userReducer from '../features/users/userSlice';
import departmentReducer from '../features/departments/departmentSlice';
import assetReducer from '../features/assets/assetSlice';
import notificationReducer from '../features/notifications/notificationSlice';

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
  users: userReducer,
  departments: departmentReducer,
  assets: assetReducer,
  notifications: notificationReducer,
  // add more slices as needed
});

export default rootReducer;
