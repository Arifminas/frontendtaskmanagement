import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

// Optional: Import middleware if needed, e.g. redux-logger, redux-thunk (thunk is included by default)

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable if you use non-serializable data like Date or functions in actions/state
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
