import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { Table, Spinner, Form } from 'react-bootstrap';
import { fetchAssetReports } from '../../Api/reports';
import { notifyError } from '../../utils/notifications';

const AssetReports = () => {
  const [assetReports, setAssetReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ type: 'monthly' });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetchAssetReports(filter);
      setAssetReports(res.data.reports);
    } catch {
      notifyError('Failed to load asset reports');
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, type: e.target.value });
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Layout>
      <h2>Asset Reports</h2>

      <Form.Group className="mb-3" controlId="reportType">
        <Form.Label>Report Type</Form.Label>
        <Form.Select value={filter.type} onChange={handleFilterChange}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Form.Select>
      </Form.Group>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Asset Name</th>
            <th>Assigned Staff</th>
            <th>Branch</th>
            <th>Expiry Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {assetReports.length === 0 ? (
            <tr><td colSpan="5">No data</td></tr>
          ) : (
            assetReports.map(asset => (
              <tr key={asset.assetId}>
                <td>{asset.name}</td>
                <td>{asset.assignedToName || '-'}</td>
                <td>{asset.branchName || '-'}</td>
                <td>{asset.expiryDate ? new Date(asset.expiryDate).toLocaleDateString() : '-'}</td>
                <td>{asset.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Layout>
  );
};

export default AssetReports;
