import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Key,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

/* ---------- Enhanced Modal ---------- */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

/* ---------- User Profile Page (reorganized) ---------- */
const UserProfilePage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwt');
  const headers = { Authorization: `Bearer ${token}` };

  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    id: '',
    username: '',
    email: '',
    fullName: '',
    role: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation errors
  const [editErrors, setEditErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Success/error messages
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize edit form when user data is available
  useEffect(() => {
    if (currentUser) {
      setEditForm({
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        fullName: currentUser.fullName,
        role: currentUser.role
      });
    }
  }, [currentUser]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Format date/time
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Role badge styling
  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
      USER: 'bg-blue-100 text-blue-800 border-blue-200',
      MANAGER: 'bg-green-100 text-green-800 border-green-200'
    };
    return styles[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Validation functions
  const validateEdit = () => {
    const errors = {};
    if (!editForm.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!editForm.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit profile submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEdit()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setShowEditModal(false);
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Update failed:', response.status, errorText);
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      console.error('Update failed:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsChangingPassword(true);
    try {
      const response = await fetch(`${API_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          username: currentUser.username,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setShowPasswordModal(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Password change failed:', response.status, errorText);
        setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
      }
    } catch (error) {
      console.error('Password change failed:', error);
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle modal closures
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditErrors({});
    if (currentUser) {
      setEditForm({
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        fullName: currentUser.fullName,
        role: currentUser.role
      });
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordErrors({});
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600">Please log in again to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white shadow-lg">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600">Manage your account details</p>
            </div>
          </div>

          {/* Quick action buttons moved to the right */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow"
            >
              <Edit3 className="h-4 w-4" />
              <span className="text-sm">Edit Profile</span>
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <Key className="h-4 w-4" />
              <span className="text-sm">Change Password</span>
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          } flex items-center space-x-2`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Main layout: left compact info card, right detailed info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compact Info Card (left) */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                    {currentUser.fullName?.charAt(0)?.toUpperCase() || currentUser.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{currentUser.fullName}</h2>
                    <p className="text-sm text-gray-600">@{currentUser.username}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-3">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="text-sm font-medium text-gray-900 truncate">{currentUser.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Member Since</div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(currentUser.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadge(currentUser.role)}`}>
                  <Shield className="h-4 w-4 mr-1" />
                  {currentUser.role}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Info (right) */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 font-medium">{currentUser.username}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{currentUser.fullName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{currentUser.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{currentUser.role}</span>
                  </div>
                </div>
              </div>

              {/* Optional extended info area (keeps layout consistent if you add more fields later) */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h4 className="text-sm text-gray-500 mb-3">Account</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-sm">
                    <div className="text-gray-500">Last Login</div>
                    <div className="font-medium text-gray-900">{currentUser.lastLogin ? formatDate(currentUser.lastLogin) : 'Not available'}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">Account ID</div>
                    <div className="font-medium text-gray-900">#{currentUser.id}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal isOpen={showEditModal} onClose={closeEditModal} title="Edit Profile" size="md">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text"
                value={editForm.username} 
                readOnly 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email"
                value={editForm.email} 
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  editErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {editErrors.email && <p className="text-xs text-red-600 mt-1">{editErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text"
                value={editForm.fullName} 
                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  editErrors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {editErrors.fullName && <p className="text-xs text-red-600 mt-1">{editErrors.fullName}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isUpdating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUpdating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <Save className="h-4 w-4" />
                <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* Change Password Modal */}
        <Modal isOpen={showPasswordModal} onClose={closePasswordModal} title="Change Password" size="md">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.newPassword} 
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword} 
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Password Requirements:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• At least 6 characters long</li>
                    <li>• Must match confirmation password</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                onClick={closePasswordModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isChangingPassword && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <Key className="h-4 w-4" />
                <span>{isChangingPassword ? 'Changing...' : 'Change Password'}</span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UserProfilePage;
