import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
    window.addEventListener('ordersUpdated', fetchOrders);
    return () => window.removeEventListener('ordersUpdated', fetchOrders);
  }, [token]);

  if (loading) return <p className="mt-4">Loading order history…</p>;
  if (!orders.length) return <p className="mt-4">No orders found.</p>;

  return (
    <div className="mt-5">
      <h3 className="text-warning">Order History</h3>
      {orders.map(order => (
        <div key={order._id} className="card bg-dark text-white border border-secondary mb-3">
          <div className="card-header">
            <strong>Order ID:</strong> {order._id} &nbsp;|&nbsp;
            <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()} &nbsp;|&nbsp;
            <strong>Status:</strong> <span className="text-info">{order.status}</span>
          </div>
          <div className="card-body">
            <ul className="list-group list-group-flush">
              {order.items.map(item => (
                <li key={item._id} className="list-group-item bg-dark text-white d-flex justify-content-between border-secondary">
                  <span>{item.name} (×{item.qty})</span>
                  <span>₹{item.price * item.qty}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
