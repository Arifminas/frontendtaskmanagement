// src/components/AttachmentModal.jsx
import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';

const AttachmentModal = ({ show, onHide, attachments }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Task Attachments</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {attachments && attachments.length > 0 ? (
          <ListGroup>
            {attachments.map((fileUrl, idx) => (
              <ListGroup.Item key={idx}>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  {fileUrl.split('/').pop()}
                </a>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p>No attachments available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AttachmentModal;
