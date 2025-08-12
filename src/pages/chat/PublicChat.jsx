import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { ListGroup, Form, Button, Badge, Spinner } from 'react-bootstrap';
import axiosInstance from '../../Api/axiosInstance';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const normalizeMsg = (raw) => ({
  id: raw._id || raw.id || `${Date.now()}_${Math.random()}`,
  text: raw.message || raw.text || raw.msg || '',
  userName: raw.sender?.name || raw.user || raw.senderName || 'Unknown',
  userId: raw.sender?._id || raw.sender || raw.userId || null,
  createdAt: new Date(raw.createdAt || raw.timestamp || Date.now()).toISOString(),
});

const PublicChat = () => {
  const { socket, connected } = useSocket() || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const myId = user?._id;
  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load history
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/chat/public');
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (!active) return;
        setMessages(list.map(normalizeMsg));
      } catch (e) {
        console.error('Load public chat failed:', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Live updates
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;

    const onNew = (payload) => {
      setMessages((prev) => [...prev, normalizeMsg(payload)]);
    };

    socket.on('newPublicMessage', onNew);
    return () => {
      if (typeof socket.off === 'function') socket.off('newPublicMessage', onNew);
    };
  }, [socket]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    // Optimistic UI
    const optimistic = normalizeMsg({
      message: text,
      sender: myId,
      user: user?.name,
      createdAt: new Date().toISOString(),
    });
    setMessages((prev) => [...prev, optimistic]);
    setInput('');

    try {
      // Persist (REST) – public
      await axiosInstance.post('/chat/public', { message: text, isPublic: true });
      // Broadcast (Socket) – server already re-broadcasts to others
      if (socket && typeof socket.emit === 'function') {
        socket.emit('publicMessage', text);
      }
    } catch (e) {
      console.error('Send public message failed:', e);
      // (Optional) revert optimistic on error
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const header = useMemo(() => (
    <div className="d-flex align-items-center justify-content-between mb-2">
      <h4 className="mb-0">Public Chat</h4>
      <Badge bg={connected ? 'success' : 'secondary'}>
        {connected ? 'Online' : 'Offline'}
      </Badge>
    </div>
  ), [connected]);

  return (
    <>
      {header}

      <div style={{ height: 420, border: '1px solid #e0e0e0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <ListGroup style={{ flexGrow: 1, overflowY: 'auto', marginBottom: 10 }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
              <Spinner animation="border" />
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.userId && myId ? String(m.userId) === String(myId) : (m.userName === user?.name);
              return (
                <ListGroup.Item key={m.id} className="d-flex flex-column" style={{ border: 'none', borderBottom: '1px solid #f3f3f3' }}>
                  <div className="d-flex justify-content-between">
                    <strong style={{ color: mine ? '#1a2752' : '#333' }}>
                      {m.userName}{mine ? ' (you)' : ''}
                    </strong>
                    <small className="text-muted">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                  <div>{m.text}</div>
                </ListGroup.Item>
              );
            })
          )}
          <div ref={endRef} />
        </ListGroup>

        <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder={connected ? 'Type a message…' : 'Reconnecting…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={!connected}
          />
          <Button type="submit" disabled={!connected || !input.trim()}>
            Send
          </Button>
        </Form>
      </div>
    </>
  );
};

export default PublicChat;
