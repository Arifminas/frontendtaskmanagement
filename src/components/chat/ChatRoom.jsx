import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { ListGroup, Form, Button } from 'react-bootstrap';

const ChatRoom = ({ departmentId, isPublic }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Join room
    if (isPublic) socket.emit('joinPublic');
    else socket.emit('joinDepartment', departmentId);

    // Listen for new messages
    const eventName = isPublic ? 'newPublicMessage' : 'newDepartmentMessage';
    socket.on(eventName, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off(eventName);
    };
  }, [socket, departmentId, isPublic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = {
      user: user.name,
      text: input,
      createdAt: new Date().toISOString(),
    };

    if (isPublic) socket.emit('publicMessage', msg);
    else socket.emit('departmentMessage', { departmentId, msg });

    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <div style={{ height: 400, border: '1px solid #ccc', padding: 10, display: 'flex', flexDirection: 'column' }}>
      <ListGroup style={{ flexGrow: 1, overflowY: 'auto' }}>
        {messages.map((m, idx) => (
          <ListGroup.Item key={idx}>
            <strong>{m.user}: </strong> {m.text} <br />
            <small>{new Date(m.createdAt).toLocaleTimeString()}</small>
          </ListGroup.Item>
        ))}
        <div ref={messagesEndRef} />
      </ListGroup>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="mt-2 d-flex"
      >
        <Form.Control
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" variant="primary" className="ms-2">
          Send
        </Button>
      </Form>
    </div>
  );
};

export default ChatRoom;
