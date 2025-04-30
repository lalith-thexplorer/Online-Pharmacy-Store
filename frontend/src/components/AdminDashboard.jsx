import React, { useState, useContext } from 'react';
import ManageStore from './ManageStore';
import ManageOrders from './ManageOrders';
import { AuthContext } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const [tab, setTab] = useState('store');
  const { logout } = useContext(AuthContext);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff' }}>
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Panel</h1>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${tab==='store'?'active':''}`} onClick={()=>setTab('store')}>Manage Store</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab==='orders'?'active':''}`} onClick={()=>setTab('orders')}>Manage Orders</button>
        </li>
      </ul>
      <div className="mt-4">
        {tab==='store' ? <ManageStore /> : <ManageOrders />}
      </div>
    </div>
    </div>
);
}
