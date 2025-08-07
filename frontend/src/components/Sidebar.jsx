import React, { useContext, useEffect } from 'react'
import { AppContext } from '../App';
import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const navItems = [
        { label: 'Dashboard', path: '/dashboard', roles: ['LOGISTICS', 'ADMIN'] },
        { label: 'ProductsPage',   path: '/products',   roles: ['LOGISTICS', 'ADMIN'] },
        { label: 'InventoryPage',   path: '/inventory',   roles: ['LOGISTICS', 'ADMIN'] },
        { label: 'ShipmentsPage',   path: '/shipments',   roles: ['LOGISTICS', 'ADMIN'] },
        { label: 'UsersPage',     path: '/users',     roles: ['ADMIN'] },
    ];
    
    const links = navItems.filter(item =>
        item.roles.includes(user?.role)
    );

  return (
    <aside style={{ width: 240, background: '#f8f9fa', padding: '1rem' }}>
      {links.map(({ label, path }) => (
        <NavLink
          key={path}
          to={path} // mark dashboard exact
          style={({ isActive }) => ({
            display: 'block',
            margin: '0.5rem 0',
            padding: '0.5rem 1rem',
            borderRadius: 4,
            background: isActive ? '#007bff' : 'transparent',
            color: isActive ? '#fff' : '#333',
            textDecoration: 'none',
          })}
        >
          {label}
        </NavLink>
      ))}
    </aside>
  )
}
