import React, { useState, useContext } from 'react';
import ProductList from './ProductList';
import OrderHistory from './OrderHistory';
import Cart from './Cart';
import { AuthContext } from '../contexts/AuthContext';

export default function UserDashboard() {
  const [tab, setTab] = useState('products');
  const { logout, token, role } = useContext(AuthContext);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff' }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-warning">Bhaai's Pharmacy</h1>
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        </div>

        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'products' ? 'active' : ''}`}
              onClick={() => setTab('products')}
            >
              Products
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'cart' ? 'active' : ''}`}
              onClick={() => setTab('cart')}
            >
              Cart
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'orders' ? 'active' : ''}`}
              onClick={() => setTab('orders')}
            >
              My Orders
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === 'profile' ? 'active' : ''}`}
              onClick={() => setTab('profile')}
            >
              Profile
            </button>
          </li>
        </ul>

        <div className="mt-4">
          {tab === 'products' && <ProductList />}
          {tab === 'cart' && <Cart />}
          {tab === 'orders' && <OrderHistory />}
          {tab === 'profile' && (
            <div className="card p-3 bg-dark text-white border border-secondary">
              <h3 className="text-warning">Profile</h3>
              <p><strong>Role:</strong> {role}</p>
              <p><strong>Email:</strong> {token && JSON.parse(atob(token.split('.')[1])).email}</p>
              <p><strong>Name:</strong> {token && JSON.parse(atob(token.split('.')[1])).name}</p>
              <p><strong>Address:</strong> {token && JSON.parse(atob(token.split('.')[1])).address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
