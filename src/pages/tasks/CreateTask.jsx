import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Container,
  Alert,
  Spinner,
  ListGroup,
  Row,
  Col,
  Card,
  Badge,
} from 'react-bootstrap';
import { fetchDepartments } from '../../Api/departments';
import { fetchUsers } from '../../api/users';
import { createTask } from '../../api/tasks';
import axiosInstance from '../../Api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskCreate = () => {
  const navigate = useNavigate();

  // Color scheme extracted from your Layout component
  const colorScheme = {
    primary: '#1a2752',      // Your primary brand color
    primaryLight: '#2a3f6f', // Light variant of primary
    primaryDark: '#0f1a3a',  // Dark variant of primary
    secondary: '#dc267f',    // Your secondary brand color
    secondaryLight: '#ff5ea8', // Light variant of secondary
    secondaryDark: '#a01e5c',  // Dark variant of secondary
    success: '#4caf50',      // Success green (from your status indicator)
    danger: '#f44336',       // Error red
    warning: '#ff9800',      // Warning orange
    info: '#2196f3',         // Info blue
    light: '#f8faff',        // Your background color from Layout
    dark: '#1a2752',         // Dark text (using your primary)
    background: '#ffffff',   // Card background
    paper: '#ffffff',        // Paper background
    cardShadow: '0 4px 20px rgba(26, 39, 82, 0.1)', // Card shadow with your primary color
    gradient: 'linear-gradient(135deg, #1a2752, #dc267f)', // Your brand gradient
  };

  // Task form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    department: '',
    assignees: [],
    dueDate: '',
  });

  // Data lists
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Attachments state
  const [files, setFiles] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Load departments and users on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [deptList, userList] = await Promise.all([
          fetchDepartments(),
          fetchUsers(),
        ]);
        setDepartments(deptList);
        setUsers(userList);
      } catch (err) {
        notifyError('Failed to load departments or users');
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;

    if (type === 'select-multiple') {
      setForm((prev) => ({
        ...prev,
        [name]: Array.from(selectedOptions, (option) => option.value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  // Upload files separately after task creation
  const handleUpload = async (taskId) => {
    if (files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('attachments', files[i]);
    }
    formData.append('taskId', taskId);

    setUploading(true);
    try {
      const res = await axiosInstance.post('/tasks/upload-attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachments(res.data.data.attachments);
      notifySuccess('Attachments uploaded successfully');
    } catch (err) {
      notifyError('Failed to upload attachments');
    } finally {
      setUploading(false);
      setFiles([]);
    }
  };

  // Handle form submit (create task + upload attachments)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.title || !form.department || !Array.isArray(form.assignees) || form.assignees.length === 0) {
      setError('Please fill in all required fields (Title, Department, and at least one Assignee)');
      return;
    }

    try {
      // Create task first
      const createdTask = await createTask(form);
      toast.success('Task created and assignees notified!');
      notifySuccess('Task created successfully');

      // Upload attachments if files selected
      if (files.length > 0) {
        await handleUpload(createdTask._id);
      }

      // Redirect to task list
      navigate('/tasks');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task';
      setError(msg);
      notifyError(msg);
      toast.error(msg);
    }
  };

  // Function to remove assignee
  const removeAssignee = (userIdToRemove) => {
    setForm(prev => ({
      ...prev,
      assignees: prev.assignees.filter(id => id !== userIdToRemove)
    }));
  };

  // Function to get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Priority badge color mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colorScheme.danger;
      case 'medium': return colorScheme.warning;
      case 'low': return colorScheme.success;
      default: return colorScheme.secondary;
    }
  };

  // Status badge color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colorScheme.success;
      case 'ongoing': return colorScheme.info;
      case 'pending': return colorScheme.warning;
      default: return colorScheme.secondary;
    }
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" 
                 style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner 
            animation="border" 
            style={{ color: colorScheme.primary, width: '3rem', height: '3rem' }}
          />
          <p className="mt-3" style={{ color: colorScheme.dark }}>Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3 py-md-4" style={{ backgroundColor: colorScheme.light }}>
      <Row className="justify-content-center">
        <Col xs={12} sm={11} md={10} lg={8} xl={6}>
          <Card 
            className="border-0 shadow-sm"
            style={{ 
              background: colorScheme.background,
              boxShadow: colorScheme.cardShadow,
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <Card.Header 
              className="border-0 text-center py-4"
              style={{ 
                background: colorScheme.gradient,
                color: 'white'
              }}
            >
              <h2 className="mb-0 fw-bold">Create New Task</h2>
              <small className="opacity-75">Fill in the details to create a new task</small>
            </Card.Header>

            <Card.Body className="p-3 p-md-4">
              {error && (
                <Alert 
                  variant="danger" 
                  className="mb-4"
                  style={{ borderColor: colorScheme.danger }}
                >
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                <div className="mb-4">
                  <h5 
                    className="border-bottom pb-2 mb-3"
                    style={{ color: colorScheme.dark, borderColor: `${colorScheme.primary}40` }}
                  >
                    <i className="fas fa-info-circle me-2"></i>
                    Basic Information
                  </h5>
                  
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group controlId="title">
                        <Form.Label className="fw-semibold">
                          Title <span style={{ color: colorScheme.danger }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          required
                          placeholder="Enter task title"
                          style={{ 
                            borderColor: form.title ? colorScheme.success : colorScheme.light,
                            borderWidth: '2px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = colorScheme.primary}
                          onBlur={(e) => e.target.style.borderColor = form.title ? colorScheme.success : colorScheme.light}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Group controlId="description">
                        <Form.Label className="fw-semibold">Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Describe the task in detail..."
                          style={{ 
                            resize: 'vertical',
                            borderColor: colorScheme.light,
                            borderWidth: '2px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = colorScheme.primary}
                          onBlur={(e) => e.target.style.borderColor = colorScheme.light}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Priority and Status Section */}
                <div className="mb-4">
                  <h5 
                    className="border-bottom pb-2 mb-3"
                    style={{ color: colorScheme.dark, borderColor: `${colorScheme.primary}40` }}
                  >
                    <i className="fas fa-cogs me-2"></i>
                    Priority & Status
                  </h5>
                  
                  <Row>
                    <Col sm={6} className="mb-3">
                      <Form.Group controlId="priority">
                        <Form.Label className="fw-semibold d-flex align-items-center">
                          Priority
                          <span 
                            className="badge ms-2 px-2 py-1"
                            style={{ 
                              backgroundColor: getPriorityColor(form.priority),
                              fontSize: '0.7rem'
                            }}
                          >
                            {form.priority.toUpperCase()}
                          </span>
                        </Form.Label>
                        <Form.Select 
                          name="priority" 
                          value={form.priority} 
                          onChange={handleChange}
                        >
                          <option value="low">🟢 Low</option>
                          <option value="medium">🟡 Medium</option>
                          <option value="high">🔴 High</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col sm={6} className="mb-3">
                      <Form.Group controlId="status">
                        <Form.Label className="fw-semibold d-flex align-items-center">
                          Status
                          <span 
                            className="badge ms-2 px-2 py-1"
                            style={{ 
                              backgroundColor: getStatusColor(form.status),
                              fontSize: '0.7rem'
                            }}
                          >
                            {form.status.toUpperCase()}
                          </span>
                        </Form.Label>
                        <Form.Select 
                          name="status" 
                          value={form.status} 
                          onChange={handleChange}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="ongoing">🔄 Ongoing</option>
                          <option value="completed">✅ Completed</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Assignment Section */}
                <div className="mb-4">
                  <h5 
                    className="border-bottom pb-2 mb-3"
                    style={{ color: colorScheme.dark, borderColor: `${colorScheme.primary}40` }}
                  >
                    <i className="fas fa-users me-2"></i>
                    Assignment
                  </h5>
                  
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group controlId="department">
                        <Form.Label className="fw-semibold">
                          Department <span style={{ color: colorScheme.danger }}>*</span>
                        </Form.Label>
                        <Form.Select
                          name="department"
                          value={form.department}
                          onChange={handleChange}
                          required
                          style={{ 
                            borderColor: form.department ? colorScheme.success : colorScheme.light,
                            borderWidth: '2px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = colorScheme.primary}
                          onBlur={(e) => e.target.style.borderColor = form.department ? colorScheme.success : colorScheme.light}
                        >
                          <option value="">🏢 Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group controlId="assignees">
                        <Form.Label className="fw-semibold">
                          Assignees <span style={{ color: colorScheme.danger }}>*</span>
                          {form.assignees.length > 0 && (
                            <Badge 
                              bg="secondary" 
                              className="ms-2"
                              style={{ backgroundColor: colorScheme.secondary }}
                            >
                              {form.assignees.length} selected
                            </Badge>
                          )}
                        </Form.Label>
                        <Form.Select
                          name="assignees"
                          value={form.assignees}
                          onChange={handleChange}
                          multiple
                          size={5}
                          style={{ 
                            borderColor: form.assignees.length > 0 ? colorScheme.success : colorScheme.light,
                            borderWidth: '2px',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => e.target.style.borderColor = colorScheme.primary}
                          onBlur={(e) => e.target.style.borderColor = form.assignees.length > 0 ? colorScheme.success : colorScheme.light}
                        >
                          {users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Hold Ctrl (Cmd on Mac) to select multiple assignees
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Selected Assignees Display */}
                  {form.assignees.length > 0 && (
                    <Row>
                      <Col md={12} className="mb-3">
                        <div className="p-3 border rounded" style={{ backgroundColor: `${colorScheme.primary}08` }}>
                          <h6 className="mb-2" style={{ color: colorScheme.dark }}>
                            <i className="fas fa-user-check me-2"></i>
                            Selected Assignees ({form.assignees.length})
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {form.assignees.map((userId) => (
                              <Badge
                                key={userId}
                                bg="light"
                                text="dark"
                                className="d-flex align-items-center gap-2 px-3 py-2"
                                style={{ 
                                  fontSize: '0.9rem',
                                  border: `1px solid ${colorScheme.primary}30`
                                }}
                              >
                                <i className="fas fa-user" style={{ color: colorScheme.primary }}></i>
                                {getUserName(userId)}
                                <button
                                  type="button"
                                  className="btn-close btn-close-sm ms-2"
                                  style={{ fontSize: '0.7rem' }}
                                  onClick={() => removeAssignee(userId)}
                                  title="Remove assignee"
                                ></button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group controlId="dueDate">
                        <Form.Label className="fw-semibold">
                          <i className="fas fa-calendar me-1"></i>
                          Due Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="dueDate"
                          value={form.dueDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Attachments Section */}
                <div className="mb-4">
                  <h5 
                    className="border-bottom pb-2 mb-3"
                    style={{ color: colorScheme.dark, borderColor: `${colorScheme.primary}40` }}
                  >
                    <i className="fas fa-paperclip me-2"></i>
                    Attachments
                  </h5>
                  
                  <Row>
                    <Col md={8} className="mb-3">
                      <Form.Group controlId="formFileMultiple">
                        <Form.Label className="fw-semibold">Upload Files</Form.Label>
                        <Form.Control 
                          type="file" 
                          multiple 
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                        />
                        <Form.Text className="text-muted">
                          Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={4} className="mb-3 d-flex align-items-end">
                      <Button
                        onClick={() => handleUpload(form._id)}
                        disabled={uploading || files.length === 0}
                        variant="outline-secondary"
                        className="w-100"
                        type="button"
                        style={{ 
                          borderColor: colorScheme.secondary,
                          color: colorScheme.secondary,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = colorScheme.secondary;
                          e.target.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = colorScheme.secondary;
                        }}
                      >
                        {uploading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-upload me-2"></i>
                            Upload Files
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>

                  {attachments?.length > 0 && (
                    <div className="mt-3">
                      <small className="text-muted fw-semibold">Uploaded Files:</small>
                      <ListGroup className="mt-2">
                        {attachments.map((att, idx) => (
                          <ListGroup.Item 
                            key={idx}
                            className="d-flex justify-content-between align-items-center"
                            style={{ borderColor: `${colorScheme.primary}30` }}
                          >
                            <div>
                              <i className="fas fa-file me-2" style={{ color: colorScheme.secondary }}></i>
                              <a 
                                href={att} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  color: colorScheme.primary,
                                  textDecoration: 'none' 
                                }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                              >
                                {att.split('/').pop()}
                              </a>
                            </div>
                            <small className="text-muted">
                              <i className="fas fa-external-link-alt"></i>
                            </small>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/tasks')}
                    className="order-2 order-sm-1"
                    style={{ 
                      borderColor: colorScheme.secondary,
                      color: colorScheme.secondary,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = colorScheme.secondary;
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = colorScheme.secondary;
                    }}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    className="order-1 order-sm-2"
                    style={{ 
                      background: colorScheme.gradient,
                      borderColor: colorScheme.primary,
                      boxShadow: `0 4px 12px ${colorScheme.primary}40`,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 6px 16px ${colorScheme.primary}50`;
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = `0 4px 12px ${colorScheme.primary}40`;
                    }}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Create Task
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TaskCreate;