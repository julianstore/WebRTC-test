import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

import AuthContext from './AuthContext';

const useAuth = () => {
  return React.useContext(AuthContext);
};

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

export default AuthRoute;
