import React, { useEffect, useState } from 'react';
import {
  Package,
  Truck,
  Factory,
  Users,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  XCircle,
  Calendar,
  Tag,
  Database,
  Eye,
  ArrowRight,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Boxes
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ userRole = 'ADMIN' }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwt');
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    products: { total: 0, lowStock: 0 },
    rawMaterials: { total: 0, shortage: 0 },
    shipmentsInbound: { total: 0, inTransit: 0, delayed: 0 },
    shipmentsOutbound: { total: 0, inTransit: 0, delayed: 0 },
    productionOrders: { total: 0, inProgress: 0, completed: 0 },
    suppliers: { total: 0, active: 0 },
    alerts: { total: 0, critical: 0, warning: 0, info: 0 }
  });

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upcomingShipments, setUpcomingShipments] = useState([]);

  // Format date time for alerts
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
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

  const fetchData = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // parallel calls to endpoints we care about
      const [
        productsRes,
        rawMaterialsRes,
        productInvRes,
        rawMatInvRes,
        suppliersRes,
        productionOrdersRes,
        alertsRes,
        inboundRes,
        outboundRes
      ] = await Promise.all([
        axios.get(`${API_URL}/product`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/raw-material`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/product-inventory`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/raw-material-inventory`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/suppliers`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/production-orders`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/alert`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/shipments/inbound`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/shipments/outbound`, { headers }).catch(() => ({ data: [] }))
      ]);

      const products = productsRes.data || [];
      const rawMaterials = rawMaterialsRes.data || [];
      const productInv = productInvRes.data || [];
      const rawMatInv = rawMatInvRes.data || [];
      const suppliers = suppliersRes.data || [];
      const productionOrders = productionOrdersRes.data || [];
      const alerts = alertsRes.data || [];
      const inbound = inboundRes.data || [];
      const outbound = outboundRes.data || [];

      // compute low stock counts for products (using product inventory)
      const productLowStock = (productInv || []).filter(pi => {
        const threshold = Number(pi.reorderThreshold ?? 0);
        return threshold > 0 && Number(pi.quantity ?? 0) <= threshold;
      }).length;

      // compute shortage for raw materials
      const rawMatShortage = (rawMatInv || []).filter(ri => {
        const threshold = Number(ri.reorderThreshold ?? 0);
        return threshold > 0 && Number(ri.quantity ?? 0) <= threshold;
      }).length;

      // inbound/outbound shipments counts
      const inboundTotal = (inbound || []).length;
      const inboundInTransit = (inbound || []).filter(s => s.status === 'IN_TRANSIT').length;
      const inboundDelayed = (inbound || []).filter(s => s.status === 'DELAYED').length;

      const outboundTotal = (outbound || []).length;
      const outboundInTransit = (outbound || []).filter(s => s.status === 'IN_TRANSIT').length;
      const outboundDelayed = (outbound || []).filter(s => s.status === 'DELAYED').length;

      // production orders counts
      const prodTotal = (productionOrders || []).length;
      const prodInProgress = (productionOrders || []).filter(po => po.status === 'IN_PROGRESS').length;
      const prodCompleted = (productionOrders || []).filter(po => po.status === 'COMPLETED').length;

      // alerts summary
      const alertsTotal = (alerts || []).length;
      const alertsCritical = (alerts || []).filter(a => a.severity === 'CRITICAL').length;
      const alertsWarning = (alerts || []).filter(a => a.severity === 'WARNING').length;
      const alertsInfo = (alerts || []).filter(a => a.severity === 'INFO').length;

      setDashboardData({
        products: { total: products.length, lowStock: productLowStock },
        rawMaterials: { total: rawMaterials.length, shortage: rawMatShortage },
        shipmentsInbound: { total: inboundTotal, inTransit: inboundInTransit, delayed: inboundDelayed },
        shipmentsOutbound: { total: outboundTotal, inTransit: outboundInTransit, delayed: outboundDelayed },
        productionOrders: { total: prodTotal, inProgress: prodInProgress, completed: prodCompleted },
        suppliers: { total: suppliers.length, active: suppliers.length },
        alerts: { total: alertsTotal, critical: alertsCritical, warning: alertsWarning, info: alertsInfo }
      });

      // recent alerts: latest 5
      const recent = (alerts || [])
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          severity: a.severity,
          alertType: a.alertType,
          entityType: a.entityType,
          entityId: a.entityId,
          entityName: a.entityName ?? String(a.entityId ?? ''),
          message: a.message,
          createdAt: a.createdAt
        }));

      setRecentAlerts(recent);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchUpcoming = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [inRes, outRes] = await Promise.all([
        axios.get(`${API_URL}/shipments/inbound`, { headers }),
        axios.get(`${API_URL}/shipments/outbound`, { headers })
      ]);
      const inbound = Array.isArray(inRes.data) ? inRes.data.map(s => ({ ...s, direction: 'INBOUND' })) : [];
      const outbound = Array.isArray(outRes.data) ? outRes.data.map(s => ({ ...s, direction: 'OUTBOUND' })) : [];
      const all = [...inbound, ...outbound];

      const upcoming = all
        .filter(s => s.departureDate && s.status === 'PLANNED') // only those with dates
        .sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate))
        .slice(0, 8);

      setUpcomingShipments(upcoming);
    } catch (err) {
      console.error('Failed to fetch upcoming shipments', err);
      setUpcomingShipments([]);
    }
  };

  fetchUpcoming();
  }, []);

