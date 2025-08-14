import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit3,
  Eye,
  Package2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Tag
} from 'lucide-react';
import axios from 'axios';

// Reusable modal (kept outside to avoid re-creation)
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[80vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Utility to safely get nested values by path like 'rawMaterialDto.name'
const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (let p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
};

// Form used for editing raw material inventory (only quantity & reorderThreshold are editable)
const RawMaterialInventoryEditForm = ({ inventory, setInventory, onSubmit, onCancel }) => {
  if (!inventory) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Inventory ID</label>
        <input
          type="text"
          value={`#${inventory.id}`}
          readOnly
          className="w-full px-3 py-2 border border-gray-100 rounded-lg bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Raw Material</label>
        <input
          type="text"
          value={inventory.rawMaterialDto ? inventory.rawMaterialDto.name : ''}
          readOnly
          className="w-full px-3 py-2 border border-gray-100 rounded-lg bg-gray-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={inventory.quantity !== undefined && inventory.quantity !== null ? inventory.quantity : ''}
            onChange={(e) => setInventory({ ...inventory, quantity: e.target.value === '' ? '' : Math.max(0,parseFloat(e.target.value)) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Threshold</label>
          <input
            type="number"
            step="0.01"
            min="0"
            
            value={inventory.reorderThreshold !== undefined && inventory.reorderThreshold !== null ? inventory.reorderThreshold : ''}
            onChange={(e) => setInventory({ ...inventory, reorderThreshold: e.target.value === '' ? '' : Math.max(0,parseFloat(e.target.value)) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

// Modal showing raw material inventory + nested raw material details (read-only)
const RawMaterialInventoryDetails = ({ inventory }) => {
  if (!inventory) return null;

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const raw = inventory.rawMaterialDto || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Inventory</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Inventory ID</p>
              <p className="font-medium text-gray-900">#{inventory.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-medium text-gray-900">{inventory.quantity ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reorder Threshold</p>
              <p className="font-medium text-gray-900">{inventory.reorderThreshold ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {formatDateTime(inventory.lastUpdated)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Raw Material</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Raw Material ID</p>
              <p className="font-medium text-gray-900">#{raw.id ?? '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{raw.name ?? '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unit</p>
              <p className="font-medium text-gray-900">{raw.unit ?? '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium text-gray-900">{formatDateTime(raw.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900">{formatDateTime(raw.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{raw.description ?? '-'}</p>
        </div>
      </div>
    </div>
  );
};

const RawMaterialInventory = ({ userRole = 'ADMIN' }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwt');

  const [inventories, setInventories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch inventories
  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const res = await axios.get(`${API_URL}/raw-material-inventory`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInventories(res.data);
      } catch (err) {
        console.error('Failed to load raw material inventories', err);
      }
    };
    fetchInventories();
  }, [API_URL, token, showEditModal]); // refresh after edit

  // Filter & sort
  const filtered = inventories
    .filter(inv => {
      const q = searchTerm.toLowerCase();
      const name = getNestedValue(inv, 'rawMaterialDto.name') ?? '';
      return (
        (name && name.toLowerCase().includes(q)) ||
        (inv.id && inv.id.toString().includes(q)) ||
        (getNestedValue(inv, 'rawMaterialDto.id') && getNestedValue(inv, 'rawMaterialDto.id').toString().includes(q))
      );
    })
    .sort((a, b) => {
      const aVal = getNestedValue(a, sortField);
      const bVal = getNestedValue(b, sortField);

      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bVal === undefined) return sortDirection === 'asc' ? -1 : 1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr === bStr) return 0;
      return sortDirection === 'asc' ? (aStr > bStr ? 1 : -1) : (aStr < bStr ? 1 : -1);
    });

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openEditModal = (inv) => {
    setSelectedInventory({ ...inv });
    setShowEditModal(true);
  };

  const openViewModal = (inv) => {
    setSelectedInventory(inv);
    setShowViewModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...selectedInventory,
        quantity: selectedInventory.quantity === '' ? 0.0 : Number(selectedInventory.quantity),
        reorderThreshold: selectedInventory.reorderThreshold === '' ? 0.0 : Number(selectedInventory.reorderThreshold)
      };

      await axios.put(`${API_URL}/raw-material-inventory`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const res = await axios.get(`${API_URL}/raw-material-inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventories(res.data);
    } catch (err) {
      console.error('Failed to update raw material inventory', err);
    }

    setShowEditModal(false);
    setSelectedInventory(null);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raw Material Inventory</h1>
          <p className="text-gray-600 mt-1">View and update raw material quantities and reorder thresholds</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by raw material name, inventory ID or raw material ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
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
                  onClick={() => handleSort('rawMaterialDto.name')}
                >
                  Raw Material {sortField === 'rawMaterialDto.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('reorderThreshold')}
                >
                  Reorder Threshold {sortField === 'reorderThreshold' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastUpdated')}
                >
                  Last Updated {sortField === 'lastUpdated' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Package2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No raw material inventory records found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginated.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{inv.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{inv.rawMaterialDto?.name}</div>
                      {inv.rawMaterialDto?.sku ? (
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          #{inv.rawMaterialDto.sku}
                        </div>
                      ) :
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          #{inv.rawMaterialDto.id}
                        </div> 
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.quantity ?? 0} </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.reorderThreshold ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDateTime(inv.lastUpdated)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openViewModal(inv)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {userRole === 'ADMIN' && (
                        <button
                          onClick={() => openEditModal(inv)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Edit Inventory"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
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
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> of{' '}
                  <span className="font-medium">{filtered.length}</span> results
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

      {/* Edit modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Raw Material Inventory" size="md">
        <RawMaterialInventoryEditForm
          inventory={selectedInventory}
          setInventory={setSelectedInventory}
          onSubmit={handleSave}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedInventory(null);
          }}
        />
      </Modal>

      {/* View modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Inventory Details" size="xl">
        {selectedInventory && <RawMaterialInventoryDetails inventory={selectedInventory} />}
      </Modal>
    </div>
  );
};

export default RawMaterialInventory;
