import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
  Lock,
  ChevronDown
} from 'lucide-react';

/* -------------------------
  Shared Modal (portal; matches your other pages)
--------------------------*/
const Modal = ({ isOpen, onClose, title, children, size = 'md', backdrop = 'blur' }) => {
  useEffectIfOpen(isOpen);

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
  const panelClass = `bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[85vh] overflow-y-auto`;

  const modal = (
    <div className={overlayClass} onClick={onClose} aria-modal="true" role="dialog">
      <div className={panelClass} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-8 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

// small hook to lock body scroll when modal open
function useEffectIfOpen(isOpen) {
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);
}

/* -------------------------
  UsersPage (Tailwind-styled)
--------------------------*/
const UsersPage = () => {
  const API = 'http://localhost:8080';
  const token = localStorage.getItem('jwt');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // search & filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // pagination (simple)
  const [page, setPage] = useState(1);
  const perPage = 10;

  // modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // form state
  const [addForm, setAddForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'LOGISTICS' });
  const [addErrors, setAddErrors] = useState({});
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [pwdForm, setPwdForm] = useState({ username: '', newPassword: '', confirmPassword: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [toDelete, setToDelete] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  // fetch users (hydrated)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/user`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // filter + pagination derived list
  const filtered = users.filter(u => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || (u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.fullName?.toLowerCase().includes(q) || String(u.id).includes(q));
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // ---- Add user ----
  const openAdd = () => { setAddForm({ username: '', password: '', fullName: '', email: '', role: 'LOGISTICS' }); setAddErrors({}); setShowAdd(true); };
  const closeAdd = () => setShowAdd(false);

  const validateAdd = () => {
    const errs = {};
    if (!addForm.username) errs.username = 'Required';
    if (!addForm.password) errs.password = 'Required';
    if (!addForm.fullName) errs.fullName = 'Required';
    if (!addForm.email) errs.email = 'Required';
    if (!addForm.role) errs.role = 'Required';
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitAdd = async (e) => {
    e?.preventDefault();
    if (!validateAdd()) return;
    try {
      await axios.post(`${API}/register`, addForm, { headers });
      await fetchUsers();
      setShowAdd(false);
    } catch (err) {
      if (err.response?.status === 409) setAddErrors({ username: 'Username already taken' });
      else console.error('Add failed', err);
    }
  };

  // ---- Edit user (no password) ----
  const openEdit = (u) => { setEditForm({ ...u }); setEditErrors({}); setShowEdit(true); };
  const closeEdit = () => setShowEdit(false);

  const validateEdit = () => {
    const errs = {};
    if (!editForm.username) errs.username = 'Required';
    if (!editForm.fullName) errs.fullName = 'Required';
    if (!editForm.email) errs.email = 'Required';
    if (!editForm.role) errs.role = 'Required';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitEdit = async (e) => {
    e?.preventDefault();
    if (!validateEdit()) return;
    try {
      await axios.put(`${API}/user`, editForm, { headers });
      await fetchUsers();
      setShowEdit(false);
    } catch (err) {
      console.error('Edit failed', err);
    }
  };

  // ---- View details ----
  const openView = (u) => { setViewUser(u); setShowView(true); };
  const closeView = () => setShowView(false);

  // ---- Change password (separate modal) ----
  const openChangePwd = (u) => { setPwdForm({ username: u.username, newPassword: '', confirmPassword: '' }); setPwdErrors({}); setShowChangePwd(true); };
  const closeChangePwd = () => setShowChangePwd(false);

  const validatePwd = () => {
    const errs = {};
    if (!pwdForm.newPassword) errs.newPassword = 'Required';
    if (pwdForm.newPassword !== pwdForm.confirmPassword) errs.confirmPassword = 'Passwords must match';
    setPwdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitChangePwd = async (e) => {
    e?.preventDefault();
    if (!validatePwd()) return;
    try {
      await axios.post(`${API}/user/change-password`, { username: pwdForm.username, newPassword: pwdForm.newPassword }, { headers });
      setShowChangePwd(false);
    } catch (err) {
      console.error('Change password failed', err);
    }
  };

  // ---- Delete ----
  const openDelete = (u) => { setToDelete(u); setShowDelete(true); };
  const closeDelete = () => { setToDelete(null); setShowDelete(false); };

  const submitDelete = async () => {
    try {
      await axios.delete(`${API}/user/${toDelete.id}`, { headers: { Authorization: `Bearer ${token}` }});
      await fetchUsers();
      setShowDelete(false);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // small helper to format date/time
  const fmtDateTime = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-600 mt-1">Manage application users and roles</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
              placeholder="Search username, email, name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setRoleFilter('')}
              className={`px-3 py-2 border rounded-l-lg ${roleFilter === '' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white'}`}
            >
              All
            </button>
            <div className="inline-flex">
              <button
                onClick={() => { setRoleFilter('ADMIN'); setPage(1); }}
                className={`px-3 py-2 border-t border-b ${roleFilter === 'ADMIN' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white'}`}
              >
                ADMIN
              </button>
              <button
                onClick={() => { setRoleFilter('LOGISTICS'); setPage(1); }}
                className={`px-3 py-2 border rounded-r-lg ${roleFilter === 'LOGISTICS' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white'}`}
              >
                LOGISTICS
              </button>
            </div>
          </div>

          <button
            onClick={() => openAdd()}
            className="ml-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : pageItems.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No users found</td></tr>
            ) : pageItems.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{u.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{u.username}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{u.fullName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{u.role}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{fmtDateTime(u.createdAt)}</td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="inline-flex items-center space-x-2">
                    <button onClick={() => openView(u)} className="p-2 rounded hover:bg-gray-100">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button onClick={() => openEdit(u)} className="p-2 rounded hover:bg-gray-100">
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </button>
                    <button onClick={() => openChangePwd(u)} className="p-2 rounded hover:bg-gray-100">
                      <Lock className="h-4 w-4 text-yellow-600" />
                    </button>
                    <button onClick={() => openDelete(u)} className="p-2 rounded hover:bg-gray-100">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{(page-1)*perPage + 1}</span> to <span className="font-medium">{Math.min(page*perPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> results
        </div>
        <div className="inline-flex items-center space-x-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i+1)} className={`px-3 py-1 border rounded ${page === i+1 ? 'bg-blue-50 border-blue-400 text-blue-700' : ''}`}>{i+1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* ---------- Add Modal ---------- */}
      <Modal isOpen={showAdd} onClose={closeAdd} title="Add New User" size="md">
        <form onSubmit={submitAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input value={addForm.username} onChange={e => setAddForm({...addForm, username: e.target.value})} className={`w-full px-3 py-2 border rounded ${addErrors.username ? 'border-red-500' : 'border-gray-300'}`} />
            {addErrors.username && <p className="text-xs text-red-600 mt-1">{addErrors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} className={`w-full px-3 py-2 border rounded ${addErrors.password ? 'border-red-500' : 'border-gray-300'}`} />
            {addErrors.password && <p className="text-xs text-red-600 mt-1">{addErrors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input value={addForm.fullName} onChange={e => setAddForm({...addForm, fullName: e.target.value})} className={`w-full px-3 py-2 border rounded ${addErrors.fullName ? 'border-red-500' : 'border-gray-300'}`} />
            {addErrors.fullName && <p className="text-xs text-red-600 mt-1">{addErrors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} className={`w-full px-3 py-2 border rounded ${addErrors.email ? 'border-red-500' : 'border-gray-300'}`} />
            {addErrors.email && <p className="text-xs text-red-600 mt-1">{addErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={addForm.role} onChange={e => setAddForm({...addForm, role: e.target.value})} className={`w-full px-3 py-2 border rounded ${addErrors.role ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="ADMIN">ADMIN</option>
              <option value="LOGISTICS">LOGISTICS</option>
            </select>
            {addErrors.role && <p className="text-xs text-red-600 mt-1">{addErrors.role}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={closeAdd} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"><Save className="h-4 w-4 mr-2" /> Create</button>
          </div>
        </form>
      </Modal>

      {/* ---------- Edit Modal (no password) ---------- */}
      <Modal isOpen={showEdit} onClose={closeEdit} title={`Edit User: ${editForm?.username || ''}`} size="md">
        {editForm && (
          <form onSubmit={submitEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input value={editForm.username} readOnly className="w-full px-3 py-2 border rounded border-gray-200 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} className={`w-full px-3 py-2 border rounded ${editErrors.fullName ? 'border-red-500' : 'border-gray-300'}`} />
              {editErrors.fullName && <p className="text-xs text-red-600 mt-1">{editErrors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className={`w-full px-3 py-2 border rounded ${editErrors.email ? 'border-red-500' : 'border-gray-300'}`} />
              {editErrors.email && <p className="text-xs text-red-600 mt-1">{editErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className={`w-full px-3 py-2 border rounded ${editErrors.role ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="ADMIN">ADMIN</option>
                <option value="LOGISTICS">LOGISTICS</option>
              </select>
              {editErrors.role && <p className="text-xs text-red-600 mt-1">{editErrors.role}</p>}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => { closeEdit(); openChangePwd(editForm); }} className="text-sm text-yellow-600 hover:underline inline-flex items-center">
                <Lock className="h-4 w-4 mr-1" /> Change Password
              </button>

              <div className="flex space-x-3">
                <button type="button" onClick={closeEdit} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"><Save className="h-4 w-4 mr-2" /> Save</button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ---------- View Details Modal ---------- */}
      <Modal isOpen={showView} onClose={closeView} title={`User details: ${viewUser?.username || ''}`} size="md">
        {viewUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium text-gray-900">#{viewUser.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium text-gray-900">{viewUser.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{viewUser.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{viewUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900">{viewUser.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium text-gray-900">{fmtDateTime(viewUser.createdAt)}</p>
            </div>

            <div className="flex justify-end">
              <button onClick={closeView} className="px-4 py-2 bg-gray-100 rounded">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Change Password Modal ---------- */}
      <Modal isOpen={showChangePwd} onClose={closeChangePwd} title={`Change password: ${pwdForm.username}`} size="md">
        <form onSubmit={submitChangePwd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} className={`w-full px-3 py-2 border rounded ${pwdErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`} />
            {pwdErrors.newPassword && <p className="text-xs text-red-600 mt-1">{pwdErrors.newPassword}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} className={`w-full px-3 py-2 border rounded ${pwdErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} />
            {pwdErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{pwdErrors.confirmPassword}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={closeChangePwd} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Change</button>
          </div>
        </form>
      </Modal>

      {/* ---------- Delete Confirmation Modal ---------- */}
      <Modal isOpen={showDelete} onClose={closeDelete} title="Confirm delete" size="sm">
        <div className="space-y-4">
          <p>Are you sure you want to delete <span className="font-semibold">{toDelete?.username}</span>?</p>
          <div className="flex justify-end space-x-3">
            <button onClick={closeDelete} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
            <button onClick={submitDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
