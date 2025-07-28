import React from 'react';
import Layout from '../components/common/Layout';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Container className="text-center" style={{ marginTop: '100px' }}>
        <h1>403 - Unauthorized</h1>
        <p>You do not have permission to view this page.</p>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    </Layout>
  );
};

export default Unauthorized;
