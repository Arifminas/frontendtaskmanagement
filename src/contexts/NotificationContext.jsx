import React, { createContext, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  // Show toast notification using react-toastify
  const showToast = (type, message) => {
    switch(type) {
      case 'success': toast.success(message); break;
      case 'error': toast.error(message); break;
      case 'info': toast.info(message); break;
      case 'warning': toast.warning(message); break;
      default: toast(message);
    }
  };

  // Show browser push notification
  const showPushNotification = (title, options) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, showPushNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for consuming notification context
export const useNotification = () => useContext(NotificationContext);

export default NotificationContext;
