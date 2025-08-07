import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const ProtectedRoute = ({ allowedRoles = [] }) => {

    const [status, setStatus] = useState('checking'); 

    useEffect(()=>{
        const check = async ()=>{
            const jwt = localStorage.getItem('jwt');
            if(!jwt){
                console.log("invalid 1");
                setStatus('invalid')
                return;
            }
            const valid = await verifyJwt(jwt);
            if(!valid) {
                console.log("invalid 2");
                setStatus('invalid')
                return;
            }
            try {
            const user = await axios.post("http://localhost:8080/user/byjwt",
                {token : jwt},
                { headers : { Authorization : `Bearer ${jwt}` } }
            );
            const role = user.data.role;
            console.log("retreived role : "+role);
            if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
                setStatus('unauthorized');
                return;
            } } catch (error) {
                console.log("invalid 3");
                console.log(error)
                setStatus('invalid');
                return;
            }
            setStatus('ok');
        };
        check();
    },[allowedRoles]);

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
    
  if (status === 'checking') {
    return <div>Loading…</div>;
  }

  if (status === 'invalid') {
    console.log("hello you are being redirected to login lol")
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (status === 'unauthorized') {
    return <Navigate to="/dashboard" replace />;
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
