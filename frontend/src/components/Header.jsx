import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          ShopMERN
        </Link>

        <nav className="nav">
          <Link to="/">Shop</Link>

          {user ? (
            <>
              <Link to="/cart" className="cart-link">
                Cart
                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </Link>
              <Link to="/orders">Orders</Link>
              {user.isAdmin && <Link to="/admin">Admin</Link>}
              <span className="nav-name">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
