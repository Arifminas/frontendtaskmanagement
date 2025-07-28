import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axiosInstance from '../../Api/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { user, setUser } = useAuth();

  // Profile form
  const [profile, setProfile] = useState({ name: '', email: '' });
  // Notification prefs
  const [notifications, setNotifications] = useState({
    toast: true,
    push: true,
    sound: true,
  });
  // Password form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email });
      // Ideally load notification prefs from user or localStorage here
    }
  }, [user]);

  // Handlers
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleNotifChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Submit profile updates
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await axiosInstance.put('/users/me', profile);
      setUser(res.data.user);
      notifySuccess('Profile updated');
      setSuccessMsg('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      notifyError('Failed to update profile');
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await axiosInstance.put('/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      notifySuccess('Password changed successfully');
      setSuccessMsg('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      notifyError('Failed to change password');
    }
  };

  return (
    <Layout>
      <Container style={{ maxWidth: '600px' }}>
        <h2>User Profile & Settings</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        {/* Profile Form */}
        <Form onSubmit={handleProfileSubmit} className="mb-4">
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={profile.name} onChange={handleProfileChange} required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              required
              disabled
            />
          </Form.Group>

          <h5>Notifications</h5>
          <Form.Check
            type="checkbox"
            label="Show toast notifications"
            name="toast"
            checked={notifications.toast}
            onChange={handleNotifChange}
          />
          <Form.Check
            type="checkbox"
            label="Enable push notifications"
            name="push"
            checked={notifications.push}
            onChange={handleNotifChange}
          />
          <Form.Check
            type="checkbox"
            label="Play notification sounds"
            name="sound"
            checked={notifications.sound}
            onChange={handleNotifChange}
          />

          <Button variant="primary" type="submit" className="mt-3">
            Save Profile & Preferences
          </Button>
        </Form>

        {/* Password Change Form */}
        <Form onSubmit={handlePasswordSubmit}>
          <h5>Change Password</h5>
          <Form.Group className="mb-3" controlId="currentPassword">
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              required
              minLength={6}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="confirmNewPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmNewPassword"
              value={passwords.confirmNewPassword}
              onChange={handlePasswordChange}
              required
              minLength={6}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Change Password
          </Button>
        </Form>
      </Container>
    </Layout>
  );
};

export default UserProfile;
