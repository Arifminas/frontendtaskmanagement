import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBranchById, createBranch, updateBranch } from '../../api/branches';
import { notifySuccess, notifyError } from '../../utils/notifications';

const BranchForm = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const [branch, setBranch] = useState({ name: '', location: '', contact: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch branch data if editing
  useEffect(() => {
    if (branchId) {
      setLoading(true);
      fetchBranchById(branchId)
        .then(data => setBranch(data))
        .catch(() => notifyError('Failed to load branch data'))
        .finally(() => setLoading(false));
    }
  }, [branchId]);

  const handleChange = (e) => {
    setBranch({ ...branch, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (branchId) {
        await updateBranch(branchId, branch);
        notifySuccess('Branch updated successfully');
      } else {
        await createBranch(branch);
        notifySuccess('Branch created successfully');
      }
      navigate('/branches');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save branch');
      notifyError('Failed to save branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ maxWidth: '600px' }}>
      <h2>{branchId ? 'Edit Branch' : 'Create Branch'}</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Branch Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={branch.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="location">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={branch.location}
            onChange={handleChange}
            disabled={loading}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="contact">
          <Form.Label>Contact Info</Form.Label>
          <Form.Control
            type="text"
            name="contact"
            value={branch.contact}
            onChange={handleChange}
            disabled={loading}
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {branchId ? 'Update Branch' : 'Create Branch'}
        </Button>
      </Form>
    </Container>
  );
};

export default BranchForm;
