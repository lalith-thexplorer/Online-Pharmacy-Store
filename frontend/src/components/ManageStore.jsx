import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function ManageStore() {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name:'', price:'', imageUrl:'', stock:'' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch('http://localhost:5000/api/admin/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => { load() }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const isNew = !form._id;
    const url = isNew
      ? '/api/admin/products'
      : `/api/admin/products/${form._id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch('http://localhost:5000' + url, {
      method,
      headers: {
        'Content-Type':'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        ...(form.stock !== '' && { stock: Number(form.stock) })
      })
    });
    if (res.ok) {
      setForm({ name:'', price:'', imageUrl:'', stock:'' });
      await load();
    } else {
      console.error(await res.json());
    }
    setLoading(false);
  };

  const edit = p => setForm({
    _id: p._id,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
  
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      console.log("Delete response:", data);
  
      if (res.ok) {
        await load(); // reload product list
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert('Network error while deleting product.');
    }
  };

  return (
    <div className="text-white">
      <h4 className="text-warning">{form._id ? 'Update' : 'Add'} Product</h4>
      <form onSubmit={handleSubmit} className="row g-2 mb-4 bg-dark p-3 rounded border border-secondary">
        <div className="col-md-3">
          <input
            className="form-control bg-dark text-white border-secondary"
            placeholder="Name"
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}
            required
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Price"
            value={form.price}
            onChange={e=>setForm({...form,price:e.target.value})}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            className="form-control bg-dark text-white border-secondary"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={e=>setForm({...form,imageUrl:e.target.value})}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Stock"
            value={form.stock}
            onChange={e=>setForm({...form,stock:e.target.value})}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-warning text-dark fw-bold w-100" disabled={loading}>
            {form._id ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
      <div className="card bg-dark border border-secondary shadow-sm p-3 mb-5">
      <h4 className="text-warning">Current Products</h4>
      <div className="table-responsive">
        <table className="table table-dark table-bordered border-secondary">
          <thead>
            <tr><th>Name</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
                <td>
                <div className="d-flex gap-2">
    <button
      className="btn btn-sm btn-primary"
      onClick={() => edit(p)}
    >
      Edit
    </button>
    <button
      className="btn btn-sm btn-danger"
      onClick={() => handleDelete(p._id)}
    >
      Delete
    </button>
  </div>
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