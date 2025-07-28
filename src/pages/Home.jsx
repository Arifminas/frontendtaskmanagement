// src/pages/Home.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Task Management App
      </Typography>
      <Typography>
        Use the sidebar to navigate to Tasks, Reports, Chat, and more.
      </Typography>
    </Box>
  );
}
