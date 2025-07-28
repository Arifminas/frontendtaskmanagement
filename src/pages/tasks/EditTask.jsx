import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Spinner, Alert, Row, Col, ProgressBar, Card, Badge, Dropdown } from 'react-bootstrap';
import { fetchTaskById, updateTask } from '../../Api/tasks';
import { fetchDepartments } from '../../Api/departments';
import { fetchUsers } from '../../api/users';
import { useParams, useNavigate } from 'react-router-dom';
import { notifySuccess, notifyError } from '../../utils/notifications';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Color scheme for consistency
  const colorScheme = {
    primary: '#1a2752',
    secondary: '#dc267f',
    success: '#4caf50',
    danger: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    light: '#f8faff',
    dark: '#1a2752',
    background: '#ffffff',
    gradient: 'linear-gradient(135deg, #1a2752, #dc267f)',
  };

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    department: '',
    assignees: [], // Multiple assignees array
    dueDate: '',
    progress: 0,
    subtasks: [],
  });

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [taskData, deptList, userList] = await Promise.all([
          fetchTaskById(id),
          fetchDepartments(),
          fetchUsers(),
        ]);
        
        console.log('📝 Loaded task data:', taskData);
        
        // Handle assignees - convert to array of IDs
        let assigneesArray = [];
        if (taskData.assignees && Array.isArray(taskData.assignees)) {
          assigneesArray = taskData.assignees.map(assignee => {
            if (typeof assignee === 'object' && assignee._id) {
              return assignee._id;
            } else if (typeof assignee === 'string') {
              return assignee;
            }
            return null;
          }).filter(id => id !== null);
        } else if (taskData.assignee) {
          // Fallback for old single assignee format
          const assigneeId = typeof taskData.assignee === 'object' ? taskData.assignee._id : taskData.assignee;
          if (assigneeId) {
            assigneesArray = [assigneeId];
          }
        }

        console.log('👥 Processed assignees:', assigneesArray);

        setForm({
          title: taskData.title || '',
          description: taskData.description || '',
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          department: taskData.department?._id || '',
          assignees: assigneesArray,
          dueDate: taskData.dueDate ? taskData.dueDate.slice(0, 10) : '',
          progress: taskData.progress || 0,
          subtasks: taskData.subtasks?.map(st => ({
            _id: st._id || null,
            title: st.title || '',
            progress: st.progress || 0,
          })) || [],
        });
        
        setDepartments(deptList);
        setUsers(userList);
        setError('');
      } catch (err) {
        console.error('❌ Failed to load task data:', err);
        notifyError('Failed to load task data');
        setError('Failed to load task data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    
    if (type === 'select-multiple') {
      setForm(prev => ({
        ...prev,
        [name]: Array.from(selectedOptions, (option) => option.value),
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: name === 'progress' ? Math.min(100, Math.max(0, Number(value))) : value,
      }));
    }
  };

  // Enhanced assignee management functions
  const addAssignee = (userId) => {
    if (!form.assignees.includes(userId)) {
      setForm(prev => ({
        ...prev,
        assignees: [...prev.assignees, userId]
      }));
    }
    setShowAssigneeDropdown(false);
  };

  const removeAssignee = (userIdToRemove) => {
    setForm(prev => ({
      ...prev,
      assignees: prev.assignees.filter(id => id !== userIdToRemove)
    }));
  };

  const getUserById = (userId) => {
    return users.find(u => u._id === userId);
  };

  const getUserName = (userId) => {
    const user = getUserById(userId);
    return user ? user.name : 'Unknown User';
  };

  const getAvailableUsers = () => {
    return users.filter(user => !form.assignees.includes(user._id));
  };

  const handleSubtaskChange = (index, field, value) => {
    setForm(prev => {
      const newSubtasks = [...prev.subtasks];
      if (field === 'progress') {
        newSubtasks[index][field] = Math.min(100, Math.max(0, Number(value)));
      } else {
        newSubtasks[index][field] = value;
      }
      return { ...prev, subtasks: newSubtasks };
    });
  };

  const addSubtask = () => {
    setForm(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: '', progress: 0 }],
    }));
  };

  const removeSubtask = (index) => {
    setForm(prev => {
      const newSubtasks = [...prev.subtasks];
      newSubtasks.splice(index, 1);
      return { ...prev, subtasks: newSubtasks };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Enhanced validation
    if (!form.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!form.department) {
      setError('Department is required');
      return;
    }

    if (!Array.isArray(form.assignees) || form.assignees.length === 0) {
      setError('At least one assignee is required');
      return;
    }

    // Validate subtasks
    for (const st of form.subtasks) {
      if (!st.title.trim()) {
        setError('All subtasks must have a title');
        return;
      }
    }

    try {
      console.log('📤 Submitting form data:', form);
      
      // Prepare data for submission
      const updateData = {
        ...form,
        // Ensure assignees is always an array
        assignees: Array.isArray(form.assignees) ? form.assignees : [form.assignees].filter(Boolean)
      };

      console.log('📤 Update data:', updateData);
      
      await updateTask(id, updateData);
      notifySuccess('Task updated successfully');
      navigate('/tasks');
    } catch (err) {
      console.error('❌ Failed to update task:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update task';
      notifyError(msg);
      setError(msg);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" style={{ color: colorScheme.primary, width: '3rem', height: '3rem' }} />
          <p className="mt-3" style={{ color: colorScheme.dark }}>Loading task data...</p>
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
              boxShadow: '0 4px 20px rgba(26, 39, 82, 0.1)',
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
              <h2 className="mb-0 fw-bold">Edit Task</h2>
              <small className="opacity-75">Update task details and assignments</small>
            </Card.Header>

            <Card.Body className="p-3 p-md-4">
              {error && (
                <Alert variant="danger" className="mb-4">
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
                  
                  {/* Title */}
                  <Form.Group className="mb-3" controlId="title">
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
                    />
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="mb-3" controlId="description">
                    <Form.Label className="fw-semibold">Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the task in detail..."
                      style={{ resize: 'vertical' }}
                    />
                  </Form.Group>
                </div>

                {/* Status and Priority Section */}
                <div className="mb-4">
                  <h5 
                    className="border-bottom pb-2 mb-3"
                    style={{ color: colorScheme.dark, borderColor: `${colorScheme.primary}40` }}
                  >
                    <i className="fas fa-cogs me-2"></i>
                    Status & Priority
                  </h5>
                  
                  <Row>
                    <Col sm={6} className="mb-3">
                      <Form.Group controlId="status">
                        <Form.Label className="fw-semibold">Status</Form.Label>
                        <Form.Select name="status" value={form.status} onChange={handleChange}>
                          <option value="pending">⏳ Pending</option>
                          <option value="ongoing">🔄 Ongoing</option>
                          <option value="completed">✅ Completed</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col sm={6} className="mb-3">
                      <Form.Group controlId="priority">
                        <Form.Label className="fw-semibold">Priority</Form.Label>
                        <Form.Select name="priority" value={form.priority} onChange={handleChange}>
                          <option value="low">🟢 Low</option>
                          <option value="medium">🟡 Medium</option>
                          <option value="high">🔴 High</option>
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
                        >
                          <option value="">🏢 Select Department</option>
                          {departments.map(dept => (
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
                        
                        {/* Alternative UI: Dropdown + Multi-select */}
                        <div className="d-flex flex-column gap-2">
                          {/* Multi-select dropdown */}
                          <Form.Select
                            name="assignees"
                            value={form.assignees}
                            onChange={handleChange}
                            multiple
                            size={4}
                            style={{ 
                              borderColor: form.assignees.length > 0 ? colorScheme.success : colorScheme.light,
                              borderWidth: '2px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </Form.Select>
                          
                          {/* Add assignee dropdown */}
                          {getAvailableUsers().length > 0 && (
                            <Dropdown show={showAssigneeDropdown} onToggle={setShowAssigneeDropdown}>
                              <Dropdown.Toggle 
                                variant="outline-secondary" 
                                size="sm"
                                style={{ 
                                  borderColor: colorScheme.secondary,
                                  color: colorScheme.secondary 
                                }}
                              >
                                <i className="fas fa-plus me-2"></i>
                                Add Assignee
                              </Dropdown.Toggle>
                              <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {getAvailableUsers().map(user => (
                                  <Dropdown.Item 
                                    key={user._id}
                                    onClick={() => addAssignee(user._id)}
                                  >
                                    <i className="fas fa-user me-2" style={{ color: colorScheme.primary }}></i>
                                    {user.name} ({user.email})
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                          )}
                        </div>
                        
                        <Form.Text className="text-muted">
                          Hold Ctrl (Cmd on Mac) to select multiple assignees, or use the dropdown to add them
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
                            {form.assignees.map((userId) => {
                              const user = getUserById(userId);
                              return (
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
                                  {user ? `${user.name} (${user.email})` : 'Unknown User'}
                                  <button
                                    type="button"
                                    className="btn-close btn-close-sm ms-2"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={() => removeAssignee(userId)}
                                    title="Remove assignee"
                                  ></button>
                                </Badge>
                              );
                            })}
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
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Progress Section */}
                <div className="mb-4">
                  <h5 
                    className="border-bottom pb-2 mb-3"
                    style={{ color: colorScheme.dark, borderColor: `${colorScheme.primary}40` }}
                  >
                    <i className="fas fa-chart-line me-2"></i>
                    Progress
                  </h5>
                  
                  <Form.Group className="mb-3" controlId="progress">
                    <Form.Label className="fw-semibold">Overall Progress (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      max={100}
                      name="progress"
                      value={form.progress}
                      onChange={handleChange}
                      placeholder="Enter progress percentage"
                    />
                    <ProgressBar
                      now={form.progress}
                      label={`${form.progress}%`}
                      className="mt-2"
                      variant="success"
                      style={{ height: '25px' }}
                    />
                  </Form.Group>
                </div>

                {/* Subtasks Section */}
                <div className="mb-4">
                  <h5 
                    className="border-bottom pb-2 mb-3"
                    style={{ color: colorScheme.dark, borderColor: `${colorScheme.primary}40` }}
                  >
                    <i className="fas fa-tasks me-2"></i>
                    Subtasks ({form.subtasks.length})
                  </h5>
                  
                  {form.subtasks.map((subtask, idx) => (
                    <Card key={idx} className="mb-3 border" style={{ borderColor: `${colorScheme.primary}20` }}>
                      <Card.Body className="p-3">
                        <Row className="align-items-center">
                          <Col xs={12} md={6} className="mb-2 mb-md-0">
                            <Form.Label className="fw-semibold mb-1">Subtask Title</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter subtask title"
                              value={subtask.title}
                              onChange={(e) => handleSubtaskChange(idx, 'title', e.target.value)}
                              required
                            />
                          </Col>
                          <Col xs={8} md={3} className="mb-2 mb-md-0">
                            <Form.Label className="fw-semibold mb-1">Progress (%)</Form.Label>
                            <Form.Control
                              type="number"
                              min={0}
                              max={100}
                              value={subtask.progress}
                              onChange={(e) => handleSubtaskChange(idx, 'progress', e.target.value)}
                              placeholder="0-100"
                            />
                          </Col>
                          <Col xs={4} md={2} className="mb-2 mb-md-0">
                            <Form.Label className="fw-semibold mb-1 d-none d-md-block">Visual</Form.Label>
                            <ProgressBar 
                              now={subtask.progress} 
                              label={`${subtask.progress}%`}
                              variant={subtask.progress === 100 ? 'success' : 'info'}
                              style={{ height: '20px' }}
                            />
                          </Col>
                          <Col xs={12} md={1} className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeSubtask(idx)}
                              title="Remove Subtask"
                              className="w-100"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}

                  <Button 
                    variant="outline-secondary" 
                    onClick={addSubtask}
                    className="w-100"
                    style={{ 
                      borderColor: colorScheme.secondary,
                      color: colorScheme.secondary,
                      borderStyle: 'dashed',
                      padding: '12px'
                    }}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add New Subtask
                  </Button>
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
                  >
                    <i className="fas fa-save me-2"></i>
                    Update Task
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

export default EditTask;