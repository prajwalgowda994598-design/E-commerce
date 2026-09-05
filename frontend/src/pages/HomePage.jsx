import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (searchInput === search) return undefined;
    const timer = window.setTimeout(() => updateParam('search', searchInput), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <h1>Discover Our Collection</h1>
        <p>Quality products, fast delivery, unbeatable prices.</p>
      </section>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="search"
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-input"
        />
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="category-select"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Results info */}
      {!loading && !error && (
        <p className="results-info">
          {pagination.total === 0
            ? 'No products found'
            : `Showing ${products.length} of ${pagination.total} products`}
        </p>
      )}

      {/* States */}
      {loading && (
        <div className="product-grid skeleton-grid" aria-label="Loading products">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="skeleton-card" key={index}>
              <div className="skeleton skeleton-image" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          ))}
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Grid */}
      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <p>No products match your search.</p>
          <button className="btn-secondary" onClick={() => setSearchParams({})}>
            Clear filters
          </button>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product._id}>
              <Link to={`/products/${product._id}`}>
                <div className="product-img-wrap">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>
                <div className="product-card-body">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-footer">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    {product.stockQuantity === 0 && (
                      <span className="out-of-stock">Out of stock</span>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="btn-secondary"
            disabled={page <= 1}
            onClick={() => updateParam('page', String(page - 1))}
          >
            ← Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="btn-secondary"
            disabled={page >= pagination.pages}
            onClick={() => updateParam('page', String(page + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
