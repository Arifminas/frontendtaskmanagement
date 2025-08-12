import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { Button, Form, ListGroup, Dropdown, Spinner, Badge } from 'react-bootstrap';
import axiosInstance from '../../Api/axiosInstance';
import { fetchDepartments } from '../../Api/departments';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const normalizeMsg = (raw) => ({
  id: raw._id || raw.id || `${Date.now()}_${Math.random()}`,
  text: raw.message || raw.text || raw.msg || '',
  userName: raw.sender?.name || raw.user || raw.senderName || 'Unknown',
  userId: raw.sender?._id || raw.sender || raw.userId || null,
  departmentId: raw.department?._id || raw.department || raw.departmentId || null,
  createdAt: new Date(raw.createdAt || raw.timestamp || Date.now()).toISOString(),
});

const DepartmentChat = () => {
  const { socket, connected } = useSocket() || {};
  const { user } = useAuth();
  const myId = user?._id;

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingDept, setLoadingDept] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const endRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load departments
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingDept(true);
        const res = await fetchDepartments();
        const list = Array.isArray(res?.data?.departments) ? res.data.departments : (Array.isArray(res) ? res : []);
        if (!active) return;

        setDepartments(list);
        const preselect =
          list.find(d => String(d._id) === String(user?.department?._id || user?.department)) ||
          list[0];
        if (preselect) setSelectedDept(preselect);
      } catch (e) {
        console.error('Fetch departments failed:', e);
      } finally {
        if (active) setLoadingDept(false);
      }
    })();
    return () => { active = false; };
  }, [user?.department]);

  // Load messages for selected department
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!selectedDept?._id) return;
      try {
        setLoadingChat(true);
        const res = await axiosInstance.get(`/chat/department/${selectedDept._id}`);
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (!active) return;
        setMessages(list.map(normalizeMsg));
      } catch (e) {
        console.error('Load dept chat failed:', e);
        if (active) setMessages([]);
      } finally {
        if (active) setLoadingChat(false);
      }
    };
    load();

    // join room on switch (provider also tries on connect; this keeps it in sync)
    if (socket && typeof socket.emit === 'function' && selectedDept?._id) {
      socket.emit('joinDepartment', String(selectedDept._id));
    }

    return () => { active = false; };
  }, [selectedDept?._id, socket]);

  // Live updates (filter by current department)
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;

    const onNew = (payload) => {
      const msg = normalizeMsg(payload);
      if (!selectedDept?._id) return;
      if (String(msg.departmentId) === String(selectedDept._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('newDepartmentMessage', onNew);
    return () => {
      if (typeof socket.off === 'function') socket.off('newDepartmentMessage', onNew);
    };
  }, [socket, selectedDept?._id]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedDept?._id) return;

    // Optimistic UI
    const optimistic = normalizeMsg({
      message: text,
      sender: myId,
      user: user?.name,
      department: selectedDept._id,
      createdAt: new Date().toISOString(),
    });
    setMessages((prev) => [...prev, optimistic]);
    setInput('');

    try {
      // Persist
      await axiosInstance.post('/chat/department', {
        message: text,
        department: selectedDept._id,
        isPublic: false
      });
      // Broadcast
      if (socket && typeof socket.emit === 'function') {
        socket.emit('departmentMessage', { departmentId: String(selectedDept._id), msg: text });
      }
    } catch (e) {
      console.error('Send dept message failed:', e);
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
      <div className="d-flex align-items-center gap-2">
        <h4 className="mb-0">Department Chat</h4>
        <Badge bg={connected ? 'success' : 'secondary'}>{connected ? 'Online' : 'Offline'}</Badge>
      </div>
      <Dropdown>
        <Dropdown.Toggle size="sm" variant="outline-primary">
          {selectedDept?.name || 'Select Department'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {departments.map((d) => (
            <Dropdown.Item
              key={d._id}
              active={String(d._id) === String(selectedDept?._id)}
              onClick={() => setSelectedDept(d)}
            >
              {d.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  ), [connected, departments, selectedDept]);

  return (
    <>
      {header}

      <div style={{ height: 460, border: '1px solid #e0e0e0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <ListGroup style={{ flexGrow: 1, overflowY: 'auto', marginBottom: 10 }}>
          {loadingDept || loadingChat ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 220 }}>
              <Spinner animation="border" />
            </div>
          ) : messages.length === 0 ? (
            <ListGroup.Item className="text-muted">No messages yet</ListGroup.Item>
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
            disabled={!connected || !selectedDept?._id}
          />
          <Button type="submit" disabled={!connected || !selectedDept?._id || !input.trim()}>
            Send
          </Button>
        </Form>
      </div>
    </>
  );
};

export default DepartmentChat;
