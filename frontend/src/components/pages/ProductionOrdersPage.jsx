import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Search,
  Plus,
  Eye,
  Factory,
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
  Play,
  ChevronDown,
  Trash2,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';
import GenericDropdown from '../customElements/GenericDropdown';

/* -------------------------
  Shared Modal
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
  CreateProductionOrderForm
  (kept nearly identical to yours)
--------------------------*/
const CreateProductionOrderForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    productId: '',
    productQuantity: '',
    startDate: '',
    rawMaterials: []
  });

  const [productInventory, setProductInventory] = useState([]);
  const [rawMaterialInventory, setRawMaterialInventory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const headers = { Authorization: `Bearer ${token}` };
        const [productInvRes, rawMatInvRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/product-inventory`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/raw-material-inventory`, { headers })
        ]);
        setProductInventory(productInvRes.data || []);
        setRawMaterialInventory(rawMatInvRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const addRawMaterial = () => {
    setFormData({
      ...formData,
      rawMaterials: [...formData.rawMaterials, { rawMaterialId: '', quantity: '' }]
    });
  };

  const removeRawMaterial = (index) => {
    setFormData({
      ...formData,
      rawMaterials: formData.rawMaterials.filter((_, i) => i !== index)
    });
  };

  const updateRawMaterial = (index, field, value) => {
    const updated = formData.rawMaterials.map((rm, i) =>
      i === index ? { ...rm, [field]: value } : rm
    );
    setFormData({ ...formData, rawMaterials: updated });
  };

  const handleSubmit = () => {
    const submitData = {
      product: {
        productId: parseInt(formData.productId),
        quantity: parseFloat(formData.productQuantity)
      },
      rawMaterials: formData.rawMaterials.map(rm => ({
        rawMaterialId: parseInt(rm.rawMaterialId),
        quantity: parseFloat(rm.quantity)
      })),
      startDate: formData.startDate || null,
      status: 'PLANNED'
    };
    onSubmit(submitData);
  };

  const isValid = formData.productId && formData.productQuantity &&
    formData.rawMaterials.length > 0 &&
    formData.rawMaterials.every(rm => rm.rawMaterialId && rm.quantity);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <GenericDropdown
          value={formData.productId}
          onChange={(id) => setFormData({ ...formData, productId: id })}
          options={productInventory}
          placeholder="Select Product to Produce"
          compact={true}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Quantity</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.productQuantity}
            onChange={(e) => setFormData({ ...formData, productQuantity: e.target.value })}
            className="w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter quantity to produce"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          className="w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Raw Materials Required</h4>
          <button
            type="button"
            onClick={addRawMaterial}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Material</span>
          </button>
        </div>

        {formData.rawMaterials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No raw materials added yet</p>
            <p className="text-sm">Click "Add Material" to start</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.rawMaterials.map((rm, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <GenericDropdown
                  value={rm.rawMaterialId}
                  onChange={(id) => updateRawMaterial(index, 'rawMaterialId', id)}
                  options={rawMaterialInventory}
                  placeholder="Select Raw Material"
                  compact={true}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={rm.quantity}
                    onChange={(e) => updateRawMaterial(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => removeRawMaterial(index)}
                    className="w-full px-3 py-2 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
          disabled={!isValid}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          <span>Create Production Order</span>
        </button>
      </div>
    </div>
  );
};

/* -------------------------
  ProductionOrderDetailsModal
--------------------------*/
const ProductionOrderDetailsModal = ({ order }) => {
  const formatDate = (s) => (!s ? '--' : new Date(s).toLocaleDateString());
  const formatDateTime = (s) => (!s ? '--' : (new Date(s).toLocaleDateString() + ' ' + new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })));

  const getStatusBadge = (status) => {
    const statusConfig = {
      PLANNED: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: <Play className="h-3 w-3" /> },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> },
      REVERSED: { color: 'bg-red-100 text-red-800', icon: <RotateCcw className="h-3 w-3" /> }
    };
    const cfg = statusConfig[status] || statusConfig.PLANNED;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        {cfg.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Order Information</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium text-gray-900">#{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reference Code</p>
              <p className="font-medium text-gray-900">{order.reference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1">{getStatusBadge(order.status)}</div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Creation Date</p>
              <p className="font-medium text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {formatDate(order.creationDate)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Production Schedule</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {formatDate(order.startDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Planned Completion</p>
              <p className="font-medium text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {formatDate(order.plannedCompletionDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Product to Produce</h4>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{order.product?.product?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">SKU: {order.product?.product?.sku || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">Quantity: {order.product?.quantity || 0}</p>
              <p className="text-sm text-gray-500">{order.product?.product?.unit || ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
          Raw Materials Required ({order.rawMaterials?.length || 0})
        </h4>
        {order.rawMaterials && order.rawMaterials.length > 0 ? (
          <div className="space-y-3">
            {order.rawMaterials.map((material, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{material.rawMaterial?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">SKU: {material.rawMaterial?.sku || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">Qty: {material.quantity || 0}</p>
                  <p className="text-sm text-gray-500">{material.rawMaterial?.unit || ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No raw materials specified</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------
  Status Change Confirmation Modal
--------------------------*/
const StatusChangeModal = ({ isOpen, onClose, order, targetStatus, onConfirm }) => {
  const getStatusColor = (s) => {
    const map = {
      PLANNED: 'text-blue-600',
      IN_PROGRESS: 'text-yellow-600',
      COMPLETED: 'text-green-600',
      CANCELLED: 'text-gray-600',
      REVERSED: 'text-red-600'
    };
    return map[s] || 'text-gray-600';
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Status Change" size="md">
      <div className="space-y-4">
        <p className="text-gray-700">
          Change status of production order <span className="font-semibold">#{order.reference}</span> from{' '}
          <span className={`font-semibold ${getStatusColor(order.status)}`}>{order.status}</span> to{' '}
          <span className={`font-semibold ${getStatusColor(targetStatus)}`}>{targetStatus}</span>?
        </p>

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm</button>
        </div>
      </div>
    </Modal>
  );
};

/* -------------------------
  Reverse Confirmation Modal
--------------------------*/
const ReverseModal = ({ isOpen, onClose, order, onConfirm }) => {
  if (!order) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reverse Completed Order" size="md">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to reverse production order <span className="font-semibold">#{order.reference}</span>? This will attempt to undo effects of the completed order.
        </p>

        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Reverse</button>
        </div>
      </div>
    </Modal>
  );
};

/* -------------------------
  ProductionOrderPage (main)
--------------------------*/
const ProductionOrderPage = ({ userRole = 'ADMIN' }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwt');

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // helper: fetch orders and hydrate with actual product/rawMaterial entities
  const fetchAndHydrateOrders = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      // fetch orders (raw DTOs)
      const res = await axios.get(`${API_URL}/production-orders`, { headers });
      const ordersRaw = res.data || [];

      // collect unique productIds and rawMaterialIds
      const productIds = new Set();
      const rawMaterialIds = new Set();

      ordersRaw.forEach(o => {
        if (o.product?.productId) productIds.add(o.product.productId);
        (o.rawMaterials || []).forEach(r => {
          if (r.rawMaterialId) rawMaterialIds.add(r.rawMaterialId);
        });
      });

      // fetch products and raw materials (only once each)
      // if there are no ids, we still request the endpoints defensively with empty lists
      const [productsRes, rawMaterialsRes] = await Promise.all([
        productIds.size ? axios.get(`${API_URL}/product`, { headers }) : Promise.resolve({ data: [] }),
        rawMaterialIds.size ? axios.get(`${API_URL}/raw-material`, { headers }) : Promise.resolve({ data: [] })
      ]);

      const productsList = productsRes.data || [];
      const rawMaterialsList = rawMaterialsRes.data || [];

      // maps by id
      const productsMap = new Map(productsList.map(p => [p.id, p]));
      const rawMaterialsMap = new Map(rawMaterialsList.map(rm => [rm.id, rm]));

      // attach entities to orders
      const hydrated = ordersRaw.map(o => {
        const copy = { ...o };
        if (copy.product) {
          copy.product.product = productsMap.get(copy.product.productId) || null; // now order.product.product.name works
        } else {
          copy.product = null;
        }
        copy.rawMaterials = (copy.rawMaterials || []).map(r => ({
          ...r,
          rawMaterial: rawMaterialsMap.get(r.rawMaterialId) || null // now rawMaterial.name available
        }));
        return copy;
      });

      setOrders(hydrated);
    } catch (err) {
      console.error('Error fetching production orders (hydration):', err);
    }
  };

  // initial fetch + refresh when modals that change data close
  useEffect(() => {
    fetchAndHydrateOrders();
  }, [showCreateModal, showStatusModal, showReverseModal]);


  const getAllowedStatusTransitions = (currentStatus) => {
    const transitions = {
      PLANNED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // completed orders can be reversed instead
      CANCELLED: [],
      REVERSED: []
    };
    return transitions[currentStatus] || [];
  };

  const handleCreateOrder = async (data) => {
    try {
      await axios.post(`${API_URL}/production-orders`, data, { headers: { Authorization: `Bearer ${token}` } });
      // refresh hydrated orders
      await fetchAndHydrateOrders();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating production order:', err);
    }
  };

  const handleStatusChange = async () => {
    try {
      if (!selectedOrder) return;
      await axios.put(`${API_URL}/production-orders/${selectedOrder.id}/status`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: targetStatus }
      });
      // refresh hydrated orders
      await fetchAndHydrateOrders();
      setShowStatusModal(false);
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const handleReverseOrder = async () => {
    try {
      if (!selectedOrder) return;
      await axios.put(`${API_URL}/production-orders/${selectedOrder.id}/reverse`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // refresh hydrated orders
      await fetchAndHydrateOrders();
      setShowReverseModal(false);
    } catch (err) {
      console.error('Error reversing order:', err);
    }
  };

  const openStatusModal = (order, newStatus) => {
    setSelectedOrder(order);
    setTargetStatus(newStatus);
    setShowStatusModal(true);
  };

  const openReverseModal = (order) => {
    setSelectedOrder(order);
    setShowReverseModal(true);
  };

  const openViewModal = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  // filter + sort
  const filteredOrders = orders
    .filter(o => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q || (
        o.reference?.toLowerCase().includes(q) ||
        o.product?.product?.name?.toLowerCase().includes(q) ||
        o.product?.product?.sku?.toLowerCase().includes(q) ||
        String(o.id).includes(q)
      );
      const matchesStatus = !Object.values(statusFilters).some(v => v) || statusFilters[o.status];
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue === undefined || bValue === undefined) return 0;
      if (sortDirection === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PLANNED: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', icon: <Play className="h-3 w-3" /> },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> },
      REVERSED: { color: 'bg-red-100 text-red-800', icon: <RotateCcw className="h-3 w-3" /> }
    };
    const cfg = statusConfig[status] || statusConfig.PLANNED;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        {cfg.icon}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  const formatDate = (d) => (!d ? '--' : new Date(d).toLocaleDateString());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Orders</h1>
          <p className="text-gray-600 mt-1">Manage production orders and manufacturing processes</p>
        </div>
        {userRole === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Order</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by reference, product name, SKU..."
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
                {Object.keys(statusFilters).some(k => statusFilters[k])
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
                    {['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REVERSED'].map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={statusFilters[status] || false}
                          onChange={(e) => setStatusFilters({ ...statusFilters, [status]: e.target.checked })}
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => { setSortField('id'); setSortDirection(sortField === 'id' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'desc'); }}>
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => { setSortField('reference'); setSortDirection(sortField === 'reference' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                  Reference {sortField === 'reference' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materials</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => { setSortField('startDate'); setSortDirection(sortField === 'startDate' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'); }}>
                  Start Date {sortField === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Completion
</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No production orders found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.reference}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(order.status)}
                        {getAllowedStatusTransitions(order.status).length > 0 && (
                          <div className="relative mt-1">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  openStatusModal(order, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              <option value="">Change</option>
                              {getAllowedStatusTransitions(order.status).map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-sm font-medium text-gray-900">{order.product?.product?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.product?.product?.sku || 'N/A'}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.product?.quantity ?? 0}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.rawMaterials?.length ?? 0}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.startDate)}
                    </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {order.status === 'COMPLETED' ? (
    <div className="flex items-center text-green-600">
      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0 align-middle" />
      <span className="align-middle leading-5">
        {formatDate(order.actualCompletionDate || order.plannedCompletionDate)}
      </span>
    </div>
  ) : (order.status === 'CANCELLED') ? (
    <span className="text-gray-400">--</span>
  ) : (
    <div className="flex items-center text-blue-600">
      <Clock className="h-4 w-4 mr-2 flex-shrink-0 align-middle" />
      <span className="align-middle leading-5">
        Est. {formatDate(order.plannedCompletionDate)}
      </span>
    </div>
  )}
</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openViewModal(order)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* If order is COMPLETED allow reverse */}
                        {order.status === 'COMPLETED' && (
                          <button
                            onClick={() => openReverseModal(order)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            title="Reverse"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> of{' '}
                  <span className="font-medium">{filteredOrders.length}</span> results
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

      {/* Create modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Production Order" size="lg">
        <CreateProductionOrderForm onSubmit={handleCreateOrder} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {/* View modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Production Order Details" size="xl">
        {selectedOrder && <ProductionOrderDetailsModal order={selectedOrder} />}
      </Modal>

      {/* Status change confirmation modal */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        order={selectedOrder}
        targetStatus={targetStatus}
        onConfirm={handleStatusChange}
      />

      {/* Reverse confirmation modal */}
      <ReverseModal
        isOpen={showReverseModal}
        onClose={() => setShowReverseModal(false)}
        order={selectedOrder}
        onConfirm={handleReverseOrder}
      />
    </div>
  );
};

export default ProductionOrderPage;
