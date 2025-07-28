import React, { useState, useEffect } from 'react';
import { Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import axiosInstance from '../../Api/axiosInstance';
import { notifyError } from '../../utils/notifications';

const CommentItem = ({ comment, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (replyText.trim() === '') return;
    onReply(comment._id, replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

  return (
    <ListGroup.Item>
      <strong>{comment.user.name}</strong> says:
      <p>{comment.comment}</p>
      <small>{new Date(comment.createdAt).toLocaleString()}</small>
      <br />
      <Button
        variant="link"
        size="sm"
        onClick={() => setShowReplyForm(!showReplyForm)}
      >
        Reply
      </Button>
      {showReplyForm && (
        <Form.Control
          type="text"
          placeholder="Write a reply..."
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleReplySubmit();
            }
          }}
          className="mt-2"
        />
      )}
      {comment.replies && comment.replies.length > 0 && (
        <ListGroup className="mt-2 ms-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply._id} comment={reply} onReply={onReply} />
          ))}
        </ListGroup>
      )}
    </ListGroup.Item>
  );
};

const TaskComments = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/tasks/${taskId}/comments`);
      setComments(res.data.data);
    } catch (err) {
      notifyError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) fetchComments();
  }, [taskId]);

  const addComment = async (parentComment = null, text) => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await axiosInstance.post(`/tasks/${taskId}/comments`, {
        comment: text,
        parentComment,
      });
      await fetchComments();
    } catch (err) {
      notifyError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewCommentSubmit = () => {
    addComment(null, newComment);
    setNewComment('');
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h5>Comments</h5>
      <ListGroup>
        {comments.length === 0 && <p>No comments yet</p>}
        {comments.map(comment => (
          <CommentItem key={comment._id} comment={comment} onReply={addComment} />
        ))}
      </ListGroup>

      <Form.Control
        as="textarea"
        rows={3}
        placeholder="Write a comment..."
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        disabled={submitting}
        className="mt-3"
      />
      <Button
        className="mt-2"
        onClick={handleNewCommentSubmit}
        disabled={submitting || !newComment.trim()}
      >
        Post Comment
      </Button>
    </div>
  );
};

export default TaskComments;
