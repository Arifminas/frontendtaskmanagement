// src/pages/users/UserEdit.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import { fetchUserById, updateUser } from '../../api/users';
import { fetchDepartments } from '../../Api/departments';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useAuth } from '../../contexts/AuthContext';

const UserEdit = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'user',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [userRes, deptList] = await Promise.all([
          fetchUserById(userId),
          fetchDepartments(),
        ]);

        const userData = userRes?.data || userRes;

        setForm(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'user',
          department: userData.department?._id || userData.department || '',
        }));

        setDepartments(deptList || []);
      } catch (err) {
        notifyError('Failed to load user or departments');
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      form.currentPassword ||
      form.newPassword ||
      form.confirmNewPassword
    ) {
      if (!form.currentPassword) {
        setError('Please enter your current password to change it.');
        return;
      }
      if (form.newPassword !== form.confirmNewPassword) {
        setError('New passwords do not match.');
        return;
      }
      if (form.newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
    }

    try {
      const updateData = {
        name: form.name,
        role: user?.role === 'admin' ? form.role : undefined,
        department: user?.role === 'admin' ? form.department : undefined,
      };

      if (
        form.currentPassword &&
        form.newPassword &&
        form.confirmNewPassword
      ) {
        updateData.currentPassword = form.currentPassword;
        updateData.newPassword = form.newPassword;
      }

      // Clean undefined fields to avoid overwriting
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      await updateUser(userId, updateData);
      notifySuccess('User updated successfully');
      navigate('/users');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user';
      setError(msg);
      notifyError(msg);
    }
  };

  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: '600px' }}>
      <h2>Edit User</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>

        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email (cannot be changed)</Form.Label>
          <Form.Control type="email" name="email" value={form.email} disabled />
        </Form.Group>

        <Form.Group className="mb-3" controlId="role">
          <Form.Label>Role</Form.Label>
          <Form.Select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            disabled={user?.role !== 'admin'}
          >
            <option value="user">User</option>
            <option value="coordinator">Coordinator</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="department">
          <Form.Label>Department</Form.Label>
          <Form.Select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            disabled={user?.role !== 'admin'}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <hr />
        <h5>Change Password</h5>

        <Form.Group className="mb-3" controlId="currentPassword">
          <Form.Label>Current Password</Form.Label>
          <Form.Control
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password if changing"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="confirmNewPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmNewPassword"
            value={form.confirmNewPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Update User
        </Button>
        <Button variant="secondary" className="ms-2" onClick={() => navigate('/users')}>
          Cancel
        </Button>
      </Form>
    </Container>
  );
};

export default UserEdit;
