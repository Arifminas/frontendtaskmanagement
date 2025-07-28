import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { Table, Spinner, Form, Button } from 'react-bootstrap';
import { getTaskStatusCount, fetchUserReports, fetchDepartmentReports } from '../../Api/reports';
import { notifyError } from '../../utils/notifications';

const TaskReports = () => {
  const [statusCount, setStatusCount] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [departmentReports, setDepartmentReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ type: 'monthly' });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [statusRes, userRes, deptRes] = await Promise.all([
        getTaskStatusCount(),
        fetchUserReports(filter),
        fetchDepartmentReports(filter),
      ]);
      setStatusCount(statusRes.data);
      setUserReports(userRes.data.reports);
      setDepartmentReports(deptRes.data.reports);
    } catch (error) {
      notifyError('Failed to load reports');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, type: e.target.value });
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Layout>
      <h2>Task Reports</h2>

      <Form.Group className="mb-3" controlId="reportType">
        <Form.Label>Report Type</Form.Label>
        <Form.Select value={filter.type} onChange={handleFilterChange}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Form.Select>
      </Form.Group>

      <h4>Status Summary</h4>
      {statusCount ? (
        <ul>
          <li>Pending: {statusCount.pending}</li>
          <li>Ongoing: {statusCount.ongoing}</li>
          <li>Completed: {statusCount.completed}</li>
        </ul>
      ) : (
        <p>No data</p>
      )}

      <h4>User Reports</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>User</th>
            <th>Completed Tasks</th>
            <th>Pending Tasks</th>
            <th>Ongoing Tasks</th>
          </tr>
        </thead>
        <tbody>
          {userReports.length === 0 ? (
            <tr><td colSpan="4">No data</td></tr>
          ) : (
            userReports.map(user => (
              <tr key={user.userId}>
                <td>{user.userName}</td>
                <td>{user.completed}</td>
                <td>{user.pending}</td>
                <td>{user.ongoing}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <h4>Department Reports</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Department</th>
            <th>Completed Tasks</th>
            <th>Pending Tasks</th>
            <th>Ongoing Tasks</th>
          </tr>
        </thead>
        <tbody>
          {departmentReports.length === 0 ? (
            <tr><td colSpan="4">No data</td></tr>
          ) : (
            departmentReports.map(dept => (
              <tr key={dept.departmentId}>
                <td>{dept.departmentName}</td>
                <td>{dept.completed}</td>
                <td>{dept.pending}</td>
                <td>{dept.ongoing}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Layout>
  );
};

export default TaskReports;
