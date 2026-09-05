import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (err) {
      setCart({ items: [] });
      setError(err.response?.data?.message || 'Could not load your cart.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart', { productId, quantity });
    setCart(data);
  };

  const updateItem = async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setCart(data);
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data);
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart({ items: [] });
  };

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const total = cart.items.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
