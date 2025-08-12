// src/contexts/SocketProvider.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({ socket: null, connected: false });
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Normalize URL (remove trailing slash)
  const URL =
    (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050').replace(/\/$/, '');

  useEffect(() => {
    // If not authenticated, ensure any existing socket is torn down
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      return;
    }

    // Create a fresh socket for the current token
    const s = io(URL, {
      path: '/socket.io',
      auth: { token },                // JWT used by server middleware
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity, // keep trying
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,                 // connect timeout
      autoConnect: false,             // connect after handlers attached
    });

    socketRef.current = s;

    // ---- Handlers
    const onConnect = () => {
      setConnected(true);
      console.log(`✅ Socket connected: ${s.id}`);

      // (Re)join public + department room every time we connect/reconnect
      s.emit('joinPublic');
      const deptId = user?.department?._id || user?.department;
      if (deptId) s.emit('joinDepartment', String(deptId));
    };

    const onDisconnect = (reason) => {
      setConnected(false);
      console.log(`🔌 Socket disconnected (${reason})`);
      // If server disconnected us explicitly, try to reconnect
      if (reason === 'io server disconnect') {
        // Need manual reconnect when server called socket.disconnect()
        s.connect();
      }
    };

    const onConnectError = (err) => {
      console.error('❌ Socket connect error:', err?.message || err);
    };

    const onReconnect = (attempt) => {
      console.log(`♻️ Reconnected after ${attempt} attempt(s)`);
    };

    const onReconnectAttempt = (attempt) => {
      console.log(`… trying to reconnect (#${attempt})`);
    };

    const onReconnectError = (err) => {
      console.warn('⚠️ Reconnect error:', err?.message || err);
    };

    const onReconnectFailed = () => {
      console.error('❌ Reconnect failed (giving up)');
    };

    // Attach listeners
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onConnectError);
    s.on('reconnect', onReconnect);
    s.on('reconnect_attempt', onReconnectAttempt);
    s.on('reconnect_error', onReconnectError);
    s.on('reconnect_failed', onReconnectFailed);

    // Start the connection
    s.connect();
    setSocket(s);

    // Cleanup
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onConnectError);
      s.off('reconnect', onReconnect);
      s.off('reconnect_attempt', onReconnectAttempt);
      s.off('reconnect_error', onReconnectError);
      s.off('reconnect_failed', onReconnectFailed);
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
    // Recreate socket when auth state, token, department, or URL changes
  }, [isAuthenticated, token, user?.department, URL]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
