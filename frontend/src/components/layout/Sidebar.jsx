import React, { useContext, useEffect, useRef } from 'react';
import { 
  Home,
  Package2,
  Package,
  Component,
  Archive,
  ArrowUpCircle,
  ArrowDownCircle,
  Factory,
  Building2,
  UserCheck,
  Bell,
  Users,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuthContext } from '../../App';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ 
  currentPage, 
  onPageChange, 
  userRole, 
  isOpen, 
  onClose
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const userMenuRef = useRef(null);

  const {logout, user} = useContext(AuthContext);
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, restricted: false },
    { id: 'products', label: 'Products', icon: Package2, restricted: false },
    { id: 'product-inventory', label: 'Product Inventory', icon: Package, restricted: false },
    { id: 'raw-materials', label: 'Raw Materials', icon: Component, restricted: false },
    { id: 'raw-material-inventory', label: 'Raw Material Inv. ', icon: Archive, restricted: false },
    { id: 'inbound-shipments', label: 'Inbound Shipments', icon: ArrowDownCircle, restricted: false },
    { id: 'outbound-shipments', label: 'Outbound Shipments', icon: ArrowUpCircle, restricted: false },
    { id: 'production-orders', label: 'Production Orders', icon: Factory, restricted: false },
    { id: 'suppliers', label: 'Suppliers', icon: Building2, restricted: false },
    { id: 'alerts', label: 'Alerts', icon: Bell, restricted: false },
    { id: 'users', label: 'Users', icon: UserCheck, restricted: true },
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleNavigation = (pageId, isRestricted) => {
    if (!isRestricted) {
      onPageChange(pageId);
      onClose(); // Close sidebar on mobile after navigation
    }
  };

  const handleUserMenuAction = (action) => {
    setShowUserMenu(false);
    if (action === 'profile') {
      navigate("/user-profile");
    } else if (action === 'logout') {
      logout();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 font-jetbrains">Logistics<br/>
          System</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isRestricted = item.restricted && userRole !== 'ADMIN';
              const Icon = item.icon;
              if(!isRestricted){
              return  (
                (<button
                  key={item.id}
                  onClick={() => handleNavigation(item.id, isRestricted)}
                  disabled={isRestricted}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : isRestricted
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>)
              );}
            })}
          </div>
        </nav>

        {/* User Info Section */}
        <div className="border-t border-gray-200 relative" ref={userMenuRef}>
          {/* User Menu Overlay Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-t-lg shadow-lg z-60">
              <div className="p-2">
                <button 
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2 mb-1"
                  onClick={() => handleUserMenuAction('profile')}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                
                {/* <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2 mb-1">
                  <Settings className="h-4 w-4" />
                  <span>Preferences</span>
                </button> */}

                <button 
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                  onClick={() => handleUserMenuAction('logout')}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
          
          {/* User Info Button */}
          <div className="p-4">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 text-left hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-600">Role: {userRole}</p>
              </div>
              {showUserMenu ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;