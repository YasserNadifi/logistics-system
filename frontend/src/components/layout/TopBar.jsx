import React from 'react';
import { 
  Menu,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

const TopBar = ({ 
  userRole, 
  onSidebarToggle, 
  alertCount = 8,
  currentPageTitle 
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-30">
      <div className="flex items-center justify-between h-16 px-6">
        
        {/* Left Side - Mobile Menu & Page Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Page Title - shown on mobile when sidebar is closed */}
          {currentPageTitle && (
            <h2 className="lg:hidden text-lg font-semibold text-gray-900">
              {currentPageTitle}
            </h2>
          )}
        </div>

        {/* Right Side - Actions & User Menu */}
        <div className="flex items-center space-x-4">


          {/* Notifications */}
          <div className="relative">
            <button className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100">
              <Bell className="h-6 w-6" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>
          </div>

          {/* Settings */}
          <button className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100">
            <Settings className="h-6 w-6" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">john.doe@company.com</p>
                  <p className="text-xs text-blue-600 font-medium">{userRole} User</p>
                </div>
                
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile Settings</span>
                </button>
                
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Preferences</span>
                </button>
                

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;