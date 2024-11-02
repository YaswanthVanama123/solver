import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Cookie from 'js-cookie';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const jwtToken = Cookie.get('cs');
    setIsAuthenticated(!!jwtToken);
  }, []);

  if (isAuthenticated === null) {
    return null; // Or a loading spinner while checking the authentication status
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
