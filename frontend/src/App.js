import React, { useContext, useState } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { CartProvider } from './components/CartContext';


function AppContent() {
  const { token, role } = useContext(AuthContext);
  const [showSignup, setShowSignup] = useState(false);

  if (!token) {
    return showSignup
      ? <Signup switchToLogin={() => setShowSignup(false)} />
      : <Login switchToSignup={() => setShowSignup(true)} />;
  }
  return role === 'admin'
  ? <AdminDashboard />
  : (
      <CartProvider>
        <UserDashboard />
      </CartProvider>
    );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


