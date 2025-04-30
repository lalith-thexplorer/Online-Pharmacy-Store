import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);

  const fetchOrders = () => {
    console.log("Fetching all orders as admin...");

    fetch('http://localhost:5000/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async res => {
        const data = await res.json();
        console.log("Response from /api/orders:", res.status, data);

        if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching admin orders:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    window.addEventListener('ordersUpdated', fetchOrders);
    return () => window.removeEventListener('ordersUpdated', fetchOrders);
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o._id === id ? { ...o, status: newStatus } : o))
    );
  };

  const handleUpdate = async id => {
    const order = orders.find(o => o._id === id);
    if (!order) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: order.status })
      });
      const data = await res.json();
      console.log('PUT response:', data);
      if (!res.ok) throw new Error('Update failed');

      fetchOrders();
      window.dispatchEvent(new Event('ordersUpdated'));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) return <p className="mt-4">Loading admin orders…</p>;
  if (!orders.length) return <p className="mt-4">No orders to manage.</p>;

  return (
    <div className="mt-5">
      <div className="card bg-dark border border-secondary shadow-sm p-3 mb-5">
      <h3 className="text-warning">Admin: Manage Orders</h3>
      <div className="table-responsive">
        <table className="table table-dark table-bordered border-secondary align-middle">
          <thead className="table-dark text-warning">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Name & Address</th>
              <th>Items</th>
              <th>Status</th>
              <th>Change To</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td>{o._id}</td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>
                  {o.userInfo?.name || 'N/A'}<br />
                  <small>{o.userInfo?.address || 'No address'}</small>
                </td>
                <td>
                  {o.items.map(i => (
                    <div key={i._id}>{i.name} ×{i.qty}</div>
                  ))}
                </td>
                <td><span className="text-info">{o.status}</span></td>
                <td>
                  <select
                    className="form-select form-select-sm bg-dark text-white border-secondary"
                    value={o.status}
                    onChange={e => handleStatusChange(o._id, e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleUpdate(o._id)}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
