import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const STATUS_COLOR = {
  pending: '#f59e0b',
  shipped: '#3b82f6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders/myorders')
      .then(({ data }) => setOrders(data.orders || data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="page">
      <h1 className="page-title">Order History</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 && !error ? (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="btn-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card-header">
                <div>
                  <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="order-meta">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: STATUS_COLOR[order.status] }}
                  >
                    {order.status}
                  </span>
                  <span className="order-total">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="order-items-preview">
                {order.orderItems.slice(0, 3).map((item, i) => (
                  <span key={i}>
                    {item.name} × {item.quantity}
                    {i < Math.min(order.orderItems.length - 1, 2) ? ', ' : ''}
                  </span>
                ))}
                {order.orderItems.length > 3 && (
                  <span> and {order.orderItems.length - 3} more…</span>
                )}
              </div>
              <Link to={`/orders/${order._id}`} className="btn-secondary btn-sm">
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