// compute raw-material low-stock %
const rawLowStockPercent = dashboardData.rawMaterials.total
  ? Math.round((dashboardData.rawMaterials.shortage / dashboardData.rawMaterials.total) * 100)
  : 0;

// helper to format date
const formatShortDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

// small badge renderer for shipment status
const renderShipmentBadge = (status) => {
  switch (status) {
    case 'PLANNED':
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">PLANNED</span>;
    case 'IN_TRANSIT':
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">IN TRANSIT</span>;
    case 'DELIVERED':
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">DELIVERED</span>;
    case 'DELAYED':
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">DELAYED</span>;
    case 'CANCELLED':
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">CANCELLED</span>;
    default:
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
  }
};

  const lowStockPercent = dashboardData.products.total
  ? Math.round((dashboardData.products.lowStock / dashboardData.products.total) * 100)
  : 0;

  // Stat Card Component
  const StatCard = ({ title, value, subValue, subLabel, icon, gradient, trend, onClick }) => (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick && onClick(); }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subValue !== undefined && (
          <div className="flex items-center space-x-2 text-sm">
            <span className={`px-2 py-1 rounded-full ${subValue > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
              {subValue} {subLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Alert Card Component
  const AlertCard = ({ alert }) => {
    const config = severityConfig[alert.severity] ?? severityConfig.INFO;
    return (
      <div className={`${config.bg} ${config.border} border rounded-xl p-4 transition-all duration-200 hover:shadow-md group cursor-pointer`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.text}`}>
                {alert.severity}
              </span>
              <span className="text-xs text-gray-500">#{alert.id}</span>
              <span className="text-xs text-gray-500">{formatDateTime(alert.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 mb-2">
              <Tag className="h-3 w-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-700">
                {String(alert.alertType ?? '').replace(/_/g, ' ')}
              </span>
            </div>
            {alert.message && (
              <p className="text-sm text-gray-800 leading-relaxed mb-2 line-clamp-2">
                {alert.message}
              </p>
            )}
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Database className="h-3 w-3" />
              <span>{String(alert.entityType ?? '').replace(/_/g, ' ')}</span>
              <span className="text-gray-400">•</span>
              <span className="font-medium">{alert.entityName}</span>
            </div>
          </div>
          <Eye className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white shadow-lg">
                <Activity className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Inventory Dashboard
              </h1>
            </div>
            <p className="text-gray-600">Real-time overview of your inventory management system</p>
          </div>

          {/* <button
            onClick={() => fetchData()}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button> */}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            title="Products"
            value={dashboardData.products.total}
            subValue={dashboardData.products.lowStock}
            subLabel="low stock"
            icon={<Package className="h-6 w-6" />}
            gradient="from-blue-500 to-blue-600"
            trend="up"
            onClick={() => navigate('/products')}
          />

          <StatCard
            title="Raw Materials"
            value={dashboardData.rawMaterials.total}
            subValue={dashboardData.rawMaterials.shortage}
            subLabel="shortage"
            icon={<Boxes className="h-6 w-6" />}
            gradient="from-green-500 to-green-600"
            onClick={() => navigate('/raw-materials')}
          />

          <StatCard
            title="Inbound Shipments"
            value={dashboardData.shipmentsInbound.total}
            subValue={dashboardData.shipmentsInbound.inTransit}
            subLabel="in transit"
            icon={<Truck className="h-6 w-6" />}
            gradient="from-purple-500 to-purple-600"
            onClick={() => navigate('/inbound-shipments')}
          />

          <StatCard
            title="Outbound Shipments"
            value={dashboardData.shipmentsOutbound.total}
            subValue={dashboardData.shipmentsOutbound.inTransit}
            subLabel="in transit"
            icon={<Truck className="h-6 w-6" />}
            gradient="from-purple-400 to-purple-500"
            onClick={() => navigate('/outbound-shipments')}
          />

          <StatCard
            title="Production Orders"
            value={dashboardData.productionOrders.total}
            subValue={dashboardData.productionOrders.inProgress}
            subLabel="in progress"
            icon={<Factory className="h-6 w-6" />}
            gradient="from-orange-500 to-orange-600"
            trend="up"
            onClick={() => navigate('/production-orders')}
          />

          <StatCard
            title="Suppliers"
            value={dashboardData.suppliers.total}
            // subValue={dashboardData.suppliers.active}
            subLabel="active"
            icon={<Users className="h-6 w-6" />}
            gradient="from-cyan-500 to-cyan-600"
            onClick={() => navigate('/suppliers')}
          />
        </div>

        {/* Top small metrics (moved up) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Delayed Shipments</h3>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            {/* show combined delayed (inbound + outbound) */}
            <p className="text-2xl font-bold text-gray-900">
              {dashboardData.shipmentsInbound.delayed + dashboardData.shipmentsOutbound.delayed}
            </p>
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Completed Orders</h3>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.productionOrders.completed}</p>
            {/* <p className="text-xs text-gray-500 mt-1">This month</p> */}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Critical Alerts</h3>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.alerts.critical}</p>
            <p className="text-xs text-gray-500 mt-1">Needs immediate action</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Low Stock Rate</h3>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>

            <p className="text-2xl font-bold text-gray-900">{lowStockPercent}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {dashboardData.products.lowStock} of {dashboardData.products.total} products below threshold
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-medium text-gray-600">Raw Material Low Stock Rate</h3>
    <AlertTriangle className="h-4 w-4 text-amber-500" />
  </div>

  <p className="text-2xl font-bold text-gray-900">{rawLowStockPercent}%</p>
  <p className="text-xs text-gray-500 mt-1">
    {dashboardData.rawMaterials.shortage} of {dashboardData.rawMaterials.total} raw materials below threshold
  </p>
</div>
</div>

        {/* Main Content: Recent Alerts (kept large) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg text-white shadow-lg">
                  <Bell className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent alerts</p>
                </div>
              ) : (
                recentAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))
              )}
            </div>
          </div>

{/* Right column: Upcoming Departures */}
<div className="space-y-6">
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white shadow-lg">
          <Truck className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Upcoming Departures</h2>
      </div>
      <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1">
        <span>View All</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>

    <div className="space-y-3">
      {upcomingShipments.length === 0 ? (
        <p className="text-sm text-gray-500">No upcoming departures</p>
      ) : (
        upcomingShipments.map(s => (
          <div key={`${s.direction}-${s.id}`} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{s.referenceCode || `#${s.id}`}</p>
              <p className="text-xs text-gray-500 truncate">{s.direction} • {s.transportMode || ''}</p>
              {/* optionally show product/raw material name if present: */}
              <p className="text-xs text-gray-500 truncate">
                {s.productDto?.name || s.rawMaterialDto?.name || ''}
              </p>
            </div>

            <div className="text-right ml-4">
              <p className="text-sm font-medium text-gray-900">{formatShortDate(s.departureDate)}</p>
              <div className="mt-1">{renderShipmentBadge(s.status)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>

  {/* You can add other compact widgets here if you want to stack more content */}
</div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
