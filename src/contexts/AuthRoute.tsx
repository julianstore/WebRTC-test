import React from 'react';
import { Redirect } from 'react-router-dom';

import AuthContext from './AuthContext';

const useAuth = () => {
  return React.useContext(AuthContext);
};

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();
  //   const location = useLocation();
  if (!auth.isAuthenticated) {
    return <Redirect to="/home" />;
  }
  return children;
};

export default AuthRoute;
