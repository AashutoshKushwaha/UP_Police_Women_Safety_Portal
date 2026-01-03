import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../api/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { auth } = useContext(AuthContext);

  if (!auth?.token) {
    return <Navigate to="/" />;
  }
  if (roles && !roles.includes(auth.role)) {
    return <Navigate to="/" />;
  }
  return children;
}
//Aashutosh Kushwaha ,IIT KANPUR