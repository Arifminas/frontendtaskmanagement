// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { getCurrentUser, updateCurrentUser } from '../../Api/users';

const Profile = () => {
  const [form, setForm]       = useState({ name: '', email: '', department: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getCurrentUser();
        setForm({
          name: user.name,
          email: user.email,
          department: user.department?.name || ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateCurrentUser({ name: form.name });
      setForm({
        name: updated.name,
        email: updated.email,
        department: updated.department?.name || ''
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Email"
          name="email"
          value={form.email}
          fullWidth
          margin="normal"
          disabled
        />

        <TextField
          label="Department"
          name="department"
          value={form.department}
          fullWidth
          margin="normal"
          disabled
        />

        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          sx={{ mt: 2 }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </Container>
  );
};

export default Profile;
