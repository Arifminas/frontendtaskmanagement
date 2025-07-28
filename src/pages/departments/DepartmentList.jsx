import React, { useEffect, useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Spinner, 
  Container, 
  Row, 
  Col, 
  Card,
  Badge,
  Alert,
  ButtonGroup,
  Dropdown
} from 'react-bootstrap';
import {
  IconButton,
  Tooltip,
  Fab,
  useMediaQuery,
  useTheme,
  Skeleton,
  Box,
  Typography,
  Chip,
  Avatar,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDepartments, deleteDepartment } from '../../Api/departments';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { useNavigate } from 'react-router-dom';

// Color palette matching your sidebar design
const colorPalette = {
  primary: '#dc267f', // Pink primary from sidebar
  secondary: '#b91c5c', // Darker pink
  accent: '#2a3f6f', // Blue accent from sidebar
  dark: '#1a2752', // Dark blue from sidebar
  light: '#f8fafc', // Light background
  surface: '#ffffff',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#64748b',
  text: '#1e293b',
  gradient: 'linear-gradient(135deg, #dc267f 0%, #b91c5c 100%)',
  darkGradient: 'linear-gradient(135deg, #2a3f6f 0%, #1a2752 100%)',
  cardShadow: '0 4px 20px rgba(220, 38, 127, 0.1)',
  hoverShadow: '0 8px 30px rgba(220, 38, 127, 0.15)'
};

