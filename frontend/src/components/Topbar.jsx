import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

export const Topbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // state to control the confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    // actually perform logout
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header
        style={{
          width: '100vw',
          background: '#fff',
          borderBottom: '1px solid #ddd',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>MyApp</h2>
        </Link>

        <span style={{ margin: 0, fontSize: '1.25rem' }}>
          Hello {user.fullName}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <button
              onClick={() => setShowConfirm(true)}
              className="btn btn-danger"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to log out?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
