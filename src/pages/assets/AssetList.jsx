import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { Table, Button, Spinner } from 'react-bootstrap';
import { fetchAssets, deleteAsset } from '../../Api/assets';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useNavigate } from 'react-router-dom';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetchAssets();
      setAssets(res.data.assets);
      notifySuccess('Assets loaded');
    } catch (error) {
      notifyError('Failed to load assets');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this asset?')) return;
    try {
      await deleteAsset(id);
      notifySuccess('Asset deleted');
      fetchAssets();
    } catch (error) {
      notifyError('Failed to delete asset');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Asset List</h2>
        <Button onClick={() => navigate('/assets/create')}>Add New Asset</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Serial Number</th>
            <th>Group</th>
            <th>Current Staff</th>
            <th>Branch</th>
            <th>Expiry Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">No assets found.</td>
            </tr>
          ) : (
            assets.map(asset => (
              <tr key={asset._id}>
                <td>{asset.name}</td>
                <td>{asset.serialNumber}</td>
                <td>{asset.group?.name || '-'}</td>
                <td>{asset.assignedTo?.name || '-'}</td>
                <td>{asset.branch?.name || '-'}</td>
                <td>{asset.expiryDate ? new Date(asset.expiryDate).toLocaleDateString() : '-'}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => navigate(`/assets/${asset._id}`)}>Edit</Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(asset._id)}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Layout>
  );
};

export default AssetList;
