import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product._id, quantity);
      setAddedMsg('Added to cart!');
      showToast('Added to cart');
      setTimeout(() => setAddedMsg(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add to cart');
    }
  };

  if (loading) {
    return <div className="page"><div className="product-detail skeleton-grid">
      <div className="skeleton skeleton-image" />
      <div><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>
    </div></div>;
  }
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!product) return null;

  const inStock = product.stockQuantity > 0;

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to shop</Link>
      <div className="product-detail">
        <div className="product-detail-image">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/600x450?text=No+Image'}
            alt={product.name}
          />
        </div>

        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-price">${product.price.toFixed(2)}</p>

          <p className="detail-description">{product.description}</p>

          <p className={`stock-status ${inStock ? 'in-stock' : 'no-stock'}`}>
            {inStock ? `In stock (${product.stockQuantity} available)` : 'Out of stock'}
          </p>

          {inStock && (
            <div className="qty-row">
              <label htmlFor="qty">Quantity</label>
              <div className="qty-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        product.stockQuantity,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                />
                <button
                  className="qty-btn"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                  }
                  disabled={quantity >= product.stockQuantity}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {addedMsg && <div className="alert alert-success">{addedMsg}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="detail-actions">
            <button
              className="btn-primary"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              {inStock ? 'Add to cart' : 'Out of stock'}
            </button>
            {user && (
              <Link to="/cart" className="btn-secondary">
                View cart
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
