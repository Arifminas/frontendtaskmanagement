// src/contexts/SocketProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext'; // adjust path as needed

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL|| 'http://localhost:5050', {
      path: '/socket.io',
      auth: {
        token: token,
      },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log(`✅ Socket connected: ${newSocket.id}`);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket connect error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      console.log('🔌 Socket disconnected');
    };
  }, [token, isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
