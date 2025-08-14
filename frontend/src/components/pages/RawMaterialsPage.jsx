import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Eye, 
  Package2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag
} from 'lucide-react';
import axios from 'axios';

// Reusable Modal (moved out of main component to avoid recreation)
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-96 overflow-y-auto`}>
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

// Raw Material Form (create & edit)
const RawMaterialForm = ({ material, setMaterial, onSubmit, onCancel, isEdit = false }) => {
  const units = ['METER', 'SET', 'BUNDLE', 'SHEET', 'PIECE', 'KG', 'LITER', 'BOX', 'ROLL'];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <input
          type="text"
          value={material.name}
          onChange={(e) => setMaterial({ ...material, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter raw material name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
        <input
          type="text"
          value={material.sku}
          onChange={(e) => setMaterial({ ...material, sku: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter SKU"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={material.description}
          onChange={(e) => setMaterial({ ...material, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
          placeholder="Enter description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
        <select
          value={material.unit}
          onChange={(e) => setMaterial({ ...material, unit: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {units.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
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
          <span>{isEdit ? 'Update' : 'Add'} Raw Material</span>
        </button>
      </div>
    </div>
  );
};

// Raw Material details (view)
const RawMaterialDetailsModal = ({ material }) => {
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Basic Information</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium text-gray-900">#{material.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{material.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">SKU</p>
              <p className="font-medium text-gray-900 flex items-center">
                <Tag className="h-4 w-4 mr-2 text-gray-400" />
                {material.sku}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unit</p>
              <p className="font-medium text-gray-900">{material.unit}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Timeline</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {formatDateTime(material.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                {formatDateTime(material.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{material.description || '-'}</p>
        </div>
      </div>
    </div>
  );
};

const RawMaterialsPage = ({ userRole = 'ADMIN' }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const token = localStorage.getItem("jwt");

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
    unit: 'PIECE'
  });

  useEffect(() => {
    const getMaterials = async () => {
      try {
        const res = await axios.get(`${API_URL}/raw-material`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMaterials(res.data);
      } catch (error) {
        console.error('Failed to load raw materials', error);
      }
    };
    getMaterials();
  }, [showAddModal]); // refresh after add

  // Filter & sort
  const filtered = materials.filter(m => {
    const q = searchTerm.toLowerCase();
    return (
        (m.sku && m.sku.toLowerCase().includes(q)) ||
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.id && m.id.toString().includes(q))
    );
  }).sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

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
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post(`${API_URL}/raw-material`, newMaterial, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await axios.get(`${API_URL}/raw-material`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(res.data);
    } catch (error) {
      console.error('Failed to add raw material', error);
    }
    setNewMaterial({ name: '', description: '', unit: 'PIECE' });
    setShowAddModal(false);
  };

  const handleEdit = async () => {
    try {
      await axios.put(`${API_URL}/raw-material`, selectedMaterial, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await axios.get(`${API_URL}/raw-material`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(res.data);
    } catch (error) {
      console.error('Failed to update raw material', error);
    }
    setShowEditModal(false);
    setSelectedMaterial(null);
  };

  const openEditModal = (m) => {
    setSelectedMaterial({ ...m });
    setShowEditModal(true);
  };

  const openViewModal = (m) => {
    setSelectedMaterial(m);
    setShowViewModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Raw Materials</h1>
          <p className="text-gray-600 mt-1">Manage raw materials used in production</p>
        </div>
        {userRole === 'ADMIN' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Raw Material</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search raw materials by name, SKU, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                  onClick={() => handleSort('name')}
                >
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('sku')}
                >
                  SKU {sortField === 'sku' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  Created {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Package2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No raw materials found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginated.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{m.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{m.name}</div>
                      {m.description && <div className="text-sm text-gray-500 truncate max-w-md mt-1">{m.description}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-mono bg-gray-100 text-gray-800 rounded">{m.sku}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDateTime(m.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openViewModal(m)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {userRole === 'ADMIN' && (
                        <button
                          onClick={() => openEditModal(m)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Edit Raw Material"
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

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Raw Material" size="lg">
        <RawMaterialForm
          material={newMaterial}
          setMaterial={setNewMaterial}
          onSubmit={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Raw Material" size="lg">
        {selectedMaterial && (
          <RawMaterialForm
            material={selectedMaterial}
            setMaterial={setSelectedMaterial}
            onSubmit={handleEdit}
            onCancel={() => setShowEditModal(false)}
            isEdit={true}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Raw Material Details" size="xl">
        {selectedMaterial && <RawMaterialDetailsModal material={selectedMaterial} />}
      </Modal>
    </div>
  );
};

export default RawMaterialsPage;
