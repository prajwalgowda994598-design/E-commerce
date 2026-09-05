import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const INITIAL_ADDRESS = {
  fullName: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  phoneNumber: '',
};

export default function CheckoutPage() {
  const { cart, total, fetchCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(INITIAL_ADDRESS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go shopping
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) =>
    setShippingAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress });
      await fetchCart(); // clear cart in UI
      showToast('Order placed successfully');
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Checkout</h1>
      <div className="checkout-layout">

        {/* Shipping form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Shipping address</h2>

          {error && <div className="alert alert-error">{error}</div>}

          {[
            { name: 'fullName', label: 'Full name', placeholder: 'Jane Doe' },
            { name: 'address', label: 'Street address', placeholder: '123 Main St' },
            { name: 'city', label: 'City', placeholder: 'New York' },
            { name: 'postalCode', label: 'Postal / ZIP code', placeholder: '10001' },
            { name: 'country', label: 'Country', placeholder: 'United States' },
            { name: 'phoneNumber', label: 'Phone number', placeholder: '+1 555 123 4567', type: 'tel' },
          ].map(({ name, label, placeholder }) => (
            <div className="form-group" key={name}>
              <label htmlFor={name}>{label}</label>
              <input
                id={name}
                name={name}
                type={name === 'phoneNumber' ? 'tel' : 'text'}
                placeholder={placeholder}
                value={shippingAddress[name]}
                onChange={handleChange}
                required
                pattern={name === 'phoneNumber' ? '\\+?[0-9 ()-]{7,20}' : undefined}
              />
            </div>
          ))}

          <div className="form-group">
            <label>Payment</label>
            <div className="mock-payment">
              💳 Mock payment — no real charge
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Placing order…' : `Place order — $${total.toFixed(2)}`}
          </button>
        </form>

        {/* Order summary */}
        <aside className="checkout-summary">
          <h2>Order summary</h2>
          <ul className="summary-list">
            {items.map((item) => (
              <li key={item.product?._id} className="summary-item">
                <span>
                  {item.product?.name} × {item.quantity}
                </span>
                <span>${((item.product?.price ?? 0) * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
