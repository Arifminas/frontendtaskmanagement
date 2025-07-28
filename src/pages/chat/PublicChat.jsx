import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/common/Layout';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050');

const PublicChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit('joinPublic');

    socket.on('newPublicMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('newPublicMessage');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('publicMessage', input.trim());
    setMessages((prev) => [...prev, input.trim()]);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <Layout>
      <h2>Public Chat</h2>
      <ListGroup style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg, i) => (
          <ListGroup.Item key={i}>{msg}</ListGroup.Item>
        ))}
        <div ref={messagesEndRef} />
      </ListGroup>

      <Form.Control
        type="text"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <Button variant="primary" onClick={sendMessage} className="mt-2">
        Send
      </Button>
    </Layout>
  );
};

export default PublicChat;
