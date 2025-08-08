import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Pencil, Plus } from 'react-bootstrap-icons';

// ShipmentsPage Component
export const ShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);
  const [nextStatus, setNextStatus] = useState(null);
  const [newEstimateDate, setNewEstimateDate] = useState('');
  const [formData, setFormData] = useState({
    productId: '',  quantity: '',
    departureDate: '', estimateArrivalDate: '',
    transportMode: '', destination: '', trackingNumber: ''
  });
  // const [error, setError] = useState('');

  const jwt = localStorage.getItem("jwt")

  useEffect(() => {
    const fetch = async () => {
      try {
        const [{ data: shipData }, { data: prodData }] = await Promise.all([
          axios.get('http://localhost:8080/shipment',{ headers : { Authorization : `Bearer ${jwt}` } }),
          axios.get('http://localhost:8080/product',{ headers : { Authorization : `Bearer ${jwt}` } })
        ])
        setShipments(shipData);
        
        setProducts(prodData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [show]);

  const handleCreate = async () => {
    try {
      // const payload = { ...formData, productId: formData.productId };
      // console.log("handle create 1")
      await axios.post('http://localhost:8080/shipment/create', formData,{ headers : { Authorization : `Bearer ${jwt}` } });
      // setShipments(prev => [...prev, created]);
      // console.log("handle create 2")
      setShow(false);
    } catch (e) {
      console.error(e);
    }
  };

  
  const open = shipment => {
    if (shipment) {
      setSelected(shipment);
      setNextStatus('');
    } else {
      setSelected(null);
      setFormData({ productId: '', quantity: '', departureDate: '', estimateArrivalDate: '', transportMode: '', destination: '', trackingNumber: '' });
    }
    setShow(true);
  };


  const validTransitions = current => {
    const today = new Date().toISOString().slice(0,10);
    let options = [];
    switch (current) {
      case 'PLANNED': options = ['IN_TRANSIT', 'CANCELLED']; break;
      case 'IN_TRANSIT': options = ['DELIVERED', 'DELAYED', 'CANCELLED']; break;
      case 'DELAYED': options = ['IN_TRANSIT', 'DELIVERED', 'CANCELLED']; break;
      default: options = [];
    }
    // filter out DELIVERED if departureDate is in future
    return options.filter(st => 
      !(st === 'DELIVERED' && selected && selected.departureDate > today)
    );
  };



  const confirmStatusChange = async () => {
    try {
      const payload = { status: nextStatus , id : selected.id};
      // if from DELAYED to IN_TRANSIT, include new estimate date
      if (selected.status === 'DELAYED' && nextStatus === 'IN_TRANSIT') {
        console.log("inside confirm status chage : "+formData.estimateArrivalDate)
        payload.newEstimateArrivalDate = formData.estimateArrivalDate;
      }
      console.log(payload)
      await axios.post(
        `http://localhost:8080/shipment/change-status`,
        payload,
        { headers : { Authorization : `Bearer ${jwt}` } }
      );
      setShow(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading shipments…</div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Shipments</h3>
        <Button variant="primary" onClick={() => open(null)}>
          <Plus className="me-1" /> Create Shipment
        </Button>
      </div>

      <Table borderless hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ref Code</th>
            <th>Quantity</th>
            <th>Departure</th>
            <th>Est. Arrival</th>
            <th>Actual Arrival</th>
            <th>Status</th>
            <th>Mode</th>
            <th>Destination</th>
            <th>Tracking #</th>
            <th>Created At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {shipments.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.referenceCode}</td>
              <td>{s.quantity} {s.productDto.unit}</td>
              <td>{new Date(s.departureDate).toLocaleDateString()}</td>
              <td>{new Date(s.estimateArrivalDate).toLocaleDateString()}</td>
              <td>{s.actualArrivalDate ? new Date(s.actualArrivalDate).toLocaleDateString() : '-'}</td>
              <td>{s.status}</td>
              <td>{s.transportMode}</td>
              <td>{s.destination}</td>
              <td>{s.trackingNumber}</td>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
              <td className="text-center">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => open(s)}
                  disabled={s.status=='DELIVERED' || s.status=='CANCELLED'}>
                  <Pencil />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selected ? `Change Status for #${selected.id}` : 'Create Shipment'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>New Status</Form.Label>
                <Form.Select
                  value={nextStatus}
                  onChange={e => setNextStatus(e.target.value)}
                >
                  <option value="" disabled>Select status…</option>
                  {validTransitions(selected.status).map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {nextStatus === 'IN_TRANSIT' && selected.status === 'DELAYED' && (
                <Form.Group className="mb-3">
                  <Form.Label>New Estimated Arrival</Form.Label>
                  <Form.Control
                    type="date"
                    min={selected.departureDate}
                    value={formData.estimateArrivalDate}
                    onChange={e => setFormData(prev => ({ ...prev, estimateArrivalDate: e.target.value }))}
                  />
                </Form.Group>
              )}
            </Form>
          ) : (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Product</Form.Label>
                <Form.Select
                  value={formData.productId}
                  onChange={e => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                >
                  <option value="" disabled>Select product…</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name || p.sku}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              {/* <Form.Group className="mb-2">
                <Form.Label>Reference Code</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.referenceCode}
                  onChange={e => setFormData(prev => ({ ...prev, referenceCode: e.target.value }))}
                />
              </Form.Group> */}
              <Form.Group className="mb-2">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.quantity}
                  onChange={e => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Departure Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.departureDate}
                  onChange={e => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Estimated Arrival Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.estimateArrivalDate}
                  onChange={e => setFormData(prev => ({ ...prev, estimateArrivalDate: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Transport Mode</Form.Label>
                <Form.Select
                  value={formData.transportMode}
                  onChange={e => setFormData(prev => ({ ...prev, transportMode: e.target.value }))}
                >
                  <option value="" disabled>Select mode…</option>
                  <option value="SEA">SEA</option>
                  <option value="AIR">AIR</option>
                  <option value="TRUCK">TRUCK</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Destination</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.destination}
                  onChange={e => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Tracking Number</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.trackingNumber}
                  onChange={e => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
          {selected ? (
            <Button
              variant="primary"
              onClick={confirmStatusChange}
              disabled={!nextStatus || (selected.status === 'DELAYED' && nextStatus === 'IN_TRANSIT' && !formData.estimateArrivalDate)}
            >Confirm</Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={ (formData.estimateArrivalDate < formData.departureDate) || !formData.productId || !formData.transportMode|| !formData.estimateArrivalDate|| !formData.destination|| !formData.departureDate || !formData.trackingNumber|| !formData.quantity }
            >Create</Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};
