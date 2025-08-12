// src/components/chat/ChatRoom.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ListGroup, Form, Button, Spinner, Badge } from 'react-bootstrap';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchPublicMessages,
  fetchDepartmentMessages,
} from '../../Api/chat';

const ChatRoom = ({ isPublic = true, departmentId = null }) => {
  const { socket } = useSocket() || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  const roomKey = useMemo(
    () => (isPublic ? 'public' : `department_${departmentId}`),
    [isPublic, departmentId]
  );

  // initial history
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = isPublic
          ? await fetchPublicMessages()
          : await fetchDepartmentMessages(departmentId);
        if (mounted) setMsgs(data);
      } catch (e) {
        console.error('Chat history load failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isPublic, departmentId]);

  // join room + live events
  useEffect(() => {
    if (!socket || typeof socket.emit !== 'function' || typeof socket.on !== 'function') return;

    if (isPublic) socket.emit('joinPublic');
    else socket.emit('joinDepartment', departmentId);

    const evt = isPublic ? 'chat:public:new' : 'chat:dept:new';
    const handler = (msg) => setMsgs((prev) => [...prev, msg]);

    socket.on(evt, handler);
    return () => socket.off(evt, handler);
  }, [socket, isPublic, departmentId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    const message = text.trim();
    if (!socket || !message) return;

    if (isPublic) {
      socket.emit('chat:public:send', { message }, (ack) => {
        if (!ack?.ok) console.warn('Public send failed', ack?.error);
      });
    } else {
      socket.emit('chat:dept:send', { departmentId, message }, (ack) => {
        if (!ack?.ok) console.warn('Dept send failed', ack?.error);
      });
    }
    setText('');
  };

  if (loading) {
    return <div className="p-3"><Spinner animation="border" /></div>;
  }

  return (
    <div style={{ height: 420, border: '1px solid #e5e5e5', padding: 10, display: 'flex', flexDirection: 'column', borderRadius: 8 }}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <strong className="text-muted">
          {isPublic ? 'Public Chat' : `Department Room`}
        </strong>
        <Badge bg="secondary">{roomKey}</Badge>
      </div>

      <ListGroup style={{ flexGrow: 1, overflowY: 'auto' }}>
        {msgs.map((m) => (
          <ListGroup.Item key={m._id || m.createdAt + (m.sender?._id || '')}>
            <div className="d-flex justify-content-between">
              <div>
                <strong>{m.sender?.name || 'User'}:</strong> {m.message}
              </div>
              <small className="text-muted">
                {new Date(m.createdAt).toLocaleTimeString()}
              </small>
            </div>
          </ListGroup.Item>
        ))}
        <div ref={endRef} />
      </ListGroup>

      <Form
        className="mt-2 d-flex"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Form.Control
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button className="ms-2" onClick={send}>Send</Button>
      </Form>
    </div>
  );
};

export default ChatRoom;
