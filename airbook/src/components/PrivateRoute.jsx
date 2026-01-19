// components/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loading from './Loading';

function PrivateRoute({ children }) {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />;
  }

  if (!token || !user || user.user_type !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export { AdminRoute,PrivateRoute};