import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Eye,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import axios from 'axios';

// Simple Modal used across pages (same look & behaviour as ProductsPage)
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
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
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Supplier form used for add & edit
const SupplierForm = ({ supplier, setSupplier, onSubmit, onCancel, isEdit = false }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
        <input
          type="text"
          value={supplier.supplierName}
          onChange={(e) => setSupplier({ ...supplier, supplierName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter supplier name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={supplier.email || ''}
            onChange={(e) => setSupplier({ ...supplier, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="contact@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={supplier.phone || ''}
            onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+212 6 12 34 56 78"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input
          type="text"
          value={supplier.address || ''}
          onChange={(e) => setSupplier({ ...supplier, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Street, PO box, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={supplier.city || ''}
            onChange={(e) => setSupplier({ ...supplier, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input
            type="text"
            value={supplier.country || ''}
            onChange={(e) => setSupplier({ ...supplier, country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button onClick={onSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{isEdit ? 'Update' : 'Add'} Supplier</span>
        </button>
      </div>
    </div>
  );
};

// View supplier details modal
const SupplierDetailsModal = ({ supplier }) => {
  if (!supplier) return null;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Supplier Information</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{supplier.supplierName}</p>
              <p className="text-sm text-gray-500">{supplier.email || '—'}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{supplier.phone || '—'}</p>
              <p className="text-sm text-gray-500">{supplier.city ? `${supplier.city}${supplier.country ? ', ' + supplier.country : ''}` : (supplier.country || '—')}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium text-gray-900">{supplier.address || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main SuppliersPage
const SuppliersPage = ({ userRole = 'ADMIN' }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const token = localStorage.getItem('jwt');

  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    supplierName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  const tokenHeader = { Authorization: `Bearer ${token}` };

  // fetch suppliers
  useEffect(() => {
    const getSuppliers = async () => {
      try {
        const res = await axios.get(`${API_URL}/suppliers`, { headers: tokenHeader });
        setSuppliers(res.data || []);
      } catch (err) {
        console.error('Failed to fetch suppliers', err);
      }
    };
    getSuppliers();
  }, [showAddModal, showEditModal]);

  // filter and sort suppliers
  const filtered = suppliers
    .filter(s => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (s.supplierName || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q) ||
        (s.city || '').toLowerCase().includes(q) ||
        (s.country || '').toLowerCase().includes(q) ||
        String(s.id).includes(q)
      );
    })
    .sort((a, b) => {
      const aVal = (a[sortField] ?? '').toString().toLowerCase();
      const bVal = (b[sortField] ?? '').toString().toLowerCase();
      if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // create supplier
  const handleAddSupplier = async () => {
    try {
      await axios.post(`${API_URL}/suppliers`, newSupplier, { headers: tokenHeader });
      const res = await axios.get(`${API_URL}/suppliers`, { headers: tokenHeader });
      setSuppliers(res.data || []);
      setShowAddModal(false);
      setNewSupplier({ supplierName: '', email: '', phone: '', address: '', city: '', country: '' });
    } catch (err) {
      console.error('Error creating supplier', err);
    }
  };

  // edit supplier
  const handleEditSupplier = async () => {
    try {
      await axios.put(`${API_URL}/suppliers`, selectedSupplier, { headers: tokenHeader });
      const res = await axios.get(`${API_URL}/suppliers`, { headers: tokenHeader });
      setSuppliers(res.data || []);
      setShowEditModal(false);
      setSelectedSupplier(null);
    } catch (err) {
      console.error('Error updating supplier', err);
    }
  };

  const openEditModal = (s) => { setSelectedSupplier({ ...s }); setShowEditModal(true); };
  const openViewModal = (s) => { setSelectedSupplier(s); setShowViewModal(true); };

  const formatCell = (text) => text || '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage suppliers and contact information</p>
        </div>

        {userRole === 'ADMIN' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search suppliers by name, email, phone, city, country or ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                  onClick={() => { setSortField('id'); setSortDirection(sortField === 'id' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'); }}
                >
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => { setSortField('supplierName'); setSortDirection(sortField === 'supplierName' ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'); }}
                >
                  Supplier Name {sortField === 'supplierName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No suppliers found</p>
                    <p className="text-sm">Try adjusting your search</p>
                  </td>
                </tr>
              ) : (
                paginated.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{supplier.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supplier.supplierName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCell(supplier.email)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCell(supplier.phone)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.city || supplier.country ? `${supplier.city || ''}${supplier.city && supplier.country ? ', ' : ''}${supplier.country || ''}` : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => openViewModal(supplier)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      {userRole === 'ADMIN' && (
                        <button onClick={() => openEditModal(supplier)} className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded" title="Edit Supplier">
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
                  Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> results
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
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
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

      {/* Add Supplier Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Supplier" size="lg">
        <SupplierForm
          supplier={newSupplier}
          setSupplier={setNewSupplier}
          onSubmit={handleAddSupplier}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Supplier" size="lg">
        {selectedSupplier && (
          <SupplierForm
            supplier={selectedSupplier}
            setSupplier={setSelectedSupplier}
            onSubmit={handleEditSupplier}
            onCancel={() => setShowEditModal(false)}
            isEdit
          />
        )}
      </Modal>

      {/* View Supplier Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Supplier Details" size="md">
        {selectedSupplier && <SupplierDetailsModal supplier={selectedSupplier} />}
      </Modal>
    </div>
  );
};

export default SuppliersPage;
