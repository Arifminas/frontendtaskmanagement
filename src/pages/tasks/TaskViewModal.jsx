import React from 'react';
import { Modal, Button, Badge, Row, Col, ProgressBar, Card } from 'react-bootstrap';
import { Attachment as AttachmentIcon, Group as GroupIcon, Business as BusinessIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { getTaskHistory } from '../../api/taskApi'; // adjust path if needed
import { Collapse, Spinner } from 'react-bootstrap';


const [showHistory, setShowHistory] = useState(false);
const [history, setHistory] = useState([]);
const [loadingHistory, setLoadingHistory] = useState(false);

const handleToggleHistory = async () => {
  setShowHistory(!showHistory);
  if (!showHistory && task?._id) {
    setLoadingHistory(true);
    try {
      const res = await getTaskHistory(task._id);
      setHistory(res);
    } catch (err) {
      console.error('Error loading task history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }
};

const TaskViewModal = ({ show, onHide, task }) => {
  if (!task) return null;

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  // Helper function to check if due date needs warning
  const getDueDateWarning = (dueDate) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = (due - now) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      return <Badge bg="danger" className="ms-2">Overdue</Badge>;
    }
    
    if (diffDays <= 2) {
      return <Badge bg="warning" className="ms-2">Due Soon</Badge>;
    }
    
    return null;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #1a2752, #dc267f)', color: 'white', border: 'none' }}>
        <Modal.Title>
          <div>
            <h5 className="mb-1">Task Details</h5>
            <small className="opacity-75">{task.title}</small>
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        {/* Task Title and Status/Priority */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3" style={{ color: '#1a2752' }}>{task.title}</h6>
          <div className="d-flex gap-2 mb-3">
            <Badge bg={getStatusColor(task.status)} className="text-capitalize">
              {task.status}
            </Badge>
            <Badge bg={getPriorityColor(task.priority)} className="text-capitalize">
              {task.priority} Priority
            </Badge>
          </div>
          {task.description && (
            <p className="text-muted">{task.description}</p>
          )}
        </div>

        {/* Progress Section */}
        <Card className="mb-4 border-0" style={{ backgroundColor: '#f8faff' }}>
          <Card.Body>
            <h6 className="fw-bold mb-3" style={{ color: '#1a2752' }}>
              Progress: {task.progress || 0}%
            </h6>
            <ProgressBar 
              now={task.progress || 0} 
              variant="success" 
              style={{ height: '20px' }}
              label={`${task.progress || 0}%`}
            />
          </Card.Body>
        </Card>

        {/* Assignment Details */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="h-100 border-light">
              <Card.Body>
                <h6 className="fw-bold mb-3" style={{ color: '#1a2752' }}>
                  <BusinessIcon style={{ fontSize: 20, marginRight: 8 }} />
                  Assignment Details
                </h6>
                
                <div className="mb-3">
                  <strong>Department:</strong>
                  <div className="text-muted">{task.department?.name || 'Not specified'}</div>
                </div>

                <div>
                  <strong>
                    <GroupIcon style={{ fontSize: 16, marginRight: 4 }} />
                    Assignees ({task.assignees?.length || 0}):
                  </strong>
                  <div className="mt-2">
                    {task.assignees && task.assignees.length > 0 ? (
                      <div>
                        {task.assignees.map((assignee, index) => (
                          <Badge 
                            key={assignee._id || index} 
                            bg="light" 
                            text="dark" 
                            className="me-2 mb-2 d-inline-flex align-items-center"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                          >
                            <div 
                              className="rounded-circle me-2 d-flex align-items-center justify-content-center"
                              style={{ 
                                width: '24px', 
                                height: '24px', 
                                backgroundColor: '#1a2752', 
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {assignee.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div>{assignee.name || 'Unknown User'}</div>
                              {assignee.email && (
                                <small className="text-muted">{assignee.email}</small>
                              )}
                            </div>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted">No assignees</div>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100 border-light">
              <Card.Body>
                <h6 className="fw-bold mb-3" style={{ color: '#1a2752' }}>
                  <CalendarIcon style={{ fontSize: 20, marginRight: 8 }} />
                  Timeline
                </h6>
                
                <div className="mb-3">
                  <strong>Due Date:</strong>
                  <div className="d-flex align-items-center">
                    <span className="text-muted">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date set'}
                    </span>
                    {getDueDateWarning(task.dueDate)}
                  </div>
                </div>

                {task.createdAt && (
                  <div>
                    <strong>Created:</strong>
                    <div className="text-muted">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 && (
          <Card className="border-light">
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a2752' }}>
                <AttachmentIcon style={{ fontSize: 20, marginRight: 8 }} />
                Attachments ({task.attachments.length})
              </h6>
              
              <Row>
                {task.attachments.map((attachment, index) => {
                  const fileName = attachment.split('/').pop();
                  const fileExtension = fileName.split('.').pop().toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                  
                  return (
                    <Col key={index} xs={12} sm={6} md={4} className="mb-3">
                      <Card 
                        className="h-100 border-light"
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '';
                        }}
                        onClick={() => window.open(attachment, '_blank')}
                      >
                        {isImage ? (
                          <Card.Img 
                            variant="top" 
                            src={attachment} 
                            style={{ height: '120px', objectFit: 'cover' }}
                            alt={fileName}
                          />
                        ) : (
                          <div 
                            className="d-flex align-items-center justify-content-center"
                            style={{ 
                              height: '120px', 
                              backgroundColor: '#f8f9fa',
                              fontSize: '2rem',
                              color: '#6c757d'
                            }}
                          >
                            <AttachmentIcon style={{ fontSize: '3rem' }} />
                          </div>
                        )}
                        <Card.Body className="p-2">
                          <Card.Text 
                            className="mb-0 small fw-bold text-truncate" 
                            title={fileName}
                            style={{ fontSize: '0.8rem' }}
                          >
                            {fileName}
                          </Card.Text>
                          <small className="text-muted">
                            {isImage ? 'Image' : 'Document'}
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Legacy Single Assignee Support (fallback) */}
        {task.assignee && (!task.assignees || task.assignees.length === 0) && (
          <div className="mt-3 p-3 bg-light rounded">
            <strong>Legacy Assignee:</strong>
            <div className="text-muted mt-1">
              {task.assignee.name || 'Unknown User'}
              {task.assignee.email && ` (${task.assignee.email})`}
            </div>
          </div>
        )}
      </Modal.Body>
      

      <div className="text-end mt-4">
  <Button
    variant="outline-dark"
    size="sm"
    onClick={handleToggleHistory}
    aria-expanded={showHistory}
  >
    {showHistory ? 'Hide Task History' : 'Show Task History'}
  </Button>
</div>

<Collapse in={showHistory}>
  <div className="mt-3">
    {loadingHistory ? (
      <div className="text-center my-3">
        <Spinner animation="border" size="sm" /> Loading history...
      </div>
    ) : history.length > 0 ? (
      <ul className="list-group">
        {history.map((h, i) => (
          <li key={i} className="list-group-item d-flex justify-content-between align-items-start">
            <div>
              <strong>{h.action}</strong>
              {h.details && <div className="small text-muted">{h.details}</div>}
              <div className="small text-secondary">
                By {h.performedBy?.name || 'System'} on {new Date(h.timestamp || h.createdAt).toLocaleString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-muted">No history found.</div>
    )}
  </div>
</Collapse>
      <Modal.Footer className="border-top">
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        {task.status !== 'completed' && (
          <Button 
            variant="primary" 
            style={{ backgroundColor: '#dc267f', borderColor: '#dc267f' }}
            onClick={() => {
              // You can add edit functionality here
              console.log('Edit task:', task._id);
              onHide();
            }}
          >
            Edit Task
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TaskViewModal;