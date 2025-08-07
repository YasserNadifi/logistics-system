import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Spinner, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', email: '', role: 'LOGISTICS'  });
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem('jwt');

  // Change Password Modal state
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeErrors, setChangeErrors] = useState({});
  const [changeValidated, setChangeValidated] = useState(false);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('http://localhost:8080/user',
            { headers : {Authorization : `Bearer ${token}` } }
        );
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [showModal, showChangeModal]);

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setNewUser({ username: '', password: '', firstName: '', lastName: '', role: 'LOGISTICS' });
    setErrors({});
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    // basic validation
    const errs = {};
    if (!newUser.username) errs.username = 'Username is required';
    if (!newUser.password) errs.password = 'Password is required';
    if (!newUser.fullName) errs.fullName = 'Full Name is required';
    if (!newUser.email) errs.email = 'Email is required';
    if (!newUser.role) errs.role = 'Role is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const { data } = await axios.post('http://localhost:8080/register', newUser, {
        headers: { 
          'Content-Type': 'application/json',
        }
      });
      handleClose();
    } catch (err) {
      console.error('Add user failed:', err);
      console.log()
      if(err.status==409){
        console.log(err.status)
        setErrors({ username: 'Username already taken' });
        console.log("errors.username : "+errors.username)
        console.log("errors : "+errors.data)
      }
    }
  };

  // Change Password handlers
  const openChange = (user) => {
    setSelectedUser(user);
    setShowChangeModal(true);
    setChangeValidated(false);
    setNewPassword('');
    setConfirmPassword('');
    setChangeErrors({});
  };
  const closeChange = () => {
    setShowChangeModal(false);
    setSelectedUser(null);
    setChangeErrors({});
  };
  const handleChangeSubmit = async (e) => {
    e.preventDefault();
    setChangeValidated(true);
    const errs = {};
    if (!newPassword) errs.newPassword = 'Password required';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords must match';
    setChangeErrors(errs);
    if (Object.keys(errs).length) return;
    console.log("newPassword : "+newPassword)
    console.log("username : "+selectedUser.username)
    try {
      await axios.post(
        'http://localhost:8080/user/changepassword',
        { newPassword: newPassword , username : selectedUser.username },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      closeChange();
    } catch (err) {
      console.error('Change password failed:', err);
    }
  };



  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col style={{display: 'flex',alignItems: 'center',justifyContent: 'space-between',}}>
            <h2>Users</h2>
          <Button onClick={handleShow} variant="primary">
            Add User
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.fullName}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => openChange(user)}
                    >
                      Change Password
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

    <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                required
                value={newUser.username}
                isInvalid={!!errors.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                required
                value={newUser.password}
                isInvalid={!!errors.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
                        <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={newUser.fullName}
                isInvalid={!!errors.fullName}
                onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fullName}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={newUser.email}
                isInvalid={!!errors.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                required
                value={newUser.role}
                isInvalid={!!errors.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="LOGISTICS">LOGISTICS</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.role}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create User
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

            <Modal show={showChangeModal} onHide={closeChange} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password for {selectedUser?.username}</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={changeValidated} onSubmit={handleChangeSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                required
                value={newPassword}
                isInvalid={!!changeErrors.newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                {changeErrors.newPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                required
                value={confirmPassword}
                isInvalid={!!changeErrors.confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                {changeErrors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeChange}>Cancel</Button>
            <Button variant="primary" type="submit">Change Password</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
}
