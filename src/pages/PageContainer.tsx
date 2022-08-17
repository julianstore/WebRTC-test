import React, { useEffect } from 'react';
import { Header } from './Header';
import AuthContext from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = (props: PageContainerProps) => {
  const { children } = props;
  const { isAuthenticated } = React.useContext(AuthContext);
  const history = useHistory();
  useEffect(() => {
    // if (!isAuthenticated) history.push('/home');
  }, [isAuthenticated, history]);

  return (
    <>
      <Header></Header>
      {children}
    </>
  );
};
