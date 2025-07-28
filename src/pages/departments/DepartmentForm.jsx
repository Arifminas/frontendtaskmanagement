import React, { useState, useEffect } from 'react';

import { Form, Button, Container, Alert } from 'react-bootstrap';
import { fetchDepartmentById, createDepartment, updateDepartment } from '../../Api/departments';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useNavigate, useParams } from 'react-router-dom';

const DepartmentForm = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (departmentId) {
      const fetchDepartment = async () => {
        try {
          const dept = await fetchDepartmentById(departmentId);
          setForm({
            name: dept.name,
            description: dept.description || '',
          });
        } catch {
          notifyError('Failed to load department details');
        }
      };
      fetchDepartment();
    }
  }, [departmentId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (departmentId) {
        await updateDepartment(departmentId, form);
        notifySuccess('Department updated successfully');
      } else {
        await createDepartment(form);
        notifySuccess('Department created successfully');
      }
      navigate('/departments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save department');
      notifyError('Failed to save department');
    }
  };

  return (
    
      <Container style={{ maxWidth: '600px' }}>
        <h2>{departmentId ? 'Edit Department' : 'Add New Department'}</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            {departmentId ? 'Update Department' : 'Create Department'}
          </Button>
          <Button variant="secondary" className="ms-2" onClick={() => navigate('/departments')}>
            Cancel
          </Button>
        </Form>
      </Container>
    
  );
};

export default DepartmentForm;
