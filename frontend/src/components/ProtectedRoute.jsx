import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const ProtectedRoute = () => {

    const [isJwtValid,setIsJwtValid]=useState(null);

    useEffect(()=>{
        const checkJwt = async ()=>{
            const jwt = localStorage.getItem('jwt');
            if(!jwt){
                setIsJwtValid(false);
                return;
            }
            const valid = await verifyJwt(jwt);
            console.log("verifyJwt(token) returned:", valid);
            setIsJwtValid(valid);
        }
        checkJwt();
    },[]);

    const verifyJwt = async (token)=>{
        try {
            const response = await axios.post(
                "http://localhost:8080/verifyJwt",
                { token : token },
                { header : { 'Content-Type': 'application/json' } }
            );
            if (response.data.token=='valid'){
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
    if (isJwtValid === null) {
      return <div>Loading...</div>;
    }
  if (!isJwtValid) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        <Topbar />
        <div style={{ display: 'flex', flex: 1 }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '1rem' }}>
                <Outlet />
            </main>
        </div>
    </div>
  );
}
