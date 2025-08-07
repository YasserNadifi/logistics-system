import React, { useEffect, useState } from 'react';
import {
  Table, Button, Container, Row, Col, Spinner,
  Modal, Form
} from 'react-bootstrap';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import axios from 'axios';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', email: '', role: 'LOGISTICS' });
  const [addErrors, setAddErrors] = useState({});
  const [addValidated, setAddValidated] = useState(false);

  // Edit User Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editValidated, setEditValidated] = useState(false);

  // Change Password Modal state
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeErrors, setChangeErrors] = useState({});
  const [changeValidated, setChangeValidated] = useState(false);

  // Delete Confirmation Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const token = localStorage.getItem('jwt');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('http://localhost:8080/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [showAddModal, showEditModal, showChangeModal, showDeleteModal]);

  // Add User handlers
  const openAdd = () => { setShowAddModal(true); setAddValidated(false); };
  const closeAdd = () => {
    setShowAddModal(false);
    setNewUser({ username: '', password: '', fullName: '', email: '', role: 'LOGISTICS' });
    setAddErrors({});
  };
  const handleAddSubmit = async e => {
    e.preventDefault();
    setAddValidated(true);
    const errs = {};
    if (!newUser.username) errs.username = 'Username required';
    if (!newUser.password) errs.password = 'Password required';
    if (!newUser.fullName) errs.fullName = 'Full Name required';
    if (!newUser.email) errs.email = 'Email required';
    if (!newUser.role) errs.role = 'Role required';
    setAddErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await axios.post('http://localhost:8080/register', newUser, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      closeAdd();
    } catch (err) {
      if (err.response?.status === 409) {
        setAddErrors({ username: 'Username already taken' });
      } else console.error('Add user failed:', err);
    }
  };

  // Edit User handlers
  const openEdit = user => {
    setEditUser({ ...user });
    setShowEditModal(true);
    setEditValidated(false);
    setEditErrors({});
  };
  const closeEdit = () => {
    setShowEditModal(false);
    setEditUser(null);
    setEditErrors({});
  };
  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditValidated(true);
    const errs = {};
    if (!editUser.username) errs.username = 'Username required';
    if (!editUser.fullName) errs.fullName = 'Full Name required';
    if (!editUser.email) errs.email = 'Email required';
    if (!editUser.role) errs.role = 'Role required';
    setEditErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await axios.put(
        `http://localhost:8080/user`,
        editUser,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      closeEdit();
    } catch (err) {
      console.error('Edit user failed:', err);
    }
  };

  // Change Password handlers
  const openChange = user => {
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
  const handleChangeSubmit = async e => {
    e.preventDefault();
    setChangeValidated(true);
    const errs = {};
    if (!newPassword) errs.newPassword = 'Password required';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords must match';
    setChangeErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await axios.post(
        "http://localhost:8080/user/changepassword",
        { newPassword: newPassword , username : selectedUser.username },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      closeChange();
    } catch (err) {
      console.error('Change password failed:', err);
    }
  };

  // Delete handlers
  const openDelete = user => { setUserToDelete(user); setShowDeleteModal(true); };
  const closeDelete = () => { setShowDeleteModal(false); setUserToDelete(null); };
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/user/${userToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeDelete();
    } catch (err) {
      console.error('Delete user failed:', err);
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
        <Col className="d-flex justify-content-between align-items-center">
          <h2>Users</h2>
          <Button variant="primary" onClick={openAdd}>Add User</Button>
        </Col>
      </Row>
      <Row><Col>
        <Table borderless hover responsive>
          <thead>
            <tr>
              <th>ID</th><th>Username</th><th>Email</th><th>Full Name</th><th>Role</th><th>Created At</th><th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td><td>{u.fullName}</td><td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                
                <td className="text-end" style={{ position: 'sticky', right: 0, background: '#fff' }}>
                    <div className="d-flex justify-content-end gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => openEdit(u)}>
                        <PencilSquare />
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => openDelete(u)}>
                        <Trash />
                      </Button>
                    </div>
                  </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col></Row>

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={closeAdd} centered>
        <Modal.Header closeButton><Modal.Title>Add New User</Modal.Title></Modal.Header>
        <Form noValidate validated={addValidated} onSubmit={handleAddSubmit}>
          <Modal.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          required
                          value={newUser.username}
                          isInvalid={!!addErrors.username}
                          onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                        />
                        <Form.Control.Feedback type="invalid">
                          {addErrors.username}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          required
                          value={newUser.password}
                          isInvalid={!!addErrors.password}
                          onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <Form.Control.Feedback type="invalid">
                          {addErrors.password}
                        </Form.Control.Feedback>
                      </Form.Group>
                                  <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          value={newUser.fullName}
                          isInvalid={!!addErrors.fullName}
                          onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                        />
                        <Form.Control.Feedback type="invalid">
                          {addErrors.fullName}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          required
                          value={newUser.email}
                          isInvalid={!!addErrors.email}
                          onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <Form.Control.Feedback type="invalid">
                          {addErrors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                          required
                          value={newUser.role}
                          isInvalid={!!addErrors.role}
                          onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="LOGISTICS">LOGISTICS</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {addErrors.role}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeAdd}>Cancel</Button>
            <Button variant="primary" type="submit">Create User</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={closeEdit} centered>
        <Modal.Header closeButton><Modal.Title>Edit User : {editUser?.username}</Modal.Title></Modal.Header>
        <Form noValidate validated={editValidated} onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                required
                value={editUser?.username || ''}
                isInvalid={!!editErrors.username}
                onChange={e => setEditUser(prev => ({ ...prev, username: e.target.value }))}
                readOnly
              />
              <Form.Control.Feedback type="invalid">{editErrors.username}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={editUser?.fullName || ''}
                isInvalid={!!editErrors.fullName}
                onChange={e => setEditUser(prev => ({ ...prev, fullName: e.target.value }))}
              />
              <Form.Control.Feedback type="invalid">{editErrors.fullName}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                value={editUser?.email || ''}
                isInvalid={!!editErrors.email}
                onChange={e => setEditUser(prev => ({ ...prev, email: e.target.value }))}
              />
              <Form.Control.Feedback type="invalid">{editErrors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                required
                value={editUser?.role || ''}
                isInvalid={!!editErrors.role}
                onChange={e => setEditUser(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="LOGISTICS">LOGISTICS</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{editErrors.role}</Form.Control.Feedback>
            </Form.Group>
            <Button variant="link" onClick={() => openChange(editUser)}>Change Password</Button>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEdit}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Change Password Modal */}
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
              <Form.Control.Feedback type="invalid">{changeErrors.newPassword}</Form.Control.Feedback>
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
              <Form.Control.Feedback type="invalid">{changeErrors.confirmPassword}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeChange}>Cancel</Button>
            <Button variant="primary" type="submit">Change Password</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeDelete} centered>
        <Modal.Header closeButton><Modal.Title>Delete User</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete {userToDelete?.username}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDelete}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
