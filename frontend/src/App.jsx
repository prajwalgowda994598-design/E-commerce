import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />

                {/* Protected user routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                </Route>

                {/* Admin routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                </Route>

                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
