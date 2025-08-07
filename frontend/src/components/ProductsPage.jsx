import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Pencil, Plus } from 'react-bootstrap-icons';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isAdmin,setIsAdmin]=useState(false);

  const token = localStorage.getItem("jwt")
  const user = JSON.parse(localStorage.getItem('user'));
  

  useEffect(() => {
    setIsAdmin(user.role=='ADMIN')
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:8080/product',
          { headers : { Authorization : `Bearer ${token}`}}
        );
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [showModal]);

  const openModal = (product = null) => {
    setSelectedProduct(
      product ?? { name: '', description: '', unit: '', sku: '' }
    );
    setIsNew(!product);
    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setSelectedProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (isNew) {
        await axios.post(
          'http://localhost:8080/product',
          selectedProduct,
          { headers : { Authorization : `Bearer ${token}`}}
        );
      } else {
        await axios.put(
          `http://localhost:8080/product`,
          selectedProduct,
          { headers : { Authorization : `Bearer ${token}`}}
        );
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  if (loading) return <div>Loading products…</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Products</h3>
        {isAdmin && 
          <Button variant="primary" onClick={() => openModal()}>
            <Plus className="me-1" /> Add Product
          </Button>
        }
      </div>

      <Table borderless hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Unit</th>
            <th>SKU</th>
            <th>Created At</th>
            <th>Updated At</th>
            {isAdmin && <th></th>}
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>{p.unit}</td>
              <td>{p.sku}</td>
              <td>{new Date(p.createdAt).toLocaleString()}</td>
              <td>{new Date(p.updatedAt).toLocaleString()}</td>
              {isAdmin && 
              <td className="text-end" style={{ position: 'sticky', right: 0, background: '#fff' }}>
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openModal(p)}
                  >
                    <Pencil />
                  </Button>
                </div>
              </td>}
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isNew ? 'Add Product' : `Edit Product #${selectedProduct?.id}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProduct.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={selectedProduct.description}
                  onChange={e => handleChange('description', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Unit</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProduct.unit}
                  onChange={e => handleChange('unit', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedProduct.sku}
                  onChange={e => handleChange('sku', e.target.value)}
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
            {isNew ? 'Create' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
