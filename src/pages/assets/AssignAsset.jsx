import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { fetchAssets } from '../../Api/assets';
import { fetchStaff } from '../../Api/staff';
import { assignAssetToUser } from '../../Api/assets';
import { notifySuccess, notifyError } from '../../utils/notifications';

const AssignAsset = () => {
  const [assets, setAssets] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({ assetId: '', staffId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, staffRes] = await Promise.all([fetchAssets(), fetchStaff()]);
        setAssets(assetsRes.data.assets);
        setStaffList(staffRes.data.staff);
      } catch {
        notifyError('Failed to load assets or staff');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.assetId || !form.staffId) {
      setError('Please select both asset and staff');
      return;
    }
    setLoading(true);
    try {
      await assignAssetToUser(form.assetId, form.staffId);
      notifySuccess('Asset assigned successfully');
      setForm({ assetId: '', staffId: '' });
    } catch {
      notifyError('Failed to assign asset');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Container style={{ maxWidth: '600px' }}>
        <h2>Assign Asset</h2>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="assetId">
            <Form.Label>Asset</Form.Label>
            <Form.Select name="assetId" value={form.assetId} onChange={handleChange} required>
              <option value="">Select Asset</option>
              {assets.map(a => (
                <option key={a._id} value={a._id}>{a.name} ({a.serialNumber})</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="staffId">
            <Form.Label>Staff</Form.Label>
            <Form.Select name="staffId" value={form.staffId} onChange={handleChange} required>
              <option value="">Select Staff</option>
              {staffList.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Asset'}
          </Button>
        </Form>
      </Container>
    </Layout>
  );
};

export default AssignAsset;
