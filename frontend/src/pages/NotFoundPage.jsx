import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="empty-state" style={{ marginTop: '6rem' }}>
      <h1 style={{ fontSize: '4rem' }}>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="btn-primary">
        Back to shop
      </Link>
    </div>
  );
}
