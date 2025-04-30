import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function Login({ switchToSignup }) {
  const { login, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    const { ok, error } = await login(email, password);
    if (!ok) setError(error);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', backgroundColor: '#121212', width: '100vw' }}
    >
      <div className="card p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 text-warning">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              style={{ backgroundColor: '#1e1e1e', color: '#fff', borderColor: '#555' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              style={{ backgroundColor: '#1e1e1e', color: '#fff', borderColor: '#555' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100" disabled={loading}>
            Login
          </button>
        </form>
        <p className="mt-3 text-center">
          New here?{' '}
          <button className="btn btn-link p-0 text-warning" onClick={switchToSignup}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}