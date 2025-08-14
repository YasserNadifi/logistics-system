import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
// TopBar import removed

const Layout = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname.slice(1); // Remove leading slash
    return path || 'dashboard';
  };

  // Handle page navigation
  const handlePageChange = (pageId) => {
    const routes = {
      'dashboard': '/',
      'products': '/products',
      'product-inventory': '/product-inventory',
      'raw-materials': '/raw-materials',
      'raw-material-inventory': '/raw-material-inventory',
      'inbound-shipments': '/inbound-shipments',
      'outbound-shipments': '/outbound-shipments',
      'production-orders': '/production-orders',
      'suppliers': '/suppliers',
      'users': '/users',
      'alerts': '/alerts'
    };
    
    navigate(routes[pageId] || '/');
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentPage={getCurrentPage()}
        onPageChange={handlePageChange}
        userRole={user?.role}
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        alertCount={8} // Moved from TopBar
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar component removed */}
        
        {/* Page Content - now takes full height */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Mobile menu button for when sidebar is closed */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 bg-white shadow-lg p-2 rounded-md border border-gray-200"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;