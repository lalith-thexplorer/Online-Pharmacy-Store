import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function Signup({ switchToLogin }) {
  const { signup, loading } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    address: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    const { ok, error } = await signup(form.email, form.password, form.name, form.address);
    if (!ok) setError(error);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', backgroundColor: '#121212', width: '100vw' }}
    >
      <div className="card p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 text-warning">Sign Up</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              style={{ backgroundColor: '#1e1e1e', color: '#fff', borderColor: '#555' }}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              style={{ backgroundColor: '#1e1e1e', color: '#fff', borderColor: '#555' }}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              style={{ backgroundColor: '#1e1e1e', color: '#fff', borderColor: '#555' }}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea
              className="form-control"
              style={{ backgroundColor: '#1e1e1e', color: '#fff', borderColor: '#555' }}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              rows={2}
              required
            />
          </div>
          <button className="btn btn-primary w-100" disabled={loading}>
            Sign Up
          </button>
        </form>
        <p className="mt-3 text-center">
          Already have an account?{' '}
          <button className="btn btn-link p-0 text-warning" onClick={switchToLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}