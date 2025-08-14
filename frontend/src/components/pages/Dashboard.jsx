import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Factory, 
  Users, 
  Search, 
  Filter, 
  ChevronDown,
  Bell,
  Settings,
  Home,
  Package2,
  Boxes,
  Component,
  Archive,
  ArrowUpCircle,
  ArrowDownCircle,
  Building2,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

const Dashboard = () => {
    
  const dashboardStats = {
    totalProducts: 1247,
    lowStockItems: 23,
    activeOrders: 45,
    pendingShipments: 12,
    criticalAlerts: 8
  };

    const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

    const recentAlerts = [
    { id: 1, type: 'LOW_STOCK', severity: 'MEDIUM', entity: 'Product', entityId: 'PRD-001', timestamp: '2 hours ago' },
    { id: 2, type: 'SHIPMENT_DELAYED', severity: 'MEDIUM', entity: 'Shipment', entityId: 'SHP-045', timestamp: '4 hours ago' },
    { id: 3, type: 'RAW_MATERIAL_SHORTAGE', severity: 'HIGH', entity: 'RawMaterial', entityId: 'RM-089', timestamp: '6 hours ago' },
    { id: 4, type: 'PRODUCTION_CANCELLED', severity: 'HIGH', entity: 'ProductionOrder', entityId: 'PO-234', timestamp: '1 day ago' }
  ];

    const getAlertTypeDisplay = (type) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

    return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalProducts}</p>
            </div>
            <Package2 className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">{dashboardStats.lowStockItems}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-green-600">{dashboardStats.activeOrders}</p>
            </div>
            <Factory className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Shipments</p>
              <p className="text-2xl font-bold text-purple-600">{dashboardStats.pendingShipments}</p>
            </div>
            <Truck className="h-12 w-12 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{dashboardStats.criticalAlerts}</p>
            </div>
            <Bell className="h-12 w-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getAlertTypeDisplay(alert.type)}</p>
                    <p className="text-sm text-gray-600">{alert.entity} {alert.entityId}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;