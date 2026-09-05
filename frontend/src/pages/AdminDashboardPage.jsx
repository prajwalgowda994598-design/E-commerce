import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EMPTY_PRODUCT = {
  name: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
  stockQuantity: '',
};

const ORDER_STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLOR = {
  pending: '#f59e0b',
  shipped: '#3b82f6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('products');

  // --- Products state ---
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodError, setProdError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // --- Orders state ---
  const [orders, setOrders] = useState([]);
  const [ordLoading, setOrdLoading] = useState(true);
  const [ordError, setOrdError] = useState('');

  useEffect(() => {
    if (tab === 'products') fetchProducts();
    if (tab === 'orders') fetchOrders();
  }, [tab]);

  const fetchProducts = async () => {
    setProdLoading(true);
    setProdError('');
    try {
      const { data } = await api.get('/products?limit=50');
      setProducts(data.products);
    } catch {
      setProdError('Failed to load products');
    } finally {
      setProdLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdLoading(true);
    setOrdError('');
    try {
      const { data } = await api.get('/orders');
      setOrders(data.orders || data);
    } catch {
      setOrdError('Failed to load orders');
    } finally {
      setOrdLoading(false);
    }
  };

  // Product form handlers
  const openNew = () => {
    setEditProduct(null);
    setForm(EMPTY_PRODUCT);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, form);
      } else {
        await api.post('/products', form);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      alert('Delete failed');
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
    } catch {
      alert('Status update failed');
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${tab === 'products' ? 'active' : ''}`}
          onClick={() => setTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-btn ${tab === 'orders' ? 'active' : ''}`}
          onClick={() => setTab('orders')}
        >
          Orders
        </button>
      </div>

      {/* ====== PRODUCTS TAB ====== */}
      {tab === 'products' && (
        <div>
          <div className="admin-bar">
            <p>{products.length} products</p>
            <button className="btn-primary" onClick={openNew}>
              + Add product
            </button>
          </div>

          {prodLoading && <div className="spinner-wrap"><div className="spinner" /></div>}
          {prodError && <div className="alert alert-error">{prodError}</div>}

          {!prodLoading && products.length === 0 && (
            <div className="empty-state"><p>No products yet. Add one!</p></div>
          )}

          {!prodLoading && products.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={p.imageUrl || 'https://via.placeholder.com/50'}
                          alt={p.name}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                        />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>{p.stockQuantity}</td>
                      <td>
                        <button className="btn-secondary btn-sm" onClick={() => openEdit(p)}>
                          Edit
                        </button>{' '}
                        <button className="btn-danger-sm" onClick={() => handleDelete(p._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Product Form Modal */}
          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{editProduct ? 'Edit product' : 'New product'}</h2>
                {formError && <div className="alert alert-error">{formError}</div>}
                <form onSubmit={handleFormSubmit}>
                  {[
                    { name: 'name', label: 'Name', type: 'text' },
                    { name: 'description', label: 'Description', type: 'text' },
                    { name: 'price', label: 'Price ($)', type: 'number' },
                    { name: 'category', label: 'Category', type: 'text' },
                    { name: 'imageUrl', label: 'Image URL', type: 'url', required: false },
                    { name: 'stockQuantity', label: 'Stock Quantity', type: 'number' },
                  ].map(({ name, label, type, required = true }) => (
                    <div className="form-group" key={name}>
                      <label htmlFor={name}>{label}</label>
                      <input
                        id={name}
                        name={name}
                        type={type}
                        value={form[name]}
                        onChange={handleFormChange}
                        required={required}
                        min={type === 'number' ? 0 : undefined}
                        step={name === 'price' ? '0.01' : '1'}
                      />
                    </div>
                  ))}
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={formLoading}>
                      {formLoading ? 'Saving…' : editProduct ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== ORDERS TAB ====== */}
      {tab === 'orders' && (
        <div>
          <p className="admin-bar">{orders.length} orders</p>
          {ordLoading && <div className="spinner-wrap"><div className="spinner" /></div>}
          {ordError && <div className="alert alert-error">{ordError}</div>}

          {!ordLoading && orders.length === 0 && (
            <div className="empty-state"><p>No orders yet.</p></div>
          )}

          {!ordLoading && orders.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <code>#{o._id.slice(-8).toUpperCase()}</code>
                      </td>
                      <td>
                        {o.user?.name ?? 'Unknown'}<br />
                        <small>{o.user?.email}</small>
                      </td>
                      <td>
                        {new Date(o.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td>${o.totalPrice.toFixed(2)}</td>
                      <td>{o.paymentStatus}</td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          style={{
                            color: STATUS_COLOR[o.status],
                            fontWeight: 600,
                            borderColor: STATUS_COLOR[o.status],
                          }}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
