import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const hasExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('shopUser');
      const parsed = stored ? JSON.parse(stored) : null;
      return parsed?.token && !hasExpired(parsed.token) ? parsed : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    if (user) {
      localStorage.setItem('shopUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('shopUser');
    }
  }, [user]);

  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('shop-auth-expired', handleExpired);
    return () => window.removeEventListener('shop-auth-expired', handleExpired);
  }, []);

  const login = (userData) => setUser(userData);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, token: user?.token ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
