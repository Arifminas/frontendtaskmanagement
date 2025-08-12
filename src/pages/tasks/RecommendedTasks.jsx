import React, { useEffect, useState } from 'react';
import { fetchRecommendedTasks } from '../../Api/tasks';
import { Card, Typography, Box, CircularProgress, Button } from '@mui/material';

const RecommendedTasks = () => {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async (ctrl) => {
    setLoading(true);
    setErr('');
    try {
      const data = await fetchRecommendedTasks(ctrl?.signal);
      setRecommended(Array.isArray(data) ? data : []);
    } catch (e) {
      // 401 happens if user isn't authed; other errors bubble up
      const status = e?.response?.status;
      setErr(status === 401 ? 'Please log in again.' : 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1a2752' }}>
          Recommended Tasks for You
        </Typography>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#1a2752' }}>
        Recommended Tasks for You
      </Typography>

      {err && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="error" sx={{ mr: 2 }}>{err}</Typography>
          <Button size="small" variant="outlined" onClick={() => load()}>
            Retry
          </Button>
        </Box>
      )}

      {!err && recommended.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No recommendations at the moment.
        </Typography>
      )}

      {recommended.map((task) => (
        <Card key={task._id} sx={{ mb: 2, p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {task.description?.slice(0, 120) || 'No description'}
          </Typography>
        </Card>
      ))}
    </Box>
  );
};

export default RecommendedTasks;
