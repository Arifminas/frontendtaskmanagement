import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { fetchAssetById, createAsset, updateAsset } from '../../Api/assets';
import { getBranches } from '../../Api/branches';
import { fetchAssetGroups } from '../../Api/assetGroups'; // Create this API
import { fetchStaff } from '../../Api/staff';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useNavigate, useParams } from 'react-router-dom';

const AssetForm = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    serialNumber: '',
    group: '',
    assignedTo: '',
    branch: '',
    purchaseDate: '',
    expiryDate: '',
  });
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, groupsRes, staffRes] = await Promise.all([
          getBranches(),
          fetchAssetGroups(),
          fetchStaff(),
        ]);
        setBranches(branchesRes.data.branches);
        setGroups(groupsRes.data.assetGroups);
        setStaffList(staffRes.data.staff);
      } catch {
        notifyError('Failed to load branches, groups, or staff');
      }
    };
    fetchData();

    if (assetId) {
      const fetchAsset = async () => {
        try {
          const res = await fetchAssetById(assetId);
          setForm({
            name: res.data.asset.name,
            serialNumber: res.data.asset.serialNumber,
            group: res.data.asset.group?._id || '',
            assignedTo: res.data.asset.assignedTo?._id || '',
            branch: res.data.asset.branch?._id || '',
            purchaseDate: res.data.asset.purchaseDate ? res.data.asset.purchaseDate.slice(0, 10) : '',
            expiryDate: res.data.asset.expiryDate ? res.data.asset.expiryDate.slice(0, 10) : '',
          });
        } catch {
          notifyError('Failed to load asset details');
        }
      };
      fetchAsset();
    }
  }, [assetId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (assetId) {
        await updateAsset(assetId, form);
        notifySuccess('Asset updated successfully');
      } else {
        await createAsset(form);
        notifySuccess('Asset created successfully');
      }
      navigate('/assets');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save asset');
      notifyError('Failed to save asset');
    }
  };

  return (
    <Layout>
      <Container style={{ maxWidth: '600px' }}>
        <h2>{assetId ? 'Edit Asset' : 'Add New Asset'}</h2>

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

          <Form.Group className="mb-3" controlId="serialNumber">
            <Form.Label>Serial Number</Form.Label>
            <Form.Control
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="group">
            <Form.Label>Asset Group</Form.Label>
            <Form.Select
              name="group"
              value={form.group}
              onChange={handleChange}
              required
            >
              <option value="">Select Group</option>
              {groups.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="assignedTo">
            <Form.Label>Assign To Staff</Form.Label>
            <Form.Select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {staffList.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Form.Select>
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
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="purchaseDate">
            <Form.Label>Purchase Date</Form.Label>
            <Form.Control
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="expiryDate">
            <Form.Label>Expiry Date</Form.Label>
            <Form.Control
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            {assetId ? 'Update Asset' : 'Create Asset'}
          </Button>
          <Button variant="secondary" className="ms-2" onClick={() => navigate('/assets')}>
            Cancel
          </Button>
        </Form>
      </Container>
    </Layout>
  );
};

export default AssetForm;
