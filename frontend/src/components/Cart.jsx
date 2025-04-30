import React, { useContext, useState } from 'react';
import { CartContext } from './CartContext';
import { AuthContext } from '../contexts/AuthContext';

export default function Cart() {
  const { cart, addToCart, removeFromCart, setCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const [message, setMessage] = useState('');

  if (cart.length === 0) {
    return <p className="mt-4">Your cart is empty.</p>;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handlePlaceOrder = async () => {
    if (!token) {
      setMessage('Please log in to place an order.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: cart })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Order placed! ID: ${data.orderId}`);
        setCart([]);
      } else {
        setMessage(data.error || 'Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error placing order.');
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-warning">Cart</h3>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row">
        {cart.map(item => (
          <div className="col-md-6 mb-3" key={item._id}>
            <div className="card bg-dark text-white border border-secondary h-100 p-3">
              <h5>{item.name}</h5>
              <p>Price: ₹{item.price}</p>
              <p>Quantity: {item.qty}</p>
              <p>Subtotal: ₹{item.price * item.qty}</p>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => removeFromCart(item._id)}
                  disabled={item.qty <= 0}
                >
                  –
                </button>
                <span>{item.qty}</span>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => addToCart(item)}
                  disabled={item.qty >= item.stock}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <strong>Total: ₹{total}</strong>
        <button className="btn btn-warning text-dark fw-bold" onClick={handlePlaceOrder}>
          Place Order
        </button>
      </div>
    </div>
  );
}
