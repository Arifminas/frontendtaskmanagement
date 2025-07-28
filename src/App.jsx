// src/App.jsx
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import NotificationListener from './components/notifications/NotificationListener';
import AppRoutes from './routes/AppRoutes';
import { NotificationProvider } from './contexts/NotificationContext';
// import Topbar from './components/common/Topbar';

const App = () => {
  return (
    <>
      <NotificationProvider>
        <NotificationListener />
        <SocketProvider>
          <AuthProvider>
            <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          {/* <Topbar /> */}
            <AppRoutes />
          </AuthProvider>
        </SocketProvider>
      </NotificationProvider>
    </>
  );
};

export default App;
