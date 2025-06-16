import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  // Initialize token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Initialize user from localStorage, parsing JSON if it exists
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      return null;
    }
  });

  useEffect(() => {
    // Sync token and user to localStorage
    if (token && user) {
      localStorage.setItem('token', token);
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to store user in localStorage:', error);
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded. Clearing user data.');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, [token, user]); // Depend on both token and user to avoid partial updates

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}