// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      setToken(data.token);
      setRole(data.role);
    }
    setLoading(false);
    return { ok: res.ok, error: data.error };
  };

  const signup = async (email, password, name, address) => {
    setLoading(true);
    const res = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, address }) 
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'user');
      setToken(data.token);
      setRole('user');
    }
    setLoading(false);
    return { ok: res.ok, error: data.error };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  // attach token to global fetch
  useEffect(() => {
    if (token) {
      window.auth = { token, role };
    }
  }, [token, role]);

  return (
    <AuthContext.Provider value={{ token, role, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
