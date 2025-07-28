import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { fetchDepartmentsWithLocation } from '../../Api/departments';
import { Box, Typography, CircularProgress } from '@mui/material';

const DepartmentMapView = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDepartmentsWithLocation();
        setDepartments(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ height: '75vh', width: '100%', mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#1a2752' }}>
        Department Location Map
      </Typography>
      <MapContainer center={[25.276987, 51.520008]} zoom={10} style={{ height: '100%', borderRadius: 12 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {departments.map((dept, i) => (
          <Marker key={i} position={[dept.location.latitude, dept.location.longitude]}>
            <Popup>
              <strong>{dept.name}</strong><br />
              {dept.location.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default DepartmentMapView;
