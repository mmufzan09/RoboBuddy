import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ condition, redirectPath, children }) => {
  return condition ? children : <Navigate to={redirectPath} />;
};

export default ProtectedRoute;