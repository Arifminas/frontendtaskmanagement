import React, { useEffect, useState } from 'react';
import { fetchRecommendedTasks } from '../../Api/tasks';
import { Card, Typography, Box, CircularProgress, Button } from '@mui/material';

const RecommendedTasks = () => {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRecommendedTasks();
        setRecommended(data);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#1a2752' }}>Recommended Tasks for You</Typography>
      {loading ? (
        <CircularProgress size={24} />
      ) : recommended.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No recommendations at the moment.</Typography>
      ) : (
        recommended.map(task => (
          <Card key={task._id} sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{task.title}</Typography>
            <Typography variant="body2" color="text.secondary">{task.description?.slice(0, 100) || 'No description'}</Typography>
          </Card>
        ))
      )}
    </Box>
  );
};

export default RecommendedTasks;
