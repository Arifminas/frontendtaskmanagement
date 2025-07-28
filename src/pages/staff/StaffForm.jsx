import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { createStaff, fetchStaffById, updateStaff } from '../../api/staff';
import { getBranches } from '../../Api/branches';  // Assuming you have this api
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useNavigate, useParams } from 'react-router-dom';

const StaffForm = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    joiningDate: '',
    branch: '',
  });
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await getBranches();
        setBranches(res.data.branches);
      } catch {
        notifyError('Failed to load branches');
      }
    };
    fetchBranches();

    if (staffId) {
      const fetchStaff = async () => {
        try {
          const res = await fetchStaffById(staffId);
          setForm({
            name: res.data.staff.name,
            joiningDate: res.data.staff.joiningDate.slice(0, 10),
            branch: res.data.staff.branch?._id || '',
          });
        } catch {
          notifyError('Failed to load staff details');
        }
      };
      fetchStaff();
    }
  }, [staffId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (staffId) {
        await updateStaff(staffId, form);
        notifySuccess('Staff updated successfully');
      } else {
        await createStaff(form);
        notifySuccess('Staff created successfully');
      }
      navigate('/staff');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving staff');
      notifyError('Error saving staff');
    }
  };

  return (
    <Layout>
      <Container style={{ maxWidth: '600px' }}>
        <h2>{staffId ? 'Edit Staff' : 'Add New Staff'}</h2>
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

          <Form.Group className="mb-3" controlId="joiningDate">
            <Form.Label>Joining Date</Form.Label>
            <Form.Control
              type="date"
              name="joiningDate"
              value={form.joiningDate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="branch">
            <Form.Label>Branch</Form.Label>
            <Form.Select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              required
            >
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button variant="primary" type="submit">{staffId ? 'Update' : 'Create'}</Button>
          <Button variant="secondary" className="ms-2" onClick={() => navigate('/staff')}>Cancel</Button>
        </Form>
      </Container>
    </Layout>
  );
};

export default StaffForm;
