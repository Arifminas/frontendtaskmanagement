import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';


// Example chart library import (you can replace with your choice)
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';



const fetchStats = async () => {
  try {
    const res = await axiosInstance.get('/reports/task-status-count');
    setTaskStats(res.data);
    notifySuccess('Dashboard data loaded successfully');
  } catch (err) {
    console.error(err);
    notifyError('Failed to load dashboard data');
  }
};
const Dashboard = () => {
  
  const { user } = useAuth();
  const [taskStats, setTaskStats] = useState([]);

  useEffect(() => {
    // Fetch dashboard data, example: task status counts
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/reports/task-status-count');
        setTaskStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    fetchStats();

    // Optional: Auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <Container fluid>
        <h2>Welcome, {user?.name}</h2>

        <Row className="mt-4">
          <Col md={6} lg={4}>
            <Card>
              <Card.Header>Task Status Overview</Card.Header>
              <Card.Body style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskStats}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={8}>
            <Card>
              <Card.Header>Recent Activities</Card.Header>
              <Card.Body>
                {/* Render recent task activities or notifications here */}
                <p>No recent activities yet.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default Dashboard;
