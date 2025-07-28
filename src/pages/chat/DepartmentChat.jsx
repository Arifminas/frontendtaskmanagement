import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/common/Layout';
import { Button, Form, ListGroup, Dropdown } from 'react-bootstrap';
import { io } from 'socket.io-client';
import { fetchDepartments } from '../../Api/departments';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050');

const DepartmentChat = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await fetchDepartments();
        setDepartments(res.data.departments);
        if (res.data.departments.length) {
          setSelectedDept(res.data.departments[0]);
          socket.emit('joinDepartment', res.data.departments[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };
    loadDepartments();

    socket.on('newDepartmentMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('newDepartmentMessage');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeptChange = (dept) => {
    if (selectedDept) {
      // Optionally implement leaveDepartment event on backend to handle this
      // socket.emit('leaveDepartment', selectedDept._id);
    }
    setSelectedDept(dept);
    setMessages([]);
    socket.emit('joinDepartment', dept._id);
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedDept) return;
    const msgPayload = { departmentId: selectedDept._id, msg: input.trim() };
    socket.emit('departmentMessage', msgPayload);
    setInput('');
    // Do NOT add message manually here — wait for server broadcast
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <Layout>
      <h2>Department Chat</h2>
      <Dropdown className="mb-3">
        <Dropdown.Toggle>{selectedDept?.name || 'Select Department'}</Dropdown.Toggle>
        <Dropdown.Menu>
          {departments.map((dept) => (
            <Dropdown.Item key={dept._id} onClick={() => handleDeptChange(dept)}>
              {dept.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <ListGroup style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg, i) => (
          <ListGroup.Item key={i}>
            <strong>{msg.user}:</strong> {msg.message} <small>({new Date(msg.timestamp).toLocaleTimeString()})</small>
          </ListGroup.Item>
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

export default DepartmentChat;
