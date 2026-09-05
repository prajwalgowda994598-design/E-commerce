import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, loading, error, updateItem, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const items = cart.items || [];

  return (
    <div className="page">
      <h1 className="page-title">Your Cart</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-primary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-table">
            <div className="cart-header">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Subtotal</span>
              <span></span>
            </div>

            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div className="cart-row" key={product._id}>
                  <div className="cart-product">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/80'}
                      alt={product.name}
                    />
                    <Link to={`/products/${product._id}`}>{product.name}</Link>
                  </div>
                  <span className="cart-price">${product.price.toFixed(2)}</span>
                  <div className="qty-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateItem(product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="qty-num">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateItem(product._id, item.quantity + 1)}
                      disabled={item.quantity >= product.stockQuantity}
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-subtotal">
                    ${(product.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className="btn-danger-sm"
                    onClick={() => removeItem(product._id)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="cart-actions">
              <Link to="/" className="btn-secondary">
                Continue shopping
              </Link>
              <button
                className="btn-primary"
                onClick={() => navigate('/checkout')}
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
