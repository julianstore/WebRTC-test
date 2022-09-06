import React from 'react';

interface AuthContextType {
  account: any;
  isAuthenticated: boolean;
  signIn: (account: any, callback: VoidFunction) => void;
  signOut: (callback: VoidFunction) => void;
}

const AuthContext = React.createContext<AuthContextType>(null!);

export default AuthContext;
