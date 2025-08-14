import React, { useState, useEffect } from 'react';

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
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plane,
  Ship,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import RawMaterialDropdown from '../customElements/RawMaterialDropdown';



// Modal Component
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',            // 'md' | 'lg' | 'xl' | '2xl' | 'full'
  backdrop = 'blur'      // 'blur' | 'dark' | 'transparent'
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
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
      <div
        className={panelClass}
        onClick={(e) => e.stopPropagation()}
        // increased padding inside the panel
        style={{
          // nothing required here; padding handled by classes below
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 py-6 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 ml-4 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 sm:px-10 sm:py-8">
          {children}
        </div>

        {/* Footer (optional) - if you want to always have footer spacing, uncomment) */}
        {/* <div className="px-8 py-4 border-t border-gray-100">footer area</div> */}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

// Status Change Confirmation Modal
const StatusChangeModal = ({ isOpen, onClose, shipment, targetStatus, onConfirm }) => {
  const getStatusColor = (status) => {
    const statusColors = {
      PLANNED: 'text-blue-600',
      IN_TRANSIT: 'text-yellow-600',
      DELIVERED: 'text-green-600',
      DELAYED: 'text-red-600',
      CANCELLED: 'text-gray-600'
    };
    return statusColors[status] || 'text-gray-600';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Status Change" size="md">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to change the status of shipment{' '}
          <span className="font-semibold">#{shipment?.referenceCode}</span> from{' '}
          <span className={`font-semibold ${getStatusColor(shipment?.status)}`}>
            {shipment?.status}
          </span>{' '}
          to{' '}
          <span className={`font-semibold ${getStatusColor(targetStatus)}`}>
            {targetStatus}
          </span>?
        </p>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};



// Create Shipment Form
const CreateShipmentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    direction: 'INBOUND',
    transportMode: 'TRUCK',
    quantity: '',
    rawMaterialId: '',
    supplierId: '',
    departureDate: '',
    estimateArrivalDate: '',
    trackingNumber: ''
  });
  const [rawMaterials, setRawMaterials] = useState([]);
  const [rawMaterialsInv, setRawMaterialsInv] = useState([]);

const [suppliers, setSuppliers] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const [rawMaterialsRes, suppliersRes,rawMaterialsInvRes ] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/raw-material`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/suppliers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/raw-material-inventory`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setRawMaterials(rawMaterialsRes.data);
      setSuppliers(suppliersRes.data);
      setRawMaterialsInv(rawMaterialsInvRes.data)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  fetchData();
}, []);

  const transportModes = ['TRUCK', 'SEA', 'AIR'];

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      rawMaterialId: formData.rawMaterialId ? parseInt(formData.rawMaterialId) : null,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
    };
    onSubmit(submitData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
          <select
            value={formData.transportMode}
            onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {transportModes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter quantity"
            required
          />
        </div>
      </div>

<RawMaterialDropdown
  value={formData.rawMaterialId}
  onChange={(id) => setFormData({ ...formData, rawMaterialId: id })}
  options={rawMaterialsInv}
  placeholder="Select Raw Material"
/>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
  <select
    value={formData.supplierId}
    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    required
  >
    <option value="">Select Supplier</option>
    {suppliers.map(supplier => (
      <option key={supplier.id} value={supplier.id}>
        {supplier.supplierName}
      </option>
    ))}
  </select>
</div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
          <input
            type="date"
            value={formData.departureDate}
            onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Arrival Date</label>
          <input
            type="date"
            value={formData.estimateArrivalDate}
            onChange={(e) => setFormData({ ...formData, estimateArrivalDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
        <input
          type="text"
          value={formData.trackingNumber}
          onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter tracking number"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Create Shipment</span>
        </button>
      </div>
    </div>
  );
};

// Shipment Details Modal
const ShipmentDetailsModal = ({ shipment }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
    
    const config = statusConfig[status] || statusConfig.PLANNED;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Shipment Information</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Shipment ID</p>
              <p className="font-medium text-gray-900">#{shipment.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reference Code</p>
              <p className="font-medium text-gray-900">{shipment.referenceCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1">{getStatusBadge(shipment.status)}</div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transport Mode</p>
              <p className="font-medium text-gray-900 flex items-center">
                {getTransportIcon(shipment.transportMode)}
                <span className="ml-2">{shipment.transportMode}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-medium text-gray-900">{shipment.quantity}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Materials & Supplier</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Raw Material</p>
              <p className="font-medium text-gray-900">{shipment.rawMaterialDto.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="font-medium text-gray-900">{shipment.supplierDto.supplierName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="font-medium text-gray-900">{shipment.trackingNumber || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Timeline</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Departure Date</p>
            <p className="font-medium text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {formatDate(shipment.departureDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Arrival</p>
            <p className="font-medium text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {formatDate(shipment.estimateArrivalDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Actual Arrival</p>
            <p className="font-medium text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {formatDate(shipment.actualArrivalDate)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Record Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium text-gray-900">{formatDateTime(shipment.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-medium text-gray-900">{formatDateTime(shipment.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InboundShipmentsPage = ({ userRole = 'ADMIN' }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [transportModeFilter, setTransportModeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
const [transportFilterOpen, setTransportFilterOpen] = useState(false);
const [statusFilters, setStatusFilters] = useState({});
const [transportFilters, setTransportFilters] = useState({});

  const token = localStorage.getItem("jwt");

  // Status transition rules
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

  useEffect(() => {
    const getShipments = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/shipments/inbound`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShipments(response.data);
      } catch (error) {
        console.error('Error fetching shipments:', error);
      }
    };
    getShipments();
  }, [showCreateModal]);

  // Filter and sort shipments
const filteredShipments = shipments
  .filter(shipment => {
    const matchesSearch = 
      shipment.referenceCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.rawMaterialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.id.toString().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !Object.values(statusFilters).some(v => v) || statusFilters[shipment.status];
    const matchesTransportMode = !Object.values(transportFilters).some(v => v) || transportFilters[shipment.transportMode];
    
    return matchesSearch && matchesStatus && matchesTransportMode;
  })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  // Pagination
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateShipment = async (shipmentData) => {
    try {
      await axios.post(
        `${API_URL}/shipments`,
        shipmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh shipments list
      const response = await axios.get(
        `${API_URL}/shipments/inbound`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShipments(response.data);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating shipment:', error);
    }
  };

  const handleStatusChange = async () => {
    try {
        console.log(1);
        console.log(        {
          shipmentId: selectedShipment.id,
          targetStatus: targetStatus
        } );
      await axios.put(
        `${API_URL}/shipments/change-status`,
        {
          shipmentId: selectedShipment.id,
          targetStatus: targetStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(2);
      
      // Refresh shipments list
      const response = await axios.get(
        `${API_URL}/shipments/inbound`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(3);
      setShipments(response.data);
    } catch (error) {
      console.error('Error updating shipment status:', error);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      PLANNED: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
      IN_TRANSIT: { color: 'bg-yellow-100 text-yellow-800', icon: <Truck className="h-3 w-3" /> },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      DELAYED: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> }
    };
    
    const config = statusConfig[status] || statusConfig.PLANNED;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'TRUCK': return <Truck className="h-4 w-4 text-gray-400" />;
      case 'AIR': return <Plane className="h-4 w-4 text-gray-400" />;
      case 'SEA': return <Ship className="h-4 w-4 text-gray-400" />;
      default: return <Truck className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbound Shipments</h1>
          <p className="text-gray-600 mt-1">Manage incoming raw material shipments</p>
        </div>
        {userRole === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Shipment</span>
          </button>
        )}
      </div>

{/* Search and Filters */}
<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
    <div className="md:col-span-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search by reference, material, supplier, tracking..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
    
    <div className="relative">
      <button
        onClick={() => setStatusFilterOpen(!statusFilterOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
      >
        <span className="text-gray-700">
          {Object.keys(statusFilters).some(key => statusFilters[key]) 
            ? `Status (${Object.values(statusFilters).filter(v => v).length})` 
            : 'Filter by Status'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>
      
      {statusFilterOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Filter by Status</p>
            <div className="space-y-2">
              {['PLANNED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED'].map(status => (
                <label key={status} className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={statusFilters[status] || false}
                    onChange={(e) => setStatusFilters({...statusFilters, [status]: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <span className="ml-2 text-sm text-gray-700">{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    
    <div className="relative">
      <button
        onClick={() => setTransportFilterOpen(!transportFilterOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
      >
        <span className="text-gray-700">
          {Object.keys(transportFilters).some(key => transportFilters[key]) 
            ? `Transport (${Object.values(transportFilters).filter(v => v).length})` 
            : 'Filter by Transport'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>
      
      {transportFilterOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Filter by Transport Mode</p>
            <div className="space-y-2">
              {['TRUCK', 'SEA', 'AIR'].map(mode => (
                <label key={mode} className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={transportFilters[mode] || false}
                    onChange={(e) => setTransportFilters({...transportFilters, [mode]: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
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

      {/* Shipments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('id')}
                >
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('referenceCode')}
                >
                  Reference {sortField === 'referenceCode' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transport
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material & Supplier
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Departure
</th>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Arrival Date
</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {/* Actions */}
                </th>
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
                paginatedShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{shipment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{shipment.referenceCode}</div>
                    </td>
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex flex-col space-y-1">
    {getStatusBadge(shipment.status)}
    {getAllowedStatusTransitions(shipment.status).length > 0 && (
      <div className="relative">
        <select
          onChange={(e) => {
            if (e.target.value) {
              openStatusModal(shipment, e.target.value);
              e.target.value = '';
            }
          }}
          className="text-xs bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-gray-600 hover:bg-gray-100 w-full max-w-[80px]"
        >
          <option value="">Change</option>
          {getAllowedStatusTransitions(shipment.status).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
    )}
  </div>
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  <div className="flex items-center">
    <span className="flex-shrink-0 align-middle">
      {getTransportIcon(shipment.transportMode)}
    </span>
    <span className="ml-2 align-middle leading-5">
      {shipment.transportMode}
    </span>
  </div>
</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium text-gray-900">{shipment.rawMaterialDto.name || 'N/A'}</div>
                     <div className="text-sm text-gray-500">{shipment.supplierDto.supplierName || 'N/A'}</div>
                   </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {shipment.quantity}
</td>
{/* Departure */}
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  <div className="flex items-center">
    <Calendar className="h-4 w-4 mr-2 flex-shrink-0 align-middle" />
    <span className="align-middle leading-5">{formatDate(shipment.departureDate)}</span>
  </div>
</td>

{/* Arrival (uses same structure for all variants) */}
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {shipment.status === 'DELIVERED' ? (
    <div className="flex items-center text-green-600">
      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 align-middle" />
      <span className="align-middle leading-5">{formatDate(shipment.actualArrivalDate)}</span>
    </div>
  ) : shipment.status === 'CANCELLED' ? (
    <span className="text-gray-400">--</span>
  ) : (
    <div className="flex items-center text-blue-600">
      <Clock className="h-4 w-4 mr-2 flex-shrink-0 align-middle" />
      <span className="align-middle leading-5">Est. {formatDate(shipment.estimateArrivalDate)}</span>
    </div>
  )}
</td>


                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <button 
                       onClick={() => openViewModal(shipment)}
                       className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                       title="View Details"
                     >
                       <Eye className="h-4 w-4" />
                     </button>
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
             <button
               onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
               disabled={currentPage === 1}
               className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
             >
               Previous
             </button>
             <button
               onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
               disabled={currentPage === totalPages}
               className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
             >
               Next
             </button>
           </div>
           <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
             <div>
               <p className="text-sm text-gray-700">
                 Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                 <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredShipments.length)}</span> of{' '}
                 <span className="font-medium">{filteredShipments.length}</span> results
               </p>
             </div>
             <div>
               <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                 <button
                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                   disabled={currentPage === 1}
                   className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                 >
                   <ChevronLeft className="h-5 w-5" />
                 </button>
                 {[...Array(totalPages)].map((_, i) => (
                   <button
                     key={i + 1}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                       currentPage === i + 1
                         ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                         : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                     }`}
                   >
                     {i + 1}
                   </button>
                 ))}
                 <button
                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                   disabled={currentPage === totalPages}
                   className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                 >
                   <ChevronRight className="h-5 w-5" />
                 </button>
               </nav>
             </div>
           </div>
         </div>
       )}
     </div>

     {/* Create Shipment Modal */}
     <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Inbound Shipment" size="lg">
       <CreateShipmentForm
         onSubmit={handleCreateShipment}
         onCancel={() => setShowCreateModal(false)}
       />
     </Modal>

     {/* View Shipment Details Modal */}
     <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Shipment Details" size="xl">
       {selectedShipment && <ShipmentDetailsModal shipment={selectedShipment} />}
     </Modal>

     {/* Status Change Confirmation Modal */}
     <StatusChangeModal
       isOpen={showStatusModal}
       onClose={() => setShowStatusModal(false)}
       shipment={selectedShipment}
       targetStatus={targetStatus}
       onConfirm={handleStatusChange}
     />
   </div>
 );
};

export default InboundShipmentsPage;