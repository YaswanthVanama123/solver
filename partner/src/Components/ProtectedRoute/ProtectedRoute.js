import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Cookie from 'js-cookie';
import axios from 'axios';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const jwtToken = Cookie.get('pcs');

    const authenticate = async () => {
      if (!jwtToken) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/api/worker/authenticate', {}, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      }
    };

    authenticate();
  }, []);

  if (isAuthenticated === null) {
    return null; // Or a loading spinner while checking the authentication status
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
