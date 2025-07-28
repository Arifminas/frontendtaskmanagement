import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { Card, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import axiosInstance from '../../Api/axiosInstance';
import { notifyError, notifySuccess } from '../../utils/notifications';


const TaskDetail = () => {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [addingComment, setAddingComment] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [history, setHistory] = useState([]);

    const uploadAttachment = async () => {
        if (!fileInputRef.current.files.length) {
            notifyError('Please select a file to upload');
            return;
        }

        const file = fileInputRef.current.files[0];
        const formData = new FormData();
        formData.append('attachment', file);

        setUploading(true);
        try {
            await axiosInstance.post(`/tasks/${taskId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            notifySuccess('Attachment uploaded');
            fetchTask();
            fileInputRef.current.value = ''; // reset file input
        } catch (err) {
            notifyError('Failed to upload attachment');
        }
        setUploading(false);
    };
    const fetchTask = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/tasks/${taskId}`);
            setTask(res.data.task);
        } catch (err) {
            notifyError('Failed to load task');
        }
        setLoading(false);
    };

useEffect(() => {
  const fetchHistory = async () => {
    const res = await axiosInstance.get(`/tasks/${taskId}/history`);
    setHistory(res.data.data);
  };
  fetchHistory();
}, [taskId]);
    
    useEffect(() => {
        fetchTask();
    }, [taskId]);

    const addComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setAddingComment(true);
        try {
            await axiosInstance.post(`/tasks/${taskId}/comments`, { text: commentText });
            notifySuccess('Comment added');
            setCommentText('');
            fetchTask();
        } catch (err) {
            notifyError('Failed to add comment');
        }
        setAddingComment(false);
    };

    const updateStatus = async (newStatus) => {
        try {
            await axiosInstance.patch(`/tasks/${taskId}/status`, { status: newStatus });
            notifySuccess('Status updated');
            fetchTask();
        } catch (err) {
            notifyError('Failed to update status');
        }
    };

    if (loading) return <Spinner animation="border" />;

    if (!task) return <p>Task not found.</p>;

    return (
        
            <Card>
                <Card.Header>
                    <h3>{task.title}</h3>
                    <small>Status: {task.status}</small>
                </Card.Header>
                <Card.Body>
                    <p>{task.description}</p>
                    <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>

                    {/* Status update buttons */}
                    {task.status !== 'Completed' && (
                        <div className="mb-3">
                            <Button variant="success" onClick={() => updateStatus('Completed')}>Mark Completed</Button>{' '}
                            <Button variant="warning" onClick={() => updateStatus('In Progress')}>Mark In Progress</Button>
                        </div>
                    )}

                    {/* Comments Section */}
                    <h5>Comments</h5>
                    <ListGroup>
                        {task.comments && task.comments.length > 0 ? (
                            task.comments.map((c) => (
                                <ListGroup.Item key={c._id}>
                                    <strong>{c.user.name}:</strong> {c.text} <br />
                                    <small>{new Date(c.createdAt).toLocaleString()}</small>
                                </ListGroup.Item>
                            ))
                        ) : (
                            <p>No comments yet.</p>
                        )}
                    </ListGroup>

                    {/* Add Comment */}
                    <Form onSubmit={addComment} className="mt-3">
                        <Form.Group controlId="commentText">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                        </Form.Group>
                        {/* File upload for attachments */}
                        <div className="mt-4">
                            <h5>Upload Attachment</h5>
                            <input type="file" ref={fileInputRef} />
                            <Button
                                variant="secondary"
                                onClick={uploadAttachment}
                                disabled={uploading}
                                className="ms-2"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>

                        {/* Display attachments */}
                        <div className="mt-3">
                            <h5>Attachments</h5>
                            {task.attachments && task.attachments.length > 0 ? (
                                <ul>
                                    {task.attachments.map(att => (
                                        <li key={att._id}>
                                            <a href={att.url} target="_blank" rel="noopener noreferrer">{att.filename}</a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No attachments yet.</p>
                            )}
                        </div>
                        <Button variant="primary" type="submit" disabled={addingComment} className="mt-2">
                            {addingComment ? 'Adding...' : 'Add Comment'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
       
    );
};

export default TaskDetail;