const DepartmentList = ({ darkMode = false }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:767px)');
  const isTablet = useMediaQuery('(min-width:768px) and (max-width:1023px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const depts = await fetchDepartments();
      setDepartments(depts);
      notifySuccess('Departments loaded successfully');
    } catch (error) {
      notifyError('Failed to load departments');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" department?`)) return;
    
    // Optimistic update
    const originalDepts = departments;
    setDepartments(departments.filter(dept => dept._id !== id));
    setDeletingIds(prev => new Set([...prev, id]));
    
    try {
      await deleteDepartment(id);
      notifySuccess('Department deleted successfully');
    } catch (error) {
      // Revert on error
      setDepartments(originalDepts);
      notifyError('Failed to delete department');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleView = (id) => {
    navigate(`/departments/${id}/view`);
  };

  const handleEdit = (id) => {
    navigate(`/departments/${id}/edit`);
  };

  const handleCreate = () => {
    navigate('/departments/create');
  };

  // Enhanced action button component
  const ActionButton = ({ onClick, color, icon, tooltip, disabled = false, loading = false }) => (
    <Tooltip title={tooltip} placement="top" arrow>
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <IconButton 
          size="small" 
          onClick={onClick}
          disabled={disabled}
          sx={{
            color: disabled ? colorPalette.muted : 'white',
            backgroundColor: disabled ? alpha(colorPalette.muted, 0.1) : color,
            width: isMobile ? 36 : 32,
            height: isMobile ? 36 : 32,
            margin: '0 2px',
            border: `1px solid ${disabled ? colorPalette.muted : alpha(color, 0.3)}`,
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: disabled ? 'none' : `0 2px 8px ${alpha(color, 0.3)}`,
            '&:hover': {
              backgroundColor: disabled ? alpha(colorPalette.muted, 0.1) : alpha(color, 0.9),
              transform: disabled ? 'none' : 'translateY(-1px)',
              boxShadow: disabled ? 'none' : `0 4px 12px ${alpha(color, 0.4)}`,
            },
          }}
        >
          {loading ? (
            <Spinner size="sm" animation="border" style={{ width: '16px', height: '16px' }} />
          ) : (
            icon
          )}
        </IconButton>
      </motion.div>
    </Tooltip>
  );

  // Memoized department rows
  const departmentRows = useMemo(() => {
    if (isMobile) {
      // Mobile card layout
      return departments.map((dept, index) => (
        <Col xs={12} sm={6} lg={4} key={dept._id} className="mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ y: -4 }}
          >
            

            <Card 
              style={{ 
                borderRadius: '16px',
                border: 'none',
                boxShadow: colorPalette.cardShadow,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: darkMode ? colorPalette.dark : colorPalette.surface,
                overflow: 'hidden',
                position: 'relative',
              }}
              className="h-100 department-card"
            >
              {/* Decorative background elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: alpha(colorPalette.primary, 0.1),
                  zIndex: 0,
                }}
              />
              
              <Card.Header 
                style={{ 
                  background: colorPalette.gradient,
                  border: 'none',
                  borderRadius: '16px 16px 0 0',
                  position: 'relative',
                  zIndex: 1,
                }}
                className="text-white"
              >
                <div className="d-flex align-items-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Avatar 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        marginRight: '12px',
                        width: 40,
                        height: 40,
                        border: '2px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      <CategoryIcon fontSize="medium" />
                    </Avatar>
                  </motion.div>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h6" 
                      component="h5" 
                      sx={{ 
                        margin: 0, 
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {dept.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      ID: {dept._id.slice(-6)}
                    </Typography>
                  </Box>
                </div>
              </Card.Header>
              
              <Card.Body style={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? 'rgba(255,255,255,0.8)' : colorPalette.muted,
                    marginBottom: '20px',
                    minHeight: '40px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                  }}
                >
                  {dept.description || 'No description available'}
                </Typography>
                
                <div className="d-flex justify-content-between align-items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                  >
                    <Chip 
                      label="Active" 
                      size="small" 
                      sx={{ 
                        backgroundColor: colorPalette.success,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: '24px',
                        boxShadow: `0 2px 8px ${alpha(colorPalette.success, 0.3)}`,
                      }}
                    />
                  </motion.div>
                  
                  <Box className="d-flex">
                    <ActionButton
                      onClick={() => handleView(dept._id)}
                      color={colorPalette.info}
                      icon={<ViewIcon fontSize="small" />}
                      tooltip="View Details"
                    />
                    <ActionButton
                      onClick={() => handleEdit(dept._id)}
                      color={colorPalette.warning}
                      icon={<EditIcon fontSize="small" />}
                      tooltip="Edit Department"
                    />
                    <ActionButton
                      onClick={() => handleDelete(dept._id, dept.name)}
                      color={colorPalette.danger}
                      icon={<DeleteIcon fontSize="small" />}
                      tooltip="Delete Department"
                      disabled={deletingIds.has(dept._id)}
                      loading={deletingIds.has(dept._id)}
                    />
                  </Box>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      ));
    }

    // Desktop/Tablet table layout
    return departments.map((dept, index) => (
      <motion.tr 
        key={dept._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        style={{ 
          transition: 'all 0.2s ease',
          background: darkMode ? alpha(colorPalette.dark, 0.3) : 'transparent',
        }}
        className="table-row"
      >
        <td style={{ verticalAlign: 'middle', padding: '16px 20px' }}>
          <div className="d-flex align-items-center">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Avatar 
                sx={{ 
                  background: colorPalette.gradient,
                  marginRight: '16px',
                  width: 44,
                  height: 44,
                  border: `2px solid ${alpha(colorPalette.primary, 0.2)}`,
                  boxShadow: `0 4px 12px ${alpha(colorPalette.primary, 0.2)}`,
                }}
              >
                <CategoryIcon fontSize="medium" />
              </Avatar>
            </motion.div>
            <div>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 700, 
                  color: darkMode ? 'white' : colorPalette.text,
                  fontSize: '1rem',
                  marginBottom: '2px',
                }}
              >
                {dept.name}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: colorPalette.muted,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                ID: {dept._id.slice(-6)}
              </Typography>
            </div>
          </div>
        </td>
        <td style={{ verticalAlign: 'middle', padding: '16px 20px' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: darkMode ? 'rgba(255,255,255,0.8)' : colorPalette.muted,
              fontSize: '0.9rem',
              lineHeight: 1.4,
              maxWidth: '300px',
            }}
          >
            {dept.description || (
              <em style={{ color: colorPalette.muted, opacity: 0.7 }}>No description</em>
            )}
          </Typography>
        </td>
        <td style={{ verticalAlign: 'middle', padding: '16px 20px' }}>
          <Chip 
            label="Active" 
            size="small" 
            sx={{ 
              backgroundColor: alpha(colorPalette.success, 0.1),
              color: colorPalette.success,
              fontWeight: 600,
              border: `1px solid ${alpha(colorPalette.success, 0.3)}`,
              fontSize: '0.75rem',
            }}
          />
        </td>
        <td style={{ verticalAlign: 'middle', padding: '16px 20px', textAlign: 'center' }}>
          {isTablet ? (
            <Dropdown>
              <Dropdown.Toggle 
                as={IconButton} 
                size="small"
                sx={{
                  color: darkMode ? 'white' : colorPalette.muted,
                  backgroundColor: alpha(colorPalette.primary, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(colorPalette.primary, 0.2),
                  },
                }}
              >
                <MoreVertIcon />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleView(dept._id)}>
                  <ViewIcon style={{ marginRight: '8px', fontSize: '16px' }} />
                  View
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleEdit(dept._id)}>
                  <EditIcon style={{ marginRight: '8px', fontSize: '16px' }} />
                  Edit
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={() => handleDelete(dept._id, dept.name)}
                  style={{ color: colorPalette.danger }}
                >
                  <DeleteIcon style={{ marginRight: '8px', fontSize: '16px' }} />
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
              <MenuItem onClick={() => navigate('/departments/map')}>
  <MapIcon fontSize="small" /> Department Map
</MenuItem>
            </Dropdown>
          ) : (
            <Box className="d-flex justify-content-center">
              <ActionButton
                onClick={() => handleView(dept._id)}
                color={colorPalette.info}
                icon={<ViewIcon fontSize="small" />}
                tooltip="View Details"
              />
              <ActionButton
                onClick={() => handleEdit(dept._id)}
                color={colorPalette.warning}
                icon={<EditIcon fontSize="small" />}
                tooltip="Edit Department"
              />
              <ActionButton
                onClick={() => handleDelete(dept._id, dept.name)}
                color={colorPalette.danger}
                icon={<DeleteIcon fontSize="small" />}
                tooltip="Delete Department"
                disabled={deletingIds.has(dept._id)}
                loading={deletingIds.has(dept._id)}
              />
            </Box>
          )}
        </td>
      </motion.tr>
    ));
  }, [departments, deletingIds, isMobile, isTablet, darkMode]);

  const LoadingSkeleton = () => (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Skeleton 
            variant="text" 
            width={300} 
            height={50} 
            sx={{ bgcolor: darkMode ? alpha(colorPalette.dark, 0.3) : alpha(colorPalette.muted, 0.1) }}
          />
          <Skeleton 
            variant="rectangular" 
            width={180} 
            height={40} 
            sx={{ 
              marginTop: '16px', 
              borderRadius: '8px',
              bgcolor: darkMode ? alpha(colorPalette.dark, 0.3) : alpha(colorPalette.muted, 0.1)
            }}
          />
        </Col>
      </Row>
      {[...Array(5)].map((_, index) => (
        <Row key={index} className="mb-3">
          <Col>
            <Skeleton 
              variant="rectangular" 
              height={80} 
              sx={{ 
                borderRadius: '12px',
                bgcolor: darkMode ? alpha(colorPalette.dark, 0.3) : alpha(colorPalette.muted, 0.1)
              }}
            />
          </Col>
        </Row>
      ))}
    </Container>
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <Container 
      fluid 
      className="py-4" 
      style={{ 
        backgroundColor: darkMode ? colorPalette.dark : colorPalette.light, 
        minHeight: '100vh',
        transition: 'background-color 0.3s ease',
      }}
    >
      <style jsx>{`
        .department-card:hover {
          transform: translateY(-6px);
          box-shadow: ${colorPalette.hoverShadow} !important;
        }
        
        .table-row:hover {
          background-color: ${darkMode ? alpha(colorPalette.primary, 0.1) : alpha(colorPalette.primary, 0.05)} !important;
          transform: translateX(4px);
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .container-fluid {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }
      `}</style>

      <Row className="mb-4">
        <Col>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="d-flex justify-content-between align-items-center flex-wrap"
          >
            <div className="mb-2 mb-md-0">
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  background: colorPalette.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: isMobile ? '2rem' : '2.5rem',
                  marginBottom: '8px',
                  textShadow: darkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Department Management
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.7)' : colorPalette.muted,
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                Manage your organization's departments and teams
              </Typography>
            </div>
            
            {isMobile ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
              >
                <Fab
                  color="primary"
                  aria-label="add department"
                  onClick={handleCreate}
                  sx={{ 
                    background: colorPalette.gradient,
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                    width: 64,
                    height: 64,
                    boxShadow: `0 8px 25px ${alpha(colorPalette.primary, 0.4)}`,
                    '&:hover': {
                      background: colorPalette.gradient,
                      transform: 'scale(1.1)',
                      boxShadow: `0 12px 30px ${alpha(colorPalette.primary, 0.5)}`,
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: '28px' }} />
                </Fab>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleCreate}
                  style={{
                    background: colorPalette.gradient,
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: `0 6px 20px ${alpha(colorPalette.primary, 0.3)}`,
                    transition: 'all 0.3s ease',
                  }}
                  className="d-flex align-items-center"
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 8px 25px ${alpha(colorPalette.primary, 0.4)}`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0px)';
                    e.target.style.boxShadow = `0 6px 20px ${alpha(colorPalette.primary, 0.3)}`;
                  }}
                >
                  <AddIcon style={{ marginRight: '10px', fontSize: '20px' }} />
                  Add New Department
                </Button>
              </motion.div>
            )}
          </motion.div>
        </Col>
      </Row>

      {departments.length === 0 ? (
        <Row>
          <Col>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Alert 
                variant="info" 
                className="text-center"
                style={{
                  backgroundColor: darkMode 
                    ? alpha(colorPalette.info, 0.15) 
                    : alpha(colorPalette.info, 0.1),
                  borderColor: alpha(colorPalette.info, 0.3),
                  color: darkMode ? 'white' : colorPalette.info,
                  borderRadius: '16px',
                  border: `2px solid ${alpha(colorPalette.info, 0.2)}`,
                  padding: '40px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <CategoryIcon sx={{ fontSize: '64px', marginBottom: '20px', color: colorPalette.info }} />
                </motion.div>
                <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: '12px' }}>
                  No departments found
                </Typography>
                <Typography variant="body1" sx={{ marginBottom: '24px', opacity: 0.8 }}>
                  Get started by creating your first department to organize your teams
                </Typography>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleCreate}
                    style={{
                      background: colorPalette.gradient,
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontWeight: 600,
                    }}
                  >
                    <AddIcon style={{ marginRight: '8px' }} />
                    Create First Department
                  </Button>
                </motion.div>
              </Alert>
            </motion.div>
          </Col>
        </Row>
      ) : isMobile ? (
        <AnimatePresence>
          <Row className="fade-in">
            {departmentRows}
          </Row>
        </AnimatePresence>
      ) : (
        <Row>
          <Col>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                style={{ 
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: darkMode 
                    ? '0 8px 32px rgba(0,0,0,0.3)' 
                    : '0 4px 20px rgba(0,0,0,0.08)',
                  background: darkMode ? colorPalette.accent : colorPalette.surface,
                  overflow: 'hidden',
                }}
                className="fade-in"
              >
                <Card.Body style={{ padding: 0 }}>
                  <Table 
                    hover 
                    responsive 
                    style={{ margin: 0 }}
                    className="table-hover"
                  >
                    <thead 
                      style={{ 
                        background: darkMode 
                          ? colorPalette.darkGradient 
                          : alpha(colorPalette.primary, 0.05),
                      }}
                    >
                      <tr>
                        {['Department', 'Description', 'Status', 'Actions'].map((header) => (
                          <th 
                            key={header}
                            style={{ 
                              border: 'none', 
                              padding: '20px',
                              fontWeight: 700,
                              color: darkMode ? 'white' : colorPalette.text,
                              fontSize: '0.95rem',
                              textAlign: header === 'Actions' ? 'center' : 'left',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {departmentRows}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default DepartmentList;