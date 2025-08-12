// src/pages/tasks/TaskComments.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Spinner,
  Modal,
  Badge as RB_Badge,
} from 'react-bootstrap';
import axiosInstance from '../../Api/axiosInstance';
import { notifyError, notifySuccess } from '../../utils/notifications';

const STATUS_OPTS = [
  { value: '', label: 'No status change' },
  { value: 'pending', label: 'Mark as Pending' },
  { value: 'ongoing', label: 'Mark as Ongoing' },
  { value: 'completed', label: 'Mark as Completed' },
];

const isImage = (url = '') => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);

const ChatBubble = ({ me, children }) => (
  <div
    className={`p-3 rounded-3 ${me ? 'ms-auto text-white' : 'me-auto'} shadow-sm`}
    style={{
      maxWidth: '85%',
      background: me ? '#1a2752' : '#f1f3f5',
      borderTopLeftRadius: me ? 12 : 4,
      borderTopRightRadius: me ? 4 : 12,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    }}
  >
    {children}
  </div>
);

/** ---------- Upload helper ---------- */
async function uploadFilesToTask(taskId, files) {
  if (!taskId || !files?.length) return [];
  const fd = new FormData();
  for (const f of files) fd.append('attachments', f);
  fd.append('taskId', taskId);

  const { data } = await axiosInstance.post('/tasks/upload-attachments', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // Accept multiple response shapes
  const urls =
    data?.uploadedUrls ||
    data?.data?.attachments ||
    data?.attachments ||
    [];

  return Array.isArray(urls) ? urls : [];
}

/** ---------- Thumbnails with View buttons ---------- */
const AttachmentThumbs = ({ urls = [], onPreview }) => {
  if (!urls?.length) return null;

  return (
    <div className="d-flex flex-wrap gap-2 mt-2">
      {urls.map((u, idx) => {
        const fileName = u.split('/').pop();
        if (isImage(u)) {
          return (
            <div
              key={u}
              style={{
                position: 'relative',
                width: 160,
                height: 100,
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid #e5e5e5',
                background: '#f8f9fa',
              }}
              title={fileName}
            >
              <img
                src={u}
                alt={fileName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onClick={() => onPreview?.(idx)}
              />
              <Button
                size="sm"
                variant="dark"
                style={{
                  position: 'absolute',
                  right: 6,
                  bottom: 6,
                  opacity: 0.9,
                }}
                onClick={() => onPreview?.(idx)}
                title="View"
              >
                View
              </Button>
            </div>
          );
        }
        // Non-image: show a simple file tile with open link
        return (
          <a
            key={u}
            href={u}
            target="_blank"
            rel="noreferrer"
            className="text-decoration-none"
            title={fileName}
            style={{ width: 160 }}
          >
            <div
              className="p-2 border rounded text-truncate d-flex align-items-center justify-content-center"
              style={{ width: '100%', height: 100, background: '#f8f9fa' }}
            >
              📎 {fileName}
            </div>
          </a>
        );
      })}
    </div>
  );
};

/** ---------- Single comment node ---------- */
const CommentNode = ({
  comment,
  taskId,
  currentUserId,
  onReply,
  onOpenPreview, // (urls, startIndex)
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [replyUploading, setReplyUploading] = useState(false);
  const [replyUploadedUrls, setReplyUploadedUrls] = useState([]);
  const [replyStatus, setReplyStatus] = useState('');
  const [showAtt, setShowAtt] = useState(false);

  const me =
    String(comment.user?._id || comment.user) === String(currentUserId);

  const doUpload = async () => {
    try {
      setReplyUploading(true);
      const urls = await uploadFilesToTask(taskId, replyFiles);
      setReplyUploadedUrls(urls);
      setReplyFiles([]);
      notifySuccess('Attachments uploaded');
    } catch (e) {
      notifyError(e?.response?.data?.message || 'Upload failed');
    } finally {
      setReplyUploading(false);
    }
  };

  const submitReply = async () => {
    const text = replyText.trim();
    if (!text && !replyStatus && replyUploadedUrls.length === 0) return;
    await onReply(
      comment._id,
      text,
      replyUploadedUrls,
      replyStatus || null
    );
    setReplyText('');
    setReplyStatus('');
    setReplyUploadedUrls([]);
    setShowReply(false);
  };

  return (
    <div className="mb-3">
      <ChatBubble me={me}>
        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-1">
          <strong>{comment.user?.name || 'User'}</strong>
          <small className="text-muted">
            {new Date(comment.createdAt).toLocaleString()}
          </small>
          {comment.statusChange && (
            <RB_Badge
              bg={
                comment.statusChange === 'completed'
                  ? 'success'
                  : comment.statusChange === 'ongoing'
                  ? 'warning'
                  : 'secondary'
              }
              className="text-uppercase"
            >
              {comment.statusChange}
            </RB_Badge>
          )}
        </div>

        {/* Body */}
        {comment.comment && (
          <div style={{ whiteSpace: 'pre-wrap' }}>{comment.comment}</div>
        )}

        {/* Attachments toggle */}
        {comment.attachments?.length > 0 && (
          <div className="mt-2">
            <Button
              size="sm"
              variant={me ? 'light' : 'outline-secondary'}
              onClick={() => setShowAtt((s) => !s)}
            >
              {showAtt ? 'Hide' : 'Attachments'} ({comment.attachments.length})
            </Button>
            {showAtt && (
              <AttachmentThumbs
                urls={comment.attachments}
                onPreview={(startIdx) =>
                  onOpenPreview?.(comment.attachments, startIdx)
                }
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-2">
          <Button
            variant={me ? 'light' : 'outline-primary'}
            size="sm"
            onClick={() => setShowReply((s) => !s)}
          >
            {showReply ? 'Cancel' : 'Reply'}
          </Button>
        </div>

        {/* Reply composer */}
        {showReply && (
          <div className="mt-3">
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Write a reply… (Enter to send, Shift+Enter for newline)"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitReply();
                }
              }}
              className="mb-2"
            />

            <div className="d-flex flex-wrap align-items-center gap-2">
              <Form.Select
                size="sm"
                value={replyStatus}
                onChange={(e) => setReplyStatus(e.target.value)}
                style={{ maxWidth: 220 }}
              >
                {STATUS_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>

              <Form.Label className="mb-0">
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) =>
                    setReplyFiles(Array.from(e.target.files || []))
                  }
                  hidden
                />
                <span className="btn btn-sm btn-outline-secondary">
                  Choose files
                </span>
              </Form.Label>

              <Button
                size="sm"
                variant="outline-success"
                disabled={replyUploading || replyFiles.length === 0}
                onClick={doUpload}
              >
                {replyUploading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Uploading…
                  </>
                ) : (
                  <>Upload Files</>
                )}
              </Button>

              {replyUploadedUrls.length > 0 && (
                <RB_Badge bg="success" className="ms-1">
                  Attachments Ready ({replyUploadedUrls.length})
                </RB_Badge>
              )}

              <Button size="sm" onClick={submitReply} className="ms-auto">
                Send
              </Button>
            </div>

            {/* Preview newly uploaded images in the reply area */}
            {replyUploadedUrls.length > 0 && (
              <AttachmentThumbs
                urls={replyUploadedUrls}
                onPreview={(startIdx) =>
                  onOpenPreview?.(replyUploadedUrls, startIdx)
                }
              />
            )}
          </div>
        )}
      </ChatBubble>

      {/* children */}
      {comment.replies?.length > 0 && (
        <div className="mt-2 ms-4">
          {comment.replies.map((r) => (
            <CommentNode
              key={r._id}
              comment={r}
              taskId={taskId}
              currentUserId={currentUserId}
              onReply={onReply}
              onOpenPreview={onOpenPreview}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/** ---------- Root TaskComments ---------- */
const TaskComments = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // composer state
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [sending, setSending] = useState(false);

  // image preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw)?._id : null;
    } catch {
      return null;
    }
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/tasks/${taskId}/comments`);
      setComments(res.data?.data || []);
    } catch {
      notifyError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) load();
  }, [taskId]);

  const handleUpload = async () => {
    try {
      setUploading(true);
      const urls = await uploadFilesToTask(taskId, files);
      setUploadedUrls(urls);
      setFiles([]);
      notifySuccess('Attachments uploaded');
    } catch (e) {
      notifyError(e?.response?.data?.message || 'Failed to upload attachments');
    } finally {
      setUploading(false);
    }
  };

  const postComment = async ({
    parentComment = null,
    body,
    urls = [],
    statusChange = null,
  }) => {
    await axiosInstance.post(`/tasks/${taskId}/comments`, {
      comment: body,
      parentComment,
      attachments: urls,     // ensure backend stores this array
      statusChange,          // ensure backend supports statusChange in comment or also updates task status server-side
    });
  };

  const send = async () => {
    const body = text.trim();
    if (!body && !status && uploadedUrls.length === 0) return;
    setSending(true);
    try {
      await postComment({
        body,
        urls: uploadedUrls,
        statusChange: status || null,
      });
      setText('');
      setStatus('');
      setUploadedUrls([]);
      notifySuccess('Comment posted');
      await load();
    } catch (e) {
      notifyError(e?.response?.data?.message || 'Failed to post comment');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (
    parentId,
    replyText,
    replyUrls = [],
    statusChange = null
  ) => {
    try {
      await postComment({
        parentComment: parentId,
        body: replyText,
        urls: replyUrls,
        statusChange,
      });
      await load();
    } catch {
      notifyError('Failed to post reply');
    }
  };

  const openPreview = (urls, startIndex = 0) => {
    const onlyImages = urls.filter(isImage);
    const mapIndexToImages = onlyImages.length ? onlyImages : urls; // fallback if filter removed all due to query params
    setPreviewUrls(mapIndexToImages);
    setPreviewIndex(Math.min(startIndex, mapIndexToImages.length - 1));
    setPreviewOpen(true);
  };

  const closePreview = () => setPreviewOpen(false);
  const prevImg = () =>
    setPreviewIndex((i) =>
      i === 0 ? previewUrls.length - 1 : i - 1
    );
  const nextImg = () =>
    setPreviewIndex((i) =>
      i === previewUrls.length - 1 ? 0 : i + 1
    );

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h5 className="mb-3">Discussion</h5>

      {/* thread */}
      <div className="d-flex flex-column gap-2 mb-3">
        {comments.length === 0 && (
          <p className="text-muted">No messages yet</p>
        )}
        {comments.map((c) => (
          <CommentNode
            key={c._id}
            comment={c}
            taskId={taskId}
            currentUserId={currentUserId}
            onReply={handleReply}
            onOpenPreview={openPreview}
          />
        ))}
      </div>

      {/* composer */}
      <div className="p-3 border rounded-3 bg-light">
        <Form.Control
          as="textarea"
          rows={2}
          placeholder="Write a message… (Enter to send, Shift+Enter for newline)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={sending}
          className="mb-2"
        />

        <div className="d-flex flex-wrap align-items-center gap-2">
          <Form.Select
            size="sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ maxWidth: 240 }}
            disabled={sending}
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Form.Select>

          <Form.Label className="mb-0">
            <Form.Control
              type="file"
              multiple
              onChange={(e) => {
                const fs = Array.from(e.target.files || []);
                setFiles(fs);
              }}
              hidden
              disabled={sending}
            />
            <span className="btn btn-sm btn-outline-secondary">
              Choose files
            </span>
          </Form.Label>

          <Button
            size="sm"
            variant="outline-success"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Uploading…
              </>
            ) : (
              <>Upload Files</>
            )}
          </Button>

          {/* Visible after successful upload */}
          {uploadedUrls.length > 0 && (
            <Button
              size="sm"
              variant="success"
              onClick={() => openPreview(uploadedUrls, 0)}
              title="View uploaded images"
            >
              Attachments Ready ({uploadedUrls.length})
            </Button>
          )}

          <Button
            className="ms-auto"
            onClick={send}
            disabled={sending}
            title="Send message"
          >
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </div>

        {/* Thumbs for uploaded files (click to View) */}
        {uploadedUrls.length > 0 && (
          <AttachmentThumbs
            urls={uploadedUrls}
            onPreview={(startIdx) => openPreview(uploadedUrls, startIdx)}
          />
        )}
      </div>

      {/* ---------- Image Preview Modal ---------- */}
      <Modal show={previewOpen} onHide={closePreview} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {previewUrls[previewIndex]
              ? previewUrls[previewIndex].split('/').pop()
              : 'Preview'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewUrls.length === 0 ? (
            <div className="text-muted">No image to preview</div>
          ) : (
            <img
              src={previewUrls[previewIndex]}
              alt="preview"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: 8,
              }}
            />
          )}
        </Modal.Body>
        {previewUrls.length > 1 && (
          <Modal.Footer className="d-flex justify-content-between">
            <Button variant="secondary" onClick={prevImg}>‹ Prev</Button>
            <div className="text-muted small">
              {previewIndex + 1} / {previewUrls.length}
            </div>
            <Button variant="secondary" onClick={nextImg}>Next ›</Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default TaskComments;
