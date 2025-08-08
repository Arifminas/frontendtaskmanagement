import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../Api/axiosInstance';
import { notifySuccess, notifyError } from '../../utils/notifications';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();

  const [taskStats, setTaskStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Normalize backend response into [{ status, count }] for Recharts
  const normalizeStats = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // If backend returns an object like { open: 3, closed: 5 }
    return Object.entries(data).map(([status, count]) => ({ status, count }));
  };

  const loadTaskStats = useCallback(
    async (signal) => {
      try {
        setStatsError('');
        // Disable axios timeout here (or adjust as needed)
        const res = await axiosInstance.get('/reports/task-status-count', {
          signal,
          timeout: 0,
        });
        const normalized = normalizeStats(res?.data?.data ?? res?.data);
        setTaskStats(normalized);
        notifySuccess('Dashboard data loaded successfully');
      } catch (err) {
        // Ignore intentional aborts (React Strict Mode / cleanup / refresh)
        if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') return;
        console.error('Failed to fetch dashboard data:', err);
        setStatsError(err?.response?.data?.message || 'Failed to load dashboard data');
        notifyError('Failed to load dashboard data');
      } finally {
        setStatsLoading(false);
      }
    },
    []
  );

  // Initial load + cleanup
  useEffect(() => {
    const controller = new AbortController();
    loadTaskStats(controller.signal);
    return () => controller.abort();
  }, [loadTaskStats]);

  // Optional auto-refresh every 60s without overlapping requests
  useEffect(() => {
    const intervalMs = 60000;
    let controller = new AbortController();

    const tick = async () => {
      // Abort any previous in-flight call before starting a new one
      controller.abort();
      controller = new AbortController();
      await loadTaskStats(controller.signal);
    };

    const id = setInterval(tick, intervalMs);
    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, [loadTaskStats]);

  return (
    <Layout>
      <Container fluid>
        <h2>Welcome, {user?.name}</h2>

        <Row className="mt-4">
          <Col md={6} lg={4}>
            <Card>
              <Card.Header>Task Status Overview</Card.Header>
              <Card.Body style={{ height: 300 }}>
                {statsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    Loading…
                  </div>
                ) : statsError ? (
                  <div style={{ color: '#d32f2f' }}>{statsError}</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskStats}>
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
