import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from './CartContext';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { cart, addToCart, removeFromCart } = useContext(CartContext);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  if (!products.length) {
    return <p className="text-center mt-5">Loading products…</p>;
  }

  return (
    <div className="row">
      {products.map(p => {
        const cartItem = cart.find(item => item._id === p._id);
        const qty = cartItem ? cartItem.qty : 0;
        return (
          <div className="col-md-4 mb-4" key={p._id}>
            <div className="card h-100">
            <div
  style={{
    border: '1px solid #555',
    borderRadius: '8px',
    padding: '6px',
    margin: '15px',
    backgroundColor: '#1e1e1e'
  }}
>
  <img
    src={p.imageUrl}
    className="img-fluid"
    alt={p.name}
    style={{ borderRadius: '4px', width: '100%' }}
  />
</div>

              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text">₹{p.price}</p>
                <p className="card-text">In stock: {p.stock}</p>
                <div className="mt-auto">
                  {qty > 0 ? (
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-sm btn-secondary me-2"
                        onClick={() => removeFromCart(p._id)}
                        disabled={qty <= 0}
                      >
                        –
                      </button>
                      <span>{qty}</span>
                      <button
                        className="btn btn-sm btn-secondary ms-2"
                        onClick={() => addToCart(p)}
                        disabled={qty >= p.stock}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
  className="btn btn-sm btn-warning text-dark fw-bold"
  onClick={() => addToCart(p)}
  disabled={p.stock <= 0}
>
  Add to Cart
</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
