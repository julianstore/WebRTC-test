import React from 'react';

interface AuthContextType {
  account: any;
  isAuthenticated: boolean;
  signin: (account: any, callback: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

const AuthContext = React.createContext<AuthContextType>(null!);

export default AuthContext;
