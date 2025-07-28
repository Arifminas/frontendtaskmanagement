import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { fetchAssets } from '../../api/assets';
import { fetchBranches } from '../../api/branches';
import { fetchStaff } from '../../api/staff';
import { transferAsset } from '../../api/assets';
import { notifySuccess, notifyError } from '../../utils/notifications';

const TransferAsset = () => {
  const [assets, setAssets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    assetId: '',
    fromBranch: '',
    toBranch: '',
    toStaff: '',
    transferReason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, branchesRes, staffRes] = await Promise.all([
          fetchAssets(),
          fetchBranches(),
          fetchStaff(),
        ]);
        setAssets(assetsRes.data.assets);
        setBranches(branchesRes.data.branches);
        setStaffList(staffRes.data.staff);
      } catch {
        notifyError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.assetId || !form.toBranch) {
      setError('Please select asset and destination branch');
      return;
    }
    setLoading(true);
    try {
      await transferAsset(form.assetId, {
        fromBranch: form.fromBranch,
        toBranch: form.toBranch,
        toStaff: form.toStaff || null,
        reason: form.transferReason,
      });
      notifySuccess('Asset transferred successfully');
      setForm({
        assetId: '',
        fromBranch: '',
        toBranch: '',
        toStaff: '',
        transferReason: '',
      });
    } catch {
      notifyError('Failed to transfer asset');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Container style={{ maxWidth: '600px' }}>
        <h2>Transfer Asset</h2>
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

          <Form.Group className="mb-3" controlId="fromBranch">
            <Form.Label>From Branch</Form.Label>
            <Form.Select name="fromBranch" value={form.fromBranch} onChange={handleChange}>
              <option value="">Select Branch</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="toBranch">
            <Form.Label>To Branch</Form.Label>
            <Form.Select name="toBranch" value={form.toBranch} onChange={handleChange} required>
              <option value="">Select Branch</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="toStaff">
            <Form.Label>Assign To Staff (Optional)</Form.Label>
            <Form.Select name="toStaff" value={form.toStaff} onChange={handleChange}>
              <option value="">None</option>
              {staffList.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="transferReason">
            <Form.Label>Transfer Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="transferReason"
              value={form.transferReason}
              onChange={handleChange}
              placeholder="Optional reason for transfer"
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Transferring...' : 'Transfer Asset'}
          </Button>
        </Form>
      </Container>
    </Layout>
  );
};

export default TransferAsset;
