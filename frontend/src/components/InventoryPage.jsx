import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Pencil } from 'react-bootstrap-icons';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("jwt")
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://localhost:8080/inventory',
          { headers : { Authorization : `Bearer ${token}`}}
        );
        setInventory(response.data);
      } catch (err) {
        console.error('Error fetching inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [showModal]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // send update to backend
      await axios.put(`http://localhost:8080/inventory`, selectedItem,
        { headers : { Authorization : `Bearer ${token}`}}
      );
      // update local state
      setShowModal(false);
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleChange = (field, value) => {
    setSelectedItem((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div>Loading inventory…</div>;

  return (
    <div className="p-4">
      <h3>Inventory</h3>
      <Table borderless hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Quantity (Unit)</th>
            <th>Reorder Threshold</th>
            <th>Last Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.productDto.name || item.productDto.sku}</td>
              <td>
                {item.quantity} {item.productDto.unit}
              </td>
              <td>{item.reorderThreshold}</td>
              <td>{new Date(item.lastUpdated).toLocaleString()}</td>
              <td className="text-end" style={{ position: 'sticky', right: 0, background: '#fff' }}>
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEditClick(item)}>
                    <Pencil />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Inventory Item #{selectedItem?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Quantity ({selectedItem.productDto.unit})</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedItem.quantity}
                  onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Reorder Threshold</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedItem.reorderThreshold}
                  onChange={(e) => handleChange('reorderThreshold', parseFloat(e.target.value))}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
