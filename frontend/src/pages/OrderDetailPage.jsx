import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const STATUS_COLOR = {
  pending: '#f59e0b',
  shipped: '#3b82f6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Order not found or access denied.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!order) return null;

  const { shippingAddress: addr } = order;

  return (
    <div className="page">
      <Link to="/orders" className="back-link">← Back to orders</Link>
      <h1 className="page-title">
        Order #{order._id.slice(-8).toUpperCase()}
      </h1>

      <div className="order-detail-layout">
        <div className="order-detail-main">
          <div className="card">
            <h2>Items ordered</h2>
            {order.orderItems.map((item, i) => (
              <div className="order-line" key={i}>
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/60'}
                  alt={item.name}
                />
                <div className="order-line-info">
                  <p className="order-line-name">{item.name}</p>
                  <p className="order-line-qty">Qty: {item.quantity}</p>
                </div>
                <span className="order-line-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="order-detail-side">
          <div className="card">
            <h2>Status</h2>
            <span
              className="status-badge"
              style={{ backgroundColor: STATUS_COLOR[order.status] }}
            >
              {order.status}
            </span>
            <p style={{ marginTop: '0.5rem' }}>
              Payment: <strong>{order.paymentStatus}</strong>
            </p>
          </div>

          <div className="card">
            <h2>Shipping address</h2>
            <p>{addr.fullName}</p>
            <p>{addr.address}</p>
            <p>
              {addr.city}, {addr.postalCode}
            </p>
            <p>{addr.country}</p>
            {addr.phoneNumber && <p>{addr.phoneNumber}</p>}
          </div>

          <div className="card">
            <h2>Summary</h2>
            <div className="summary-total">
              <span>Total paid</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
