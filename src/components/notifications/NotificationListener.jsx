import React, { useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationListener = () => {
  const { socket } = useSocket() || {};
  const { showToast, showPushNotification } = useNotifications();

 useEffect(() => {
  if (!socket || typeof socket.on !== 'function') return;

  // Listen for real-time notifications from backend
  socket.on('newNotification', (data) => {
    const msg = data.message || 'You have a new notification';
    showToast('info', msg);
    showPushNotification('New Notification', { body: msg });
  });

  // Your existing events
  socket.on('newPublicMessage', (msg) => {
    showToast('info', `New public message from ${msg.user}: ${msg.text}`);
    showPushNotification('New Public Message', { body: `${msg.user}: ${msg.text}` });
  });

  socket.on('newDepartmentMessage', (msg) => {
    showToast('info', `New department message from ${msg.user}: ${msg.text}`);
    showPushNotification('New Department Message', { body: `${msg.user}: ${msg.text}` });
  });

  socket.on('taskUpdated', (task) => {
    showToast('success', `Task "${task.title}" updated to ${task.status}`);
    showPushNotification('Task Updated', { body: `${task.title} is now ${task.status}` });
  });

  return () => {
    socket.off('newNotification');
    socket.off('newPublicMessage');
    socket.off('newDepartmentMessage');
    socket.off('taskUpdated');
  };
}, [socket, showToast, showPushNotification]);
  return null; // Invisible component
};

export default NotificationListener;
