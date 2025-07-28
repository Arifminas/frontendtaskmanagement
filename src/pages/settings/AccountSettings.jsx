import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { getUserProfile, updateUserProfile, changePassword } from '../../Api/users';
import { notifySuccess, notifyError } from '../../utils/notifications';

const AccountSettings = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await getUserProfile();
        setProfile({ name: res.data.data.name, email: res.data.data.email });
      } catch (err) {
        notifyError('Failed to load profile');
      }
    };
    fetchUserProfile();
  }, []);

  // Clear notifications on input change for better UX
  const clearMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleProfileChange = e => {
    clearMessages();
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = e => {
    clearMessages();
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await updateUserProfile(profile);
      notifySuccess('Profile updated successfully');
      setSuccessMsg('Profile updated');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      notifyError(msg);
    }
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      notifySuccess('Password changed successfully');
      setSuccessMsg('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      setError(msg);
      notifyError(msg);
    }
  };

  return (
    <Layout>
      <Container style={{ maxWidth: '600px' }}>
        <h2>User Settings</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        <h4>Update Profile</h4>
        <Form onSubmit={handleProfileSubmit} className="mb-4" noValidate>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={profile.email}
              disabled
              readOnly
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Form>

        <h4>Change Password</h4>
        <Form onSubmit={handlePasswordSubmit} noValidate>
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

export default AccountSettings;
