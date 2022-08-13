import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from './Header';
import AuthContext from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = (props: PageContainerProps) => {
  const { children } = props;
  const { isAuthenticated } = React.useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Helmet>
        <title>Home - Applications</title>
      </Helmet>
      <Header></Header>
      {children}
    </>
  );
};