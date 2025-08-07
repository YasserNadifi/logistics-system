import { createContext, use, useState } from 'react'
import {BrowserRouter,Routes,Route}  from 'react-router-dom'
// import './App.css'
import { Login } from './components/Login'
import { RegisterPage } from './components/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './components/DashboardPage';
import { ProductsPage } from './components/ProductsPage';
import { InventoryPage } from './components/InventoryPage';
import { ShipmentsPage } from './components/ShipmentsPage';
import { UsersPage } from './components/UsersPage';

export const AppContext = createContext();

function App() {
  
  const [jwt,setJwt]=useState("");
  const [user,setUser]=useState(null);

  return (
    <>
      <AppContext.Provider value={{jwt, setJwt,user,setUser}} >
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path='/register' element={<RegisterPage/>} />
            <Route element={<ProtectedRoute/>}>
              <Route path="/dashboard" element={<DashboardPage/>}/>
              <Route path="/products" element={<ProductsPage/>}/>
              <Route path="/inventory" element={<InventoryPage/>}/>
              <Route path="/shipments" element={<ShipmentsPage/>}/>
              <Route path="/users" element={<UsersPage/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppContext.Provider>
    </>
  )
}

export default App
