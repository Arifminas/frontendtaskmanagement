import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { Table, Button, Spinner } from 'react-bootstrap';
import { fetchStaff, deleteStaff } from '../../api/staff';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useNavigate } from 'react-router-dom';

const StaffList = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await fetchStaff();
      setStaffList(res.data.staff);
      notifySuccess('Staff loaded');
    } catch (error) {
      notifyError('Failed to load staff');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this staff?')) return;

    try {
      await deleteStaff(id);
      notifySuccess('Staff deleted');
      loadStaff();
    } catch (error) {
      notifyError('Failed to delete staff');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Staff List</h2>
        <Button onClick={() => navigate('/staff/create')}>Add New Staff</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Joining Date</th>
            <th>Branch</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffList.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">No staff found.</td>
            </tr>
          ) : (
            staffList.map(staff => (
              <tr key={staff._id}>
                <td>{staff.name}</td>
                <td>{new Date(staff.joiningDate).toLocaleDateString()}</td>
                <td>{staff.branch?.name || '-'}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => navigate(`/staff/${staff._id}`)}>Edit</Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(staff._id)}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Layout>
  );
};

export default StaffList;
