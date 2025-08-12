// src/contexts/NotificationContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import axiosInstance from '../Api/axiosInstance';
import { useAuth } from './AuthContext';             // ✅ use auth state
import notificationSoundUrl from '../assets/sounds/notify.mp3';

// ENV
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// -------------------- Push helpers --------------------
function urlBase64ToUint8Array(base64String) {
  if (!base64String) return null;
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const outputArray = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) outputArray[i] = raw.charCodeAt(i);
  return outputArray;
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

async function subscribePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  if (!VAPID_PUBLIC_KEY) return null;
  const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  try {
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });
  } catch {
    return null;
  }
}

async function saveSubscription(sub) {
  if (!sub) return;
  try {
    await axiosInstance.post(
      '/notifications/subscribe',
      sub.toJSON ? sub.toJSON() : sub,
      { skipAuthRedirect: true } // ✅ don’t redirect if 401 happens mid-flight
    );
  } catch (e) {
    console.warn('Save subscription failed:', e?.message || e);
  }
}

// -------------------- Context --------------------
const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);
// keep compatibility with code that imports { useNotification }
export const useNotification = useNotifications;

export default function NotificationProvider({ children }) {
  const { isAuthenticated, token } = useAuth();      // ✅ guard everything by auth

  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('notif_sound') !== 'off'
  );

  const audioRef = useRef(null);
  const socketRef = useRef(null);
  const abortRef = useRef(null);

  // ---- UI helpers (toast + in-tab push) ----
  const showToast = useCallback((type, message) => {
    switch (type) {
      case 'success': toast.success(message); break;
      case 'error': toast.error(message); break;
      case 'info': toast.info(message); break;
      case 'warning': toast.warning(message); break;
      default: toast(message);
    }
  }, []);

  const showPushNotification = useCallback((title, options) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(title, options);
      if (options?.data?.link) {
        notif.onclick = () => {
          window.focus();
          window.location.href = options.data.link;
        };
      }
    }
  }, []);

  // ---- Ask permission + register SW + subscribe push (AFTER login) ----
  useEffect(() => {
    (async () => {
      if (!isAuthenticated || !token) return;
      try {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
          const reg = await registerServiceWorker();
          if (reg) {
            const sub = await subscribePush();
            if (sub) await saveSubscription(sub);
          }
        }
      } catch (e) {
        console.warn('Push setup skipped:', e?.message || e);
      }
    })();
  }, [isAuthenticated, token]);

  // ---- Initial load of notifications (AFTER login) ----
  useEffect(() => {
    // cancel previous pending fetch (e.g., on logout)
    abortRef.current?.abort();
    setItems([]);
    setUnread(0);

    if (!isAuthenticated || !token) return;

    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        const res = await axiosInstance.get('/notifications?unread=0', {
          signal: ac.signal,
          skipAuthRedirect: true,       // ✅ don’t redirect the app on 401
        });
        const data = res.data?.data || [];
        setItems(data);
        setUnread(data.filter(n => !n.read).length);
      } catch (e) {
        const name = e.name || e.code;
        if (name !== 'CanceledError' && name !== 'AbortError') {
          console.debug('Load notifications failed:', e?.message || e);
        }
      }
    })();

    return () => ac.abort();
  }, [isAuthenticated, token]);

  // ---- Socket.IO live updates (AFTER login) ----
  useEffect(() => {
    if (!isAuthenticated || !token || !SOCKET_URL) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },                 // server must read decoded.id
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('notification:new', (n) => {
      setItems(prev => {
        if (prev.length && prev[0]?._id === n._id) return prev;
        return [n, ...prev].slice(0, 100);
      });
      if (!n.read) setUnread(prev => prev + 1);

      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      showToast('info', n.title || 'New notification');

      if ('Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification(n.title || 'Notification', {
          body: n.message,
          data: { link: n.link },
        });
        notif.onclick = () => {
          window.focus();
          if (n.link) window.location.href = n.link;
        };
      }
    });

    return () => socket.close();
  }, [isAuthenticated, token, soundEnabled, showToast]);

  // ---- API helpers ----
  const markRead = useCallback(async (id) => {
    if (!isAuthenticated || !token) return;
    await axiosInstance.put(`/notifications/${id}/read`, null, { skipAuthRedirect: true });
    setItems(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
    setUnread(prev => Math.max(0, prev - 1));
  }, [isAuthenticated, token]);

  const markAllRead = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    await axiosInstance.put('/notifications/read-all', null, { skipAuthRedirect: true });
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  }, [isAuthenticated, token]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('notif_sound', next ? 'on' : 'off');
      return next;
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        items,
        unread,
        markRead,
        markAllRead,
        showToast,
        showPushNotification,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
      <audio ref={audioRef} src={notificationSoundUrl} preload="auto" />
    </NotificationContext.Provider>
  );
}
