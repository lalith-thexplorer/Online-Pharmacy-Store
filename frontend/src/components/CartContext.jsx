import React, { createContext, useState } from 'react';

// Create context
export const CartContext = createContext();

// Provider component
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Add an item (or increase qty if already in cart)
  function addToCart(product) {
    setCart(prev => {
      const idx = prev.findIndex(p => p._id === product._id);
      if (idx >= 0) {
        // already in cart: increment qty
        const updated = [...prev];
        updated[idx].qty += 1;
        return updated;
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  }

  // Remove one unit (or remove item entirely)
  function removeFromCart(productId) {
    setCart(prev => {
      return prev
        .map(p => 
          p._id === productId ? { ...p, qty: p.qty - 1 } : p
        )
        .filter(p => p.qty > 0);
    });
  }

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}
