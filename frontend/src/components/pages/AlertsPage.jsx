import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Search,
  Eye,
  X,
  Info,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Bell,
  Calendar,
  Tag,
  Database,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

/* ---------- Enhanced Modal with smoother animations ---------- */
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

/* ---------- Enhanced Alerts Page ---------- */
const AlertsPage = ({ userRole = 'ADMIN' }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwt');
  const headers = { Authorization: `Bearer ${token}` };

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityDetails, setEntityDetails] = useState({}); // Cache for entity details

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilters, setSeverityFilters] = useState({});
  const [typeFilter, setTypeFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Derived lists for filter dropdowns
  const alertTypes = Array.from(new Set(alerts.map(a => a.alertType).filter(Boolean)));
  const entityTypes = Array.from(new Set(alerts.map(a => a.entityType).filter(Boolean)));

  // Fetch entity details based on type and id
  const fetchEntityDetails = async (entityType, entityId) => {
    if (!entityType || !entityId) return null;
    
    const cacheKey = `${entityType}_${entityId}`;
    if (entityDetails[cacheKey]) {
      return entityDetails[cacheKey];
    }

    try {
      let endpoint = '';
      switch (entityType) {
        case 'PRODUCT':
          endpoint = `/product/${entityId}`;
          break;
        case 'PRODUCT_INVENTORY':
          endpoint = `/product/${entityId}`;
          break;
        case 'RAW_MATERIAL':
          endpoint = `/raw-material/${entityId}`;
          break;
        case 'RAW_MATERIAL_INVENTORY':
          endpoint = `/raw-material/${entityId}`;
          break;
        case 'SHIPMENT':
          endpoint = `/shipments/${entityId}`;
          break;
        case 'PRODUCTION_ORDER':
          endpoint = `/production-orders/${entityId}`;
          break;
        default:
          return null;
      }

      const response = await axios.get(`${API_URL}${endpoint}`, { headers });
      const details = response.data;
      
      // Cache the details
      setEntityDetails(prev => ({ ...prev, [cacheKey]: details }));
      return details;
    } catch (error) {
      console.error(`Failed to fetch ${entityType} details:`, error);
      return null;
    }
  };

  // Get display name for entity
  const getEntityDisplayName = (entityType, entityId, details) => {
    if (!details) return `${entityType} #${entityId}`;
    
    switch (entityType) {
      case 'PRODUCT':
        return details.sku || `Product #${entityId}`;
      case 'RAW_MATERIAL':
        return details.sku || `Raw Material #${entityId}`;
      case 'SHIPMENT':
        return details.reference || `Shipment #${entityId}`;
      case 'PRODUCTION_ORDER':
        return details.reference || `Production Order #${entityId}`;
      default:
        console.log("yeah no");
        return `${entityType} #${entityId}`;
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/alert`, { headers });
      setAlerts(res.data || []);
      
      // Fetch entity details for all alerts
      const uniqueEntities = new Set();
      res.data?.forEach(alert => {
        if (alert.entityType && alert.entityId) {
          uniqueEntities.add(`${alert.entityType}_${alert.entityId}`);
        }
      });

      // Fetch details for entities we don't have cached
      for (const entityKey of uniqueEntities) {
        const [entityType, entityId] = entityKey.split('_');
        if (!entityDetails[entityKey]) {
          await fetchEntityDetails(entityType, parseInt(entityId));
        }
      }
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Filtering
  const filtered = alerts.filter(a => {
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      const matchMessage = (a.message || '').toLowerCase().includes(q);
      const matchId = String(a.id || '').includes(q);
      const matchEntityId = String(a.entityId || '').includes(q);
      
      // Also search in entity display name
      const entityKey = `${a.entityType}_${a.entityId}`;
      const entityDetail = entityDetails[entityKey];
      const entityDisplayName = getEntityDisplayName(a.entityType, a.entityId, entityDetail);
      const matchEntityName = entityDisplayName.toLowerCase().includes(q);
      
      if (!(matchMessage || matchId || matchEntityId || matchEntityName)) return false;
    }

    const activeSeverity = Object.values(severityFilters).some(Boolean);
    if (activeSeverity && !severityFilters[a.severity]) return false;

    if (typeFilter && a.alertType !== typeFilter) return false;
    if (entityFilter && a.entityType !== entityFilter) return false;

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((x, y) => {
    const a = x[sortField];
    const b = y[sortField];
    if (sortField === 'createdAt') {
      const da = new Date(a).getTime();
      const db = new Date(b).getTime();
      return sortDirection === 'asc' ? da - db : db - da;
    }
    if (a === undefined || b === undefined) return 0;
    if (sortDirection === 'asc') return a > b ? 1 : -1;
    return a < b ? 1 : -1;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  // Get alert counts by severity for the header stats
  const alertCounts = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});

  // helpers
  const formatDateTime = (s) => {
    if (!s) return 'Not set';
    const date = new Date(s);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 60 * 1000) { // Less than 1 hour
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}m ago`;
    } else if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const severityConfig = {
    INFO: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      border: 'border-blue-200',
      icon: <Info className="h-4 w-4" />,
      gradient: 'from-blue-500 to-blue-600'
    },
    WARNING: { 
      bg: 'bg-amber-50', 
      text: 'text-amber-700', 
      border: 'border-amber-200',
      icon: <AlertTriangle className="h-4 w-4" />,
      gradient: 'from-amber-500 to-amber-600'
    },
    CRITICAL: { 
      bg: 'bg-red-50', 
      text: 'text-red-700', 
      border: 'border-red-200',
      icon: <XCircle className="h-4 w-4" />,
      gradient: 'from-red-500 to-red-600'
    }
  };

  const toggleSeverity = (sev) => {
    setSeverityFilters(prev => ({ ...prev, [sev]: !prev[sev] }));
    setCurrentPage(1);
  };

  const openDetail = (alert) => { setSelectedAlert(alert); setShowDetailModal(true); };

  // Enhanced alert type pill
  const AlertTypePill = ({ type }) => (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200">
      <Tag className="h-3 w-3 mr-1" />
      {type.replace(/_/g, ' ')}
    </div>
  );

  // Stats cards for the top section
  const StatCard = ({ title, count, severity }) => {
    const config = severityConfig[severity];
    return (
      <div className={`${config.bg} ${config.border} border rounded-xl p-4 transition-all duration-200 hover:shadow-md`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${config.text} mt-1`}>{count || 0}</p>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
            {config.icon}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white shadow-lg">
                <Bell className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Alerts Dashboard
              </h1>
            </div>
            <p className="text-gray-600">Monitor system notifications and track issues across your inventory ecosystem</p>
          </div>
          
          {/* <button 
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Critical Alerts" count={alertCounts.CRITICAL} severity="CRITICAL" />
          <StatCard title="Warnings" count={alertCounts.WARNING} severity="WARNING" />
          <StatCard title="Information" count={alertCounts.INFO} severity="INFO" />
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Search */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Alerts</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  placeholder="Search by message, ID, entity name..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Severity Filters */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity Filters</label>
              <div className="flex items-center space-x-2">
                {['CRITICAL', 'WARNING', 'INFO'].map(s => {
                  const cfg = severityConfig[s];
                  const active = !!severityFilters[s];
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSeverity(s)}
                      className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
                        active 
                          ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-md scale-105` 
                          : 'bg-white/70 border-gray-200 text-gray-600 hover:bg-gray-50'
                      } text-sm font-medium flex items-center space-x-2`}
                    >
                      {cfg.icon}
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropdowns */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Types</option>
                  {alertTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
                <select
                  value={entityFilter}
                  onChange={(e) => { setEntityFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Entities</option>
                  {entityTypes.map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paginated.length === 0 ? (
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          ) : paginated.map(alert => {
            const sevCfg = severityConfig[alert.severity] || severityConfig.INFO;
            const entityKey = `${alert.entityType}_${alert.entityId}`;
            const entityDetail = entityDetails[entityKey];
            const entityDisplayName = getEntityDisplayName(alert.entityType, alert.entityId, entityDetail);
            
            return (
              <div 
                key={alert.id} 
                className={`${sevCfg.bg} ${sevCfg.border} border rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer group`}
                onClick={() => openDetail(alert)}
              >
                {/* Alert Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${sevCfg.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      {sevCfg.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sevCfg.text}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500">#{alert.id}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDateTime(alert.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Eye className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

                {/* Alert Type */}
                <div className="mb-3">
                  <AlertTypePill type={alert.alertType} />
                </div>

                {/* Message */}
                {alert.message && (
                  <div className="mb-4">
                    <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">
                      {alert.message}
                    </p>
                  </div>
                )}

                {/* Entity Info */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">{alert.entityType?.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400">•</span>
                  <span>{entityDisplayName}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(startIndex + itemsPerPage, sorted.length)}</span> of{' '}
                <span className="font-semibold">{sorted.length}</span> alerts
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Alert Details - #${selectedAlert?.id}`}
          size="lg"
        >
          {selectedAlert ? (
            <div className="space-y-6">
              {/* Header */}
              <div className={`${severityConfig[selectedAlert.severity]?.bg} ${severityConfig[selectedAlert.severity]?.border} border rounded-xl p-4`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${severityConfig[selectedAlert.severity]?.gradient} text-white shadow-lg`}>
                    {severityConfig[selectedAlert.severity]?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${severityConfig[selectedAlert.severity]?.text}`}>
                        {selectedAlert.severity}
                      </span>
                      <AlertTypePill type={selectedAlert.alertType} />
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDateTime(selectedAlert.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Entity Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Related Entity</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium text-gray-900">{selectedAlert.entityType?.replace(/_/g, ' ') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entity</p>
                    <p className="font-medium text-gray-900">
                      {(() => {
                        const entityKey = `${selectedAlert.entityType}_${selectedAlert.entityId}`;
                        const entityDetail = entityDetails[entityKey];
                        return getEntityDisplayName(selectedAlert.entityType, selectedAlert.entityId, entityDetail);
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedAlert.message && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Alert Message</h4>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedAlert.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No alert selected</div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AlertsPage;