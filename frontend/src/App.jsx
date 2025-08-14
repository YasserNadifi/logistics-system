import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Import your page components
import Dashboard from './components/pages/Dashboard';
import ProductsPage from './components/pages/ProductsPage';
import LoginPage from './components/pages/LoginPage';
import { UsersPage } from './components/pages/UsersPage';
import RawMaterialsPage from './components/pages/RawMaterialsPage';
import ProductInventory from './components/pages/ProductInventory';
// import RawMaterialInventoryPage from './components/pages/RawMaterialInventory';
import RawMaterialInventory from './components/pages/RawMaterialInventory';
import InboundShipmentsPage from './components/pages/InboundShipmentsPage';
import OutboundShipmentsPage from './components/pages/OutboundShipmentsPage';

const AuthContext = React.createContext();

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };


  const setJwt = (jwt)=>{
    localStorage.setItem("jwt",jwt);
  }

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setJwt, login, logout }}>
      <Router>
        <AppContent user={user} />
      </Router>
    </AuthContext.Provider>
  );
};

// This component handles the routing logic
const AppContent = ({ user }) => {
  const location = useLocation();

  return (
    <Routes>
      {/* Public route - Login page without layout */}
      <Route 
        path="/login" 
        element={
          user ? <Navigate to="/" replace /> : <LoginPage />
        } 
      />
      
      {/* Protected routes with layout */}
      <Route path="/*" element={
        <ProtectedRoute user={user}>
          <LayoutWrapper user={user} />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

// Layout wrapper component for protected routes
const LayoutWrapper = ({ user }) => {
  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Dashboard userRole={user?.role} />} />
        
        <Route path="/products" element={<ProductsPage userRole={user?.role} />} />

        <Route path="/raw-materials" element={<RawMaterialsPage userRole={user?.role} />} />
        <Route path="/product-inventory" element={<ProductInventory userRole={user?.role} />} />
        <Route path="/raw-material-inventory" element={<RawMaterialInventory userRole={user?.role} />} />
        <Route path="/inbound-shipments" element={<InboundShipmentsPage userRole={user?.role} />} />
        <Route path="/outbound-shipments" element={<OutboundShipmentsPage userRole={user?.role} />} />
        

        {/* Add more protected routes here */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute user={user} requiredRole="ADMIN">
              <UsersPage/>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
export { AuthContext };