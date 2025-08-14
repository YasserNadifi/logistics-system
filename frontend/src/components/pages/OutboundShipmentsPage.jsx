// OutboundShipmentsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Search,
  Plus,
  Eye,
  Truck,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plane,
  Ship,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import GenericDropdown from '../customElements/GenericDropdown';

/* -------------------------
  Shared Modal (same as inbound)
   - scroll lock, portal, padded
--------------------------*/
const Modal = ({ isOpen, onClose, title, children, size = 'lg', backdrop = 'blur' }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'w-full h-full'
  };
  const overlayVariants = {
    blur: 'bg-white/30 backdrop-blur-sm',
    dark: 'bg-black/40',
    transparent: 'bg-transparent'
  };
  const overlayClass = `fixed inset-0 z-50 flex items-center justify-center p-6 ${overlayVariants[backdrop] || overlayVariants.blur}`;
  const panelClass = `bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.lg} max-h-[80vh] overflow-y-auto`;

  const modal = (
    <div className={overlayClass} onClick={onClose} aria-modal="true" role="dialog">
      <div className={panelClass} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-8 py-6 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-gray-600 ml-4 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-8 py-6 sm:px-10 sm:py-8">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

/* -------------------------
  ProductDropdown (searchable)
  Accepts `products` array: { id, name, sku, unit, ... }
  value -> productId
--------------------------*/
const ProductDropdown = ({ value, onChange, products = [], placeholder = 'Select Product' }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  const selected = products.find(p => String(p.id) === String(value));
  const filtered = products.filter(p => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (p.name || '').toLowerCase().includes(s) || (p.sku || '').toLowerCase().includes(s);
  });

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) {
        setOpen(false);
        setQ('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => setHighlight(0), [q, open]);

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[highlight];
      if (item) {
        onChange(String(item.id));
        setOpen(false);
        setQ('');
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQ('');
    }
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onKeyDown={onKeyDown}
        className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg bg-white hover:shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">{selected ? selected.name : placeholder}</span>
          <span className="text-xs text-gray-500 truncate">{selected ? selected.sku : 'SKU'}</span>
        </div>

        <div className="flex items-center space-x-3">
          <svg className={`h-4 w-4 text-gray-400 transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg bg-white shadow-lg border border-gray-100">
          <div className="px-3 py-2">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search by name or SKU..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <ul role="listbox" tabIndex={-1} className="max-h-56 overflow-auto divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">No results</li>
            ) : filtered.map((p, idx) => {
              const isHighlighted = idx === highlight;
              return (
                <li
                  key={p.id}
                  role="option"
                  aria-selected={String(p.id) === String(value)}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => { onChange(String(p.id)); setOpen(false); setQ(''); }}
                  className={`cursor-pointer px-4 py-3 flex items-center justify-between ${isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">{p.name}</span>
                    <span className="text-xs text-gray-500 truncate">{p.sku}</span>
                  </div>
                  <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {p.unit || ''}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

/* -------------------------
  CreateShipmentForm (OUTBOUND)
  - productId + customerName
--------------------------*/
const CreateShipmentFormOutbound = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    direction: 'OUTBOUND',
    transportMode: 'TRUCK',
    quantity: '',
    productId: '',
    customerName: '',
    departureDate: '',
    estimateArrivalDate: '',
    trackingNumber: ''
  });

  const [products, setProducts] = useState([]);
  const [productInventory, setProductInventory] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/product`, { headers: { Authorization: `Bearer ${token}` } });
        setProducts(res.data || []);
        const invRes = await axios.get(`${import.meta.env.VITE_API_URL}/product-inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductInventory(invRes.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetch();
  }, []);

  const transportModes = ['TRUCK', 'SEA', 'AIR'];

  const handleSubmit = () => {
    const submitData = {
      direction: 'OUTBOUND',
      transportMode: formData.transportMode,
      quantity: parseFloat(formData.quantity),
      productId: formData.productId ? parseInt(formData.productId) : null,
      customerName: formData.customerName || null,
      rawMaterialId: null,
      supplierId: null,
      departureDate: formData.departureDate || null,
      estimateArrivalDate: formData.estimateArrivalDate || null,
      trackingNumber: formData.trackingNumber || null
    };
    onSubmit(submitData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
          <select
            value={formData.transportMode}
            onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {transportModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter quantity"
            required
          />
        </div>
      </div>

<GenericDropdown
  value={formData.productId}
  onChange={(id) => setFormData({ ...formData, productId: id })}
  options={productInventory}   // pass the inventory array you showed
  placeholder="Select Product (shows qty)"
/>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
        <input
          type="text"
          value={formData.customerName}
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter customer name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
          <input type="date" value={formData.departureDate} onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Arrival Date</label>
          <input type="date" value={formData.estimateArrivalDate} onChange={(e) => setFormData({ ...formData, estimateArrivalDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
        <input type="text" value={formData.trackingNumber} onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter tracking number" />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Create Shipment</span>
        </button>
      </div>
    </div>
  );
};

/* -------------------------
  ShipmentDetailsModal (OUTBOUND)
  - shows product + customer
--------------------------*/
const ShipmentDetailsModalOutbound = ({ shipment }) => {
  const formatDate = (s) => (!s ? 'Not set' : new Date(s).toLocaleDateString());
  const formatDateTime = (s) => (!s ? 'Not set' : (new Date(s).toLocaleDateString() + ' ' + new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })));

  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'TRUCK': return <Truck className="h-4 w-4" />;
      case 'AIR': return <Plane className="h-4 w-4" />;
      case 'SEA': return <Ship className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PLANNED: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
      IN_TRANSIT: { color: 'bg-yellow-100 text-yellow-800', icon: <Truck className="h-3 w-3" /> },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      DELAYED: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> }
    };
    const cfg = statusConfig[status] || statusConfig.PLANNED;
    return (<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.icon}<span className="ml-1">{status}</span></span>);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Shipment Information</h4>
          <div className="space-y-3">
            <div><p className="text-sm text-gray-500">Shipment ID</p><p className="font-medium text-gray-900">#{shipment.id}</p></div>
            <div><p className="text-sm text-gray-500">Reference Code</p><p className="font-medium text-gray-900">{shipment.referenceCode}</p></div>
            <div><p className="text-sm text-gray-500">Status</p><div className="mt-1">{getStatusBadge(shipment.status)}</div></div>
            <div><p className="text-sm text-gray-500">Transport Mode</p><p className="font-medium text-gray-900 flex items-center">{getTransportIcon(shipment.transportMode)}<span className="ml-2">{shipment.transportMode}</span></p></div>
            <div><p className="text-sm text-gray-500">Quantity</p><p className="font-medium text-gray-900">{shipment.quantity}</p></div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Product & Customer</h4>
          <div className="space-y-3">
            <div><p className="text-sm text-gray-500">Product</p><p className="font-medium text-gray-900">{shipment.productDto?.name || 'N/A'}</p></div>
            <div><p className="text-sm text-gray-500">SKU</p><p className="font-medium text-gray-900">{shipment.productDto?.sku || 'N/A'}</p></div>
            <div><p className="text-sm text-gray-500">Customer</p><p className="font-medium text-gray-900">{shipment.customerName || 'N/A'}</p></div>
            <div><p className="text-sm text-gray-500">Tracking Number</p><p className="font-medium text-gray-900">{shipment.trackingNumber || 'Not provided'}</p></div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Timeline</h4>
        <div className="grid grid-cols-3 gap-4">
          <div><p className="text-sm text-gray-500">Departure Date</p><p className="font-medium text-gray-900 flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400" />{formatDate(shipment.departureDate)}</p></div>
          <div><p className="text-sm text-gray-500">Estimated Arrival</p><p className="font-medium text-gray-900 flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400" />{formatDate(shipment.estimateArrivalDate)}</p></div>
          <div><p className="text-sm text-gray-500">Actual Arrival</p><p className="font-medium text-gray-900 flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400" />{formatDate(shipment.actualArrivalDate)}</p></div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Record Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-sm text-gray-500">Created At</p><p className="font-medium text-gray-900">{formatDateTime(shipment.createdAt)}</p></div>
          <div><p className="text-sm text-gray-500">Last Updated</p><p className="font-medium text-gray-900">{formatDateTime(shipment.updatedAt)}</p></div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------
  OutboundShipmentsPage (main)
--------------------------*/
const OutboundShipmentsPage = ({ userRole = 'ADMIN' }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwt');

  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [transportFilterOpen, setTransportFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState({});
  const [transportFilters, setTransportFilters] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const getShipments = async () => {
      try {
        const res = await axios.get(`${API_URL}/shipments/outbound`, { headers: { Authorization: `Bearer ${token}` } });
        setShipments(res.data || []);
      } catch (err) {
        console.error('Error fetching outbound shipments:', err);
      }
    };
    getShipments();
  }, [showCreateModal]);

  const getAllowedStatusTransitions = (currentStatus) => {
    const transitions = {
      PLANNED: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['DELIVERED', 'DELAYED', 'CANCELLED'],
      DELAYED: ['IN_TRANSIT', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: []
    };
    return transitions[currentStatus] || [];
  };

  const handleCreateShipment = async (data) => {
    try {
      await axios.post(`${API_URL}/shipments`, data, { headers: { Authorization: `Bearer ${token}` } });
      const res = await axios.get(`${API_URL}/shipments/outbound`, { headers: { Authorization: `Bearer ${token}` } });
      setShipments(res.data || []);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating outbound shipment:', err);
    }
  };

  const handleStatusChange = async () => {
    try {
      await axios.put(`${API_URL}/shipments/change-status`, { shipmentId: selectedShipment.id, targetStatus }, { headers: { Authorization: `Bearer ${token}` } });
      const res = await axios.get(`${API_URL}/shipments/outbound`, { headers: { Authorization: `Bearer ${token}` } });
      setShipments(res.data || []);
      setShowStatusModal(false);
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const openStatusModal = (shipment, newStatus) => {
    setSelectedShipment(shipment);
    setTargetStatus(newStatus);
    setShowStatusModal(true);
  };

  const openViewModal = (shipment) => {
    setSelectedShipment(shipment);
    setShowViewModal(true);
  };

  // filter + sort
  const filteredShipments = shipments
    .filter(s => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q || (
        s.referenceCode?.toLowerCase().includes(q) ||
        s.productDto?.name?.toLowerCase().includes(q) ||
        s.customerName?.toLowerCase().includes(q) ||
        s.trackingNumber?.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      );
      const matchesStatus = !Object.values(statusFilters).some(v => v) || statusFilters[s.status];
      const matchesTransport = !Object.values(transportFilters).some(v => v) || transportFilters[s.transportMode];
      return matchesSearch && matchesStatus && matchesTransport;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue === undefined || bValue === undefined) return 0;
      if (sortDirection === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PLANNED: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
      IN_TRANSIT: { color: 'bg-yellow-100 text-yellow-800', icon: <Truck className="h-3 w-3" /> },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      DELAYED: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> }
    };
    const cfg = statusConfig[status] || statusConfig.PLANNED;
    return (<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.icon}<span className="ml-1">{status}</span></span>);
  };

  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'TRUCK': return <Truck className="h-4 w-4 text-gray-400" />;
      case 'AIR': return <Plane className="h-4 w-4 text-gray-400" />;
      case 'SEA': return <Ship className="h-4 w-4 text-gray-400" />;
      default: return <Truck className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (d) => (!d ? 'Not set' : new Date(d).toLocaleDateString());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outbound Shipments</h1>
          <p className="text-gray-600 mt-1">Manage outgoing product shipments</p>
        </div>
        {userRole === 'ADMIN' && (
          <button onClick={() => setShowCreateModal(true)} className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Shipment</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input type="text" placeholder="Search by reference, product, customer, tracking..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div className="relative">
            <button onClick={() => setStatusFilterOpen(!statusFilterOpen)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between">
              <span className="text-gray-700">{Object.keys(statusFilters).some(k => statusFilters[k]) ? `Status (${Object.values(statusFilters).filter(v => v).length})` : 'Filter by Status'}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {statusFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Filter by Status</p>
                  <div className="space-y-2">
                    {['PLANNED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED'].map(status => (
                      <label key={status} className="flex items-center">
                        <input type="checkbox" checked={statusFilters[status] || false} onChange={(e) => setStatusFilters({ ...statusFilters, [status]: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">{status.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setTransportFilterOpen(!transportFilterOpen)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between">
              <span className="text-gray-700">{Object.keys(transportFilters).some(k => transportFilters[k]) ? `Transport (${Object.values(transportFilters).filter(v => v).length})` : 'Filter by Transport'}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            {transportFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Filter by Transport Mode</p>
                  <div className="space-y-2">
                    {['TRUCK', 'SEA', 'AIR'].map(mode => (
                      <label key={mode} className="flex items-center">
                        <input type="checkbox" checked={transportFilters[mode] || false} onChange={(e) => setTransportFilters({ ...transportFilters, [mode]: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-700">{mode}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => { setSortField('id'); setSortDirection(sortField === 'id' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => { setSortField('referenceCode'); setSortDirection(sortField === 'referenceCode' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                  Reference {sortField === 'referenceCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product & Customer</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => { setSortField('quantity'); setSortDirection(sortField === 'quantity' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                  Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedShipments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No shipments found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedShipments.map(shipment => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{shipment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{shipment.referenceCode}</div></td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(shipment.status)}
                        {getAllowedStatusTransitions(shipment.status).length > 0 && (
                          <div className="relative">
                            <select onChange={(e) => {
                              if (e.target.value) {
                                openStatusModal(shipment, e.target.value);
                                e.target.value = '';
                              }
                            }} className="text-xs bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-gray-600 hover:bg-gray-100 w-full max-w-[80px]">
                              <option value="">Change</option>
                              {getAllowedStatusTransitions(shipment.status).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="flex-shrink-0 align-middle">{getTransportIcon(shipment.transportMode)}</span>
                        <span className="ml-2 align-middle leading-5">{shipment.transportMode}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{shipment.productDto?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{shipment.customerName || 'N/A'}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.quantity}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0 align-middle" />
                        <span className="align-middle leading-5">{formatDate(shipment.departureDate)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.status === 'DELIVERED' ? (
                        <div className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-2" /><span>{formatDate(shipment.actualArrivalDate)}</span></div>
                      ) : shipment.status === 'CANCELLED' ? (
                        <span className="text-gray-400">--</span>
                      ) : (
                        <div className="flex items-center text-blue-600"><Clock className="h-4 w-4 mr-2" /><span>Est. {formatDate(shipment.estimateArrivalDate)}</span></div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openViewModal(shipment)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" title="View Details"><Eye className="h-4 w-4" /></button>
                      {/* Note: no edit or delete buttons for outbound - shipments are immutable except status */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div><p className="text-sm text-gray-700">Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredShipments.length)}</span> of <span className="font-medium">{filteredShipments.length}</span> results</p></div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="h-5 w-5" /></button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i+1} onClick={() => setCurrentPage(i+1)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i+1 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>{i+1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="h-5 w-5" /></button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Shipment Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Outbound Shipment" size="lg">
        <CreateShipmentFormOutbound onSubmit={handleCreateShipment} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {/* View Shipment Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Shipment Details" size="xl">
        {selectedShipment && <ShipmentDetailsModalOutbound shipment={selectedShipment} />}
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Confirm Status Change" size="md">
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to change the status of shipment <span className="font-semibold">#{selectedShipment?.referenceCode}</span> from <span className="font-semibold">{selectedShipment?.status}</span> to <span className="font-semibold">{targetStatus}</span>?
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={() => { handleStatusChange(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Confirm</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OutboundShipmentsPage;
