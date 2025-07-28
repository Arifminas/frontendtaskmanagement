import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { addAssetGroup, editAssetGroup } from '../../features/assetGroups/assetGroupSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { notifySuccess, notifyError } from '../../utils/notifications';

const AssetGroupForm = () => {
  const { groupId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const assetGroups = useSelector(state => state.assetGroups.list);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (groupId) {
      const group = assetGroups.find(g => g._id === groupId);
      if (group) setForm({ name: group.name, description: group.description || '' });
    }
  }, [groupId, assetGroups]);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (groupId) {
        await dispatch(editAssetGroup({ id: groupId, data: form })).unwrap();
        notifySuccess('Asset group updated successfully');
      } else {
        await dispatch(addAssetGroup(form)).unwrap();
        notifySuccess('Asset group created successfully');
      }
      navigate('/asset-groups');
    } catch (err) {
      setError(err || 'Failed to save asset group');
      notifyError(err || 'Failed to save asset group');
    }
  };

  return (
    <Container style={{ maxWidth: '600px' }}>
      <h2>{groupId ? 'Edit Asset Group' : 'Create Asset Group'}</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="name" className="mb-3">
          <Form.Label>Group Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="description" className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          {groupId ? 'Update' : 'Create'}
        </Button>
      </Form>
    </Container>
  );
};

export default AssetGroupForm;
